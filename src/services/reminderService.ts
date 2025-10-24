/**
 * Payment Reminder Service
 *
 * Features:
 * - Auto-reminder scheduling after X days
 * - Smart reminder timing (not weekends, not late night)
 * - Reminder templates with friendly tone
 * - AsyncStorage-based persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Bill, Participant } from '@/types';
import { PaymentStatus } from '@/types';

const REMINDERS_STORAGE_KEY = '@vasooly/reminders';

export interface ReminderConfig {
  billId: string;
  participantId: string;
  participantName: string;
  participantPhone?: string;
  billTitle: string;
  amountPaise: number;
  scheduledDate: Date;
  isSent: boolean;
  sentAt?: Date;
}

export interface ReminderSettings {
  enabled: boolean;
  daysAfterBillCreation: number; // Default: 3 days
  avoidWeekends: boolean; // Default: true
  avoidLateNight: boolean; // Default: true (no reminders between 10 PM - 9 AM)
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  daysAfterBillCreation: 3,
  avoidWeekends: true,
  avoidLateNight: true,
};

/**
 * Load reminder settings
 */
export async function loadReminderSettings(): Promise<ReminderSettings> {
  try {
    const stored = await AsyncStorage.getItem(`${REMINDERS_STORAGE_KEY}_settings`);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load reminder settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save reminder settings
 */
export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(`${REMINDERS_STORAGE_KEY}_settings`, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save reminder settings:', error);
  }
}

/**
 * Calculate optimal reminder date based on settings
 */
function calculateReminderDate(
  billCreatedAt: Date,
  settings: ReminderSettings
): Date {
  let reminderDate = new Date(billCreatedAt);
  reminderDate.setDate(reminderDate.getDate() + settings.daysAfterBillCreation);

  // Avoid weekends if enabled
  if (settings.avoidWeekends) {
    const dayOfWeek = reminderDate.getDay();
    if (dayOfWeek === 0) {
      // Sunday -> Monday
      reminderDate.setDate(reminderDate.getDate() + 1);
    } else if (dayOfWeek === 6) {
      // Saturday -> Monday
      reminderDate.setDate(reminderDate.getDate() + 2);
    }
  }

  // Set to a reasonable time (11 AM) if avoiding late night
  if (settings.avoidLateNight) {
    reminderDate.setHours(11, 0, 0, 0);
  }

  return reminderDate;
}

/**
 * Schedule reminders for a bill
 */
export async function scheduleRemindersForBill(
  bill: Bill,
  currentUserName: string
): Promise<ReminderConfig[]> {
  const settings = await loadReminderSettings();

  if (!settings.enabled) {
    return [];
  }

  const reminders: ReminderConfig[] = [];

  // Get pending participants (excluding current user)
  const pendingParticipants = bill.participants.filter(p => {
    if (p.status !== PaymentStatus.PENDING) return false;
    const trimmedName = p.name.trim();
    if (trimmedName === '' || trimmedName.toLowerCase() === 'you') return false;
    if (trimmedName.toLowerCase() === currentUserName.toLowerCase()) return false;
    return true;
  });

  // Schedule reminder for each pending participant
  for (const participant of pendingParticipants) {
    const reminderDate = calculateReminderDate(bill.createdAt, settings);

    reminders.push({
      billId: bill.id,
      participantId: participant.id,
      participantName: participant.name,
      participantPhone: participant.phone,
      billTitle: bill.title,
      amountPaise: participant.amountPaise,
      scheduledDate: reminderDate,
      isSent: false,
    });
  }

  // Save reminders
  await saveReminders(reminders);

  return reminders;
}

/**
 * Get all scheduled reminders
 */
export async function loadReminders(): Promise<ReminderConfig[]> {
  try {
    const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((r: ReminderConfig) => ({
        ...r,
        scheduledDate: new Date(r.scheduledDate),
        sentAt: r.sentAt ? new Date(r.sentAt) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to load reminders:', error);
    return [];
  }
}

/**
 * Save reminders to storage
 */
async function saveReminders(reminders: ReminderConfig[]): Promise<void> {
  try {
    const existing = await loadReminders();

    // Merge with existing (avoid duplicates)
    const merged = [...existing];

    for (const newReminder of reminders) {
      const exists = merged.some(
        r => r.billId === newReminder.billId && r.participantId === newReminder.participantId
      );

      if (!exists) {
        merged.push(newReminder);
      }
    }

    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to save reminders:', error);
  }
}

/**
 * Get due reminders (not sent and scheduled date has passed)
 */
export async function getDueReminders(): Promise<ReminderConfig[]> {
  const allReminders = await loadReminders();
  const now = new Date();

  return allReminders.filter(r => {
    if (r.isSent) return false;
    return r.scheduledDate <= now;
  });
}

/**
 * Mark reminder as sent
 */
export async function markReminderAsSent(
  billId: string,
  participantId: string
): Promise<void> {
  try {
    const reminders = await loadReminders();
    const updated = reminders.map(r => {
      if (r.billId === billId && r.participantId === participantId) {
        return {
          ...r,
          isSent: true,
          sentAt: new Date(),
        };
      }
      return r;
    });

    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark reminder as sent:', error);
  }
}

/**
 * Cancel reminders for a bill (when bill is deleted or settled)
 */
export async function cancelRemindersForBill(billId: string): Promise<void> {
  try {
    const reminders = await loadReminders();
    const filtered = reminders.filter(r => r.billId !== billId);
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Cancel reminder for specific participant
 */
export async function cancelReminderForParticipant(
  billId: string,
  participantId: string
): Promise<void> {
  try {
    const reminders = await loadReminders();
    const filtered = reminders.filter(
      r => !(r.billId === billId && r.participantId === participantId)
    );
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to cancel reminder:', error);
  }
}

/**
 * Friendly reminder message templates
 */
export function getReminderMessageTemplate(
  participantName: string,
  billTitle: string,
  amountPaise: number,
  upiName: string,
  vpa: string
): string {
  const amountRupees = (amountPaise / 100).toFixed(2);

  const templates = [
    `Hey ${participantName}! 👋\n\nFriendly reminder about the ${billTitle} - ₹${amountRupees}.\n\nNo rush, just wanted to check in! 😊\n\nYou can pay here:\n${vpa}\n(${upiName})`,

    `Hi ${participantName}! 🙂\n\nHope you're doing well! Just a gentle reminder about ${billTitle} - ₹${amountRupees}.\n\nWhenever you get a chance!\n\nPayment: ${vpa}\n(${upiName})`,

    `Hello ${participantName}!\n\nQuick reminder about our ${billTitle} split - ₹${amountRupees}.\n\nThanks in advance! 🙏\n\nUPI: ${vpa}\n(${upiName})`,
  ];

  // Random template for variety
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(): Promise<{
  totalScheduled: number;
  sent: number;
  pending: number;
  overdue: number;
}> {
  const reminders = await loadReminders();
  const now = new Date();

  const sent = reminders.filter(r => r.isSent).length;
  const pending = reminders.filter(r => !r.isSent && r.scheduledDate > now).length;
  const overdue = reminders.filter(r => !r.isSent && r.scheduledDate <= now).length;

  return {
    totalScheduled: reminders.length,
    sent,
    pending,
    overdue,
  };
}
