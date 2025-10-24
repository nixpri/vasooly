/**
 * WhatsApp Service
 *
 * Handles sending payment requests via WhatsApp deep links.
 * Replaces generic share functionality with WhatsApp-first approach.
 *
 * Features:
 * - Direct WhatsApp deep linking
 * - Phone number validation and formatting
 * - Sequential batch sending with progress tracking
 * - Haptic feedback for better user experience
 * - Batch completion summary notifications
 * - Error handling for WhatsApp not installed
 * - Integration with URL shortener for clean messages
 */

import { Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Bill, Participant } from '../types';
import { shortenUrl } from './urlShortenerService';
import { generateUPILink } from '../lib/business/upiGenerator';

export interface WhatsAppResult {
  success: boolean;
  participantName: string;
  error?: string;
}

export interface BatchSendResult {
  totalSent: number;
  totalFailed: number;
  results: WhatsAppResult[];
}

/**
 * Validates and formats phone number for WhatsApp
 *
 * @param phone - Phone number to format
 * @returns Formatted phone number with +91 prefix or null if invalid
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present (common in Indian phone numbers from contacts)
  // 0XXXXXXXXXX -> XXXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Check if it's a valid Indian phone number (10 digits)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // Already has country code (11-12 digits with 91 prefix)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // Has + prefix but digits removed
  if (cleaned.length === 12) {
    return `+${cleaned}`;
  }

  console.warn('Invalid phone number format:', phone);
  return null;
}

/**
 * Generates payment request message for WhatsApp
 *
 * @param participantName - Name of the participant
 * @param billTitle - Bill title
 * @param amountPaise - Amount in paise
 * @param shortUrl - Shortened UPI payment link
 * @returns Formatted message string
 */
function generatePaymentMessage(
  participantName: string,
  billTitle: string,
  amountPaise: number,
  shortUrl: string
): string {
  const amount = (amountPaise / 100).toFixed(2);

  // Truncate bill title if too long (max 30 chars for clean message)
  const truncatedTitle = billTitle.length > 30
    ? `${billTitle.substring(0, 27)}...`
    : billTitle;

  return `Hi ${participantName}! 💸
Pay ₹${amount} for ${truncatedTitle}

👉 Tap here to pay instantly:
${shortUrl}

- Vasooly`;
}

/**
 * Generates reminder message for pending payments
 *
 * @param participantName - Name of the participant
 * @param pendingBills - Array of pending bills with amounts and URLs
 * @returns Formatted reminder message
 */
function generateReminderMessage(
  participantName: string,
  pendingBills: Array<{ title: string; amountPaise: number; shortUrl: string }>
): string {
  const totalPaise = pendingBills.reduce((sum, bill) => sum + bill.amountPaise, 0);
  const totalAmount = (totalPaise / 100).toFixed(2);
  const count = pendingBills.length;

  let message = `Hi ${participantName}! 🔔\n${count} pending payment${count > 1 ? 's' : ''} (₹${totalAmount}):\n`;

  pendingBills.forEach((bill, index) => {
    const amount = (bill.amountPaise / 100).toFixed(2);
    const truncatedTitle = bill.title.length > 20
      ? `${bill.title.substring(0, 17)}...`
      : bill.title;
    message += `\n• ${truncatedTitle}: ₹${amount}\n👉 Pay now: ${bill.shortUrl}`;

    // Add spacing between bills if not last
    if (index < pendingBills.length - 1) {
      message += '\n';
    }
  });

  message += '\n\n- Vasooly';

  return message;
}

/**
 * Checks if WhatsApp is installed on the device
 *
 * @returns Whether WhatsApp is available
 */
export async function isWhatsAppInstalled(): Promise<boolean> {
  try {
    const whatsappUrl = 'whatsapp://send';
    return await Linking.canOpenURL(whatsappUrl);
  } catch (error) {
    console.error('Error checking WhatsApp availability:', error);
    return false;
  }
}

/**
 * Sends payment request to a single participant via WhatsApp
 *
 * @param participant - Participant to send request to
 * @param bill - Bill details
 * @param upiVPA - UPI VPA for payment collection
 * @param upiName - Name for UPI payment
 * @returns WhatsAppResult indicating success/failure
 */
export async function sendPaymentRequest(
  participant: Participant,
  bill: Bill,
  upiVPA: string,
  upiName: string
): Promise<WhatsAppResult> {
  try {
    // Validate phone number
    if (!participant.phone) {
      return {
        success: false,
        participantName: participant.name,
        error: 'No phone number',
      };
    }

    const formattedPhone = formatPhoneNumber(participant.phone);
    if (!formattedPhone) {
      return {
        success: false,
        participantName: participant.name,
        error: 'Invalid phone number format',
      };
    }

    // Check WhatsApp availability
    const whatsappAvailable = await isWhatsAppInstalled();
    if (!whatsappAvailable) {
      return {
        success: false,
        participantName: participant.name,
        error: 'WhatsApp not installed',
      };
    }

    // Generate UPI link
    const upiResult = generateUPILink({
      pa: upiVPA,
      pn: upiName,
      am: participant.amountPaise / 100,
      tn: `Payment for ${bill.title} - ${participant.name}`,
      tr: `BILL-${bill.id}-${participant.id}-${Date.now()}`,
    });

    // Shorten URL
    const shortenResult = await shortenUrl(upiResult.standardUri);
    const urlToUse = shortenResult.success ? shortenResult.shortUrl : upiResult.standardUri;

    // Generate message
    const message = generatePaymentMessage(
      participant.name,
      bill.title,
      participant.amountPaise,
      urlToUse
    );

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;

    // Haptic feedback before opening WhatsApp
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Open WhatsApp
    await Linking.openURL(whatsappUrl);

    return {
      success: true,
      participantName: participant.name,
    };
  } catch (error) {
    console.error('Error sending payment request:', error);
    return {
      success: false,
      participantName: participant.name,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sends payment requests to multiple participants sequentially
 *
 * Opens WhatsApp for each participant one by one with haptic feedback and progress tracking.
 * Shows completion summary when all messages are sent.
 *
 * @param participants - Array of participants to send requests to
 * @param bill - Bill details
 * @param upiVPA - UPI VPA for payment collection
 * @param upiName - Name for UPI payment
 * @param onProgress - Optional callback for progress updates (current, total, participantName, status)
 * @returns BatchSendResult with success/failure counts
 */
export async function sendPaymentRequestsToAll(
  participants: Participant[],
  bill: Bill,
  upiVPA: string,
  upiName: string,
  onProgress?: (current: number, total: number, participantName: string, status?: 'sending' | 'success' | 'failed') => void
): Promise<BatchSendResult> {
  const results: WhatsAppResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Filter out participants who already paid
  const pendingParticipants = participants.filter(p => p.status !== 'PAID');
  const totalPending = pendingParticipants.length;

  // Haptic feedback at start of batch send
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  for (let i = 0; i < pendingParticipants.length; i++) {
    const participant = pendingParticipants[i];

    // Report progress - sending
    if (onProgress) {
      onProgress(i + 1, totalPending, participant.name, 'sending');
    }

    // Send request
    const result = await sendPaymentRequest(participant, bill, upiVPA, upiName);
    results.push(result);

    if (result.success) {
      totalSent++;
      // Light haptic for each successful send
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Report progress - success
      if (onProgress) {
        onProgress(i + 1, totalPending, participant.name, 'success');
      }
    } else {
      totalFailed++;
      // Error haptic for failed send
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Report progress - failed
      if (onProgress) {
        onProgress(i + 1, totalPending, participant.name, 'failed');
      }
    }

    // Delay between sends to avoid overwhelming the user
    if (i < pendingParticipants.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Completion haptic feedback
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  // Show completion summary
  setTimeout(() => {
    const message = totalFailed === 0
      ? `All ${totalSent} payment requests sent successfully! 🎉`
      : `Sent ${totalSent} requests. ${totalFailed} failed - check phone numbers and try again.`;

    Alert.alert(
      totalFailed === 0 ? '✓ Batch Send Complete' : '⚠️ Batch Send Completed',
      message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }, 500);

  return {
    totalSent,
    totalFailed,
    results,
  };
}

/**
 * Sends reminder for pending payments via WhatsApp
 *
 * @param participantName - Name of the participant
 * @param participantPhone - Phone number of the participant
 * @param pendingBills - Array of pending bills
 * @param upiVPA - UPI VPA for payment collection
 * @param upiName - Name for UPI payment
 * @returns WhatsAppResult indicating success/failure
 */
export async function sendPaymentReminder(
  participantName: string,
  participantPhone: string,
  pendingBills: Bill[],
  upiVPA: string,
  upiName: string
): Promise<WhatsAppResult> {
  try {
    // Validate phone number
    const formattedPhone = formatPhoneNumber(participantPhone);
    if (!formattedPhone) {
      return {
        success: false,
        participantName,
        error: 'Invalid phone number format',
      };
    }

    // Check WhatsApp availability
    const whatsappAvailable = await isWhatsAppInstalled();
    if (!whatsappAvailable) {
      return {
        success: false,
        participantName,
        error: 'WhatsApp not installed',
      };
    }

    // Generate UPI links and shorten them for each pending bill
    const billsWithUrls = await Promise.all(
      pendingBills.map(async (bill) => {
        const participant = bill.participants.find(
          (p) => p.name.toLowerCase() === participantName.toLowerCase()
        );

        if (!participant) {
          return null;
        }

        const upiResult = generateUPILink({
          pa: upiVPA,
          pn: upiName,
          am: participant.amountPaise / 100,
          tn: `Payment for ${bill.title} - ${participantName}`,
          tr: `REMIND-${bill.id}-${participant.id}-${Date.now()}`,
        });

        const shortenResult = await shortenUrl(upiResult.standardUri);
        const shortUrl = shortenResult.success ? shortenResult.shortUrl : upiResult.standardUri;

        return {
          title: bill.title,
          amountPaise: participant.amountPaise,
          shortUrl,
        };
      })
    );

    // Filter out null entries
    const validBills = billsWithUrls.filter((b) => b !== null) as Array<{
      title: string;
      amountPaise: number;
      shortUrl: string;
    }>;

    if (validBills.length === 0) {
      return {
        success: false,
        participantName,
        error: 'No pending bills found',
      };
    }

    // Generate reminder message
    const message = generateReminderMessage(participantName, validBills);

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;

    // Haptic feedback before opening WhatsApp
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Open WhatsApp
    await Linking.openURL(whatsappUrl);

    return {
      success: true,
      participantName,
    };
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return {
      success: false,
      participantName,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Shows error message to user when WhatsApp is not installed
 */
export function showWhatsAppNotInstalledError(): void {
  Alert.alert(
    'WhatsApp Not Installed',
    'WhatsApp is required to send payment requests. Please install WhatsApp from the App Store or Play Store.',
    [{ text: 'OK' }]
  );
}

/**
 * Shows error message when phone number is invalid
 *
 * @param participantName - Name of the participant with invalid phone
 */
export function showInvalidPhoneError(participantName: string): void {
  Alert.alert(
    'Invalid Phone Number',
    `The phone number for ${participantName} is invalid. Please update it from contacts and try again.`,
    [{ text: 'OK' }]
  );
}
