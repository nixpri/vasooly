/**
 * Share Service
 *
 * Handles sharing UPI payment links and bill details via:
 * - WhatsApp
 * - SMS
 * - Generic share dialog
 *
 * Features:
 * - Platform-specific share handling
 * - Message template generation
 * - Share cancellation handling
 * - Error recovery
 */

import * as Sharing from 'expo-sharing';
import { Platform, Linking } from 'react-native';
import type { Bill, Participant } from '../types';

export interface ShareResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

export interface ShareOptions {
  message: string;
  title?: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Generate payment request message for a participant
 *
 * @param bill Bill details
 * @param participant Participant details
 * @param upiLink UPI payment link
 * @returns Formatted message string
 */
export function generatePaymentMessage(
  bill: Bill,
  participant: Participant,
  upiLink: string
): string {
  const amount = (participant.amountPaise / 100).toFixed(2);

  return `Hi! 👋

You owe ₹${amount} for "${bill.title}".

Pay now using this link:
${upiLink}

Thanks! 🙏`;
}

/**
 * Generate settlement reminder message
 *
 * @param bill Bill details
 * @param pendingParticipants Array of pending participants
 * @param upiLink Optional UPI link
 * @returns Formatted message string
 */
export function generateReminderMessage(
  bill: Bill,
  pendingParticipants: Participant[],
  upiLink?: string
): string {
  const pendingNames = pendingParticipants.map((p) => p.name).join(', ');
  const totalPending = pendingParticipants.reduce(
    (sum, p) => sum + p.amountPaise,
    0
  );
  const amount = (totalPending / 100).toFixed(2);

  let message = `Reminder: Bill "${bill.title}" 💰

Pending payments from: ${pendingNames}
Total pending: ₹${amount}`;

  if (upiLink) {
    message += `\n\nPay now:\n${upiLink}`;
  }

  return message;
}

/**
 * Generate bill summary message for sharing
 *
 * @param bill Bill details
 * @returns Formatted summary string
 */
export function generateBillSummary(bill: Bill): string {
  const total = (bill.totalAmountPaise / 100).toFixed(2);
  const participants = bill.participants.map((p) => {
    const amount = (p.amountPaise / 100).toFixed(2);
    const status = p.status === 'PAID' ? '✅' : '⏳';
    return `${status} ${p.name}: ₹${amount}`;
  });

  return `Bill: ${bill.title} 📝
Total: ₹${total}
Split ${bill.participants.length} ways

${participants.join('\n')}

Created with Vasooly 💜`;
}

/**
 * Check if sharing is available on the device
 *
 * @returns Whether sharing is supported
 */
export async function isSharingAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch (error) {
    console.error('Error checking sharing availability:', error);
    return false;
  }
}

/**
 * Share content using the native share dialog
 *
 * @param options Share options
 * @returns ShareResult
 */
export async function shareContent(
  options: ShareOptions
): Promise<ShareResult> {
  try {
    const available = await isSharingAvailable();

    if (!available) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    // On iOS and Android, use the native share dialog
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Create a temporary text file to share (Expo Sharing requires a file URI)
      // For text sharing, we'll use URL scheme fallback instead
      return await shareViaUrlScheme(options);
    }

    return {
      success: false,
      error: 'Sharing not supported on this platform',
    };
  } catch (error) {
    console.error('Error sharing content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * Share via URL scheme (fallback for text sharing)
 *
 * @param options Share options
 * @returns ShareResult
 */
async function shareViaUrlScheme(
  options: ShareOptions
): Promise<ShareResult> {
  try {
    // Try to use the Share API if available (React Native 0.60+)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const Share = require('react-native').Share;

      const result = await Share.share(
        {
          message: options.message,
          title: options.title,
          url: options.url,
        },
        {
          dialogTitle: options.dialogTitle || 'Share via',
        }
      );

      if (result.action === Share.dismissedAction) {
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: true,
      };
    }

    return {
      success: false,
      error: 'Share not available',
    };
  } catch (error) {
    console.error('Error in shareViaUrlScheme:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share',
    };
  }
}

/**
 * Share via WhatsApp
 *
 * @param message Message to share
 * @param phoneNumber Optional phone number (without country code symbols)
 * @returns ShareResult
 */
export async function shareViaWhatsApp(
  message: string,
  phoneNumber?: string
): Promise<ShareResult> {
  try {
    const encodedMessage = encodeURIComponent(message);
    let url: string;

    if (phoneNumber) {
      // Share to specific contact
      // Remove all non-numeric characters
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      url = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
    } else {
      // Open WhatsApp with message
      url = `whatsapp://send?text=${encodedMessage}`;
    }

    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      return {
        success: false,
        error: 'WhatsApp is not installed on this device',
      };
    }

    await Linking.openURL(url);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share via WhatsApp',
    };
  }
}

/**
 * Share via SMS
 *
 * @param message Message to share
 * @param phoneNumber Optional phone number
 * @returns ShareResult
 */
export async function shareViaSMS(
  message: string,
  phoneNumber?: string
): Promise<ShareResult> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = phoneNumber
      ? `sms:${phoneNumber}${separator}body=${encodedMessage}`
      : `sms:${separator}body=${encodedMessage}`;

    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      return {
        success: false,
        error: 'SMS is not available on this device',
      };
    }

    await Linking.openURL(url);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sharing via SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share via SMS',
    };
  }
}

/**
 * Share payment link to a participant
 *
 * @param bill Bill details
 * @param participant Participant details
 * @param upiLink UPI payment link
 * @param method Share method ('whatsapp' | 'sms' | 'generic')
 * @returns ShareResult
 */
export async function sharePaymentLink(
  bill: Bill,
  participant: Participant,
  upiLink: string,
  method: 'whatsapp' | 'sms' | 'generic' = 'generic'
): Promise<ShareResult> {
  const message = generatePaymentMessage(bill, participant, upiLink);

  switch (method) {
    case 'whatsapp':
      return await shareViaWhatsApp(message);

    case 'sms':
      return await shareViaSMS(message);

    case 'generic':
    default:
      return await shareContent({
        message,
        title: `Payment Request: ${bill.title}`,
        dialogTitle: 'Share payment link',
      });
  }
}

/**
 * Share bill summary
 *
 * @param bill Bill details
 * @param method Share method
 * @returns ShareResult
 */
export async function shareBillSummary(
  bill: Bill,
  method: 'whatsapp' | 'sms' | 'generic' = 'generic'
): Promise<ShareResult> {
  const message = generateBillSummary(bill);

  switch (method) {
    case 'whatsapp':
      return await shareViaWhatsApp(message);

    case 'sms':
      return await shareViaSMS(message);

    case 'generic':
    default:
      return await shareContent({
        message,
        title: `Bill: ${bill.title}`,
        dialogTitle: 'Share bill summary',
      });
  }
}

/**
 * Get formatted error message for UI display
 *
 * @param result ShareResult
 * @returns User-friendly error message
 */
export function getShareErrorMessage(result: ShareResult): string {
  if (!result.error) return '';

  if (result.cancelled) {
    return 'Share cancelled';
  }

  return result.error;
}
