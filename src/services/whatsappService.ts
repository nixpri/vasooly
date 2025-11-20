/**
 * WhatsApp Service
 *
 * Handles sending payment requests via WhatsApp with UPI QR codes.
 * Enables TRUE peer-to-peer payments - money flows directly from participant to bill creator.
 *
 * Features:
 * - UPI QR code generation for direct payments
 * - Phone number validation and formatting
 * - Sequential batch sending with progress tracking
 * - Haptic feedback for better user experience
 * - Batch completion summary notifications
 * - Error handling for WhatsApp not installed
 * - QR code sharing via WhatsApp
 *
 * Why QR codes:
 * - UPI deep links fail with personal VPAs on Android 11+
 * - QR codes work with ALL UPI apps and ALL Android versions
 * - Zero setup, zero cost, zero legal complications
 * - True peer-to-peer: money never touches app owner's account
 */

import { Linking, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Share from 'react-native-share';
import type { Bill, Participant } from '../types';
import {
  generateUPIString,
  formatAmountForUPI,
  isValidUPIVPA,
  getOptimalQRSize,
} from './upiQRCodeService';
import { qrCodeService } from './qrCodeService';

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
 * Generates payment request message to accompany QR code
 *
 * @param participantName - Name of the participant
 * @param billTitle - Bill title
 * @param amountPaise - Amount in paise
 * @returns Formatted message string
 */
function generatePaymentMessage(
  participantName: string,
  billTitle: string,
  amountPaise: number
): string {
  const amount = (amountPaise / 100).toFixed(2);

  // Truncate bill title if too long (max 30 chars for clean message)
  const truncatedTitle = billTitle.length > 30
    ? `${billTitle.substring(0, 27)}...`
    : billTitle;

  return `Hi ${participantName}! 💸

Pay ₹${amount} for ${truncatedTitle}

📷 Scan the QR code to pay instantly with any UPI app

Works with GPay, PhonePe, Paytm, BHIM & all UPI apps

- Vasooly`;
}

/**
 * Generates reminder message for pending payments (with QR code)
 *
 * @param participantName - Name of the participant
 * @param pendingBills - Array of pending bills with amounts
 * @returns Formatted reminder message
 */
function generateReminderMessage(
  participantName: string,
  pendingBills: Array<{ title: string; amountPaise: number }>
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
    message += `\n• ${truncatedTitle}: ₹${amount}`;

    // Add spacing between bills if not last
    if (index < pendingBills.length - 1) {
      message += '\n';
    }
  });

  message += '\n\n📷 Scan the QR code(s) attached to pay instantly';
  message += '\n\n- Vasooly';

  return message;
}

/**
 * Generates QR code as base64 PNG data
 *
 * Uses react-native-qrcode-svg to generate base64 PNG data
 *
 * @param upiString - UPI payment string to encode
 * @returns Promise<string> - Base64 PNG data of QR code
 */
async function generateQRCodeBase64(upiString: string): Promise<string> {
  try {
    // Use QR code service which works with QRCodeManager component
    const base64Data = await qrCodeService.generateQRCode(upiString, getOptimalQRSize());
    return base64Data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Shares QR code with message to WhatsApp in a SINGLE message
 *
 * Uses react-native-share's shareSingle to combine text and image
 * in one WhatsApp message.
 *
 * Platform behavior:
 * - Android: Shows both message and QR image in single message ✅
 * - iOS: Shows message in caption and QR image ✅
 *
 * @param qrCodeBase64 - Base64 PNG data of QR code
 * @param phone - Phone number with country code (e.g., "+919876543210")
 * @param message - Payment context message
 * @returns Promise<boolean> - Success status
 */
async function shareQRCodeViaWhatsApp(
  qrCodeBase64: string,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    const shareOptions: any = {
      title: 'Payment Request',
      message: message,
      url: `data:image/png;base64,${qrCodeBase64}`,
      social: Share.Social.WHATSAPP,
      whatsAppNumber: phone.replace(/\D/g, ''), // Remove non-digits
      filename: 'payment_qr.png',
    };

    // iOS uses message as image caption in WhatsApp
    // Both platforms work with message included
    await Share.shareSingle(shareOptions);
    return true;
  } catch (error: any) {
    // User cancelled the share
    if (error.message && error.message.indexOf('User did not share') !== -1) {
      console.log('User cancelled share');
      return false;
    }

    console.error('Error sharing to WhatsApp:', error);

    // Show error to user
    Alert.alert(
      'Share Failed',
      'Could not share to WhatsApp. Please make sure WhatsApp is installed.',
      [{ text: 'OK' }]
    );

    return false;
  }
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
    // Validate UPI VPA
    if (!isValidUPIVPA(upiVPA)) {
      return {
        success: false,
        participantName: participant.name,
        error: 'Invalid UPI VPA format',
      };
    }

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

    // Format amount for UPI
    const amountRupees = formatAmountForUPI(participant.amountPaise);

    // Generate UPI payment string
    const upiString = generateUPIString({
      vpa: upiVPA,
      payeeName: upiName,
      amount: amountRupees,
      note: `Payment for ${bill.title} - ${participant.name}`,
      reference: `BILL-${bill.id}-${participant.id}-${Date.now()}`,
    });

    // Generate WhatsApp message
    const message = generatePaymentMessage(
      participant.name,
      bill.title,
      participant.amountPaise
    );

    // Generate QR code as base64
    const qrCodeBase64 = await generateQRCodeBase64(upiString);

    // Haptic feedback before sharing
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Share QR code with message to WhatsApp in single message
    const shared = await shareQRCodeViaWhatsApp(qrCodeBase64, formattedPhone, message);

    if (!shared) {
      return {
        success: false,
        participantName: participant.name,
        error: 'Failed to share QR code',
      };
    }

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
    // Validate UPI VPA
    if (!isValidUPIVPA(upiVPA)) {
      return {
        success: false,
        participantName,
        error: 'Invalid UPI VPA format',
      };
    }

    // Validate phone number
    const formattedPhone = formatPhoneNumber(participantPhone);
    if (!formattedPhone) {
      return {
        success: false,
        participantName,
        error: 'Invalid phone number format',
      };
    }

    // Generate QR codes for each pending bill
    const billsWithQRs = await Promise.all(
      pendingBills.map(async (bill) => {
        const participant = bill.participants.find(
          (p) => p.name.toLowerCase() === participantName.toLowerCase()
        );

        if (!participant) {
          return null;
        }

        // Format amount for UPI
        const amountRupees = formatAmountForUPI(participant.amountPaise);

        // Generate UPI payment string
        const upiString = generateUPIString({
          vpa: upiVPA,
          payeeName: upiName,
          amount: amountRupees,
          note: `Payment for ${bill.title} - ${participantName}`,
          reference: `REMIND-${bill.id}-${participant.id}-${Date.now()}`,
        });

        // Generate QR code as base64
        const qrCodeBase64 = await generateQRCodeBase64(upiString);

        return {
          title: bill.title,
          amountPaise: participant.amountPaise,
          qrCodeBase64,
        };
      })
    );

    // Filter out null entries
    const validBills = billsWithQRs.filter((b) => b !== null) as Array<{
      title: string;
      amountPaise: number;
      qrCodeBase64: string;
    }>;

    if (validBills.length === 0) {
      return {
        success: false,
        participantName,
        error: 'No pending bills found',
      };
    }

    // Generate reminder message
    const message = generateReminderMessage(
      participantName,
      validBills.map(b => ({ title: b.title, amountPaise: b.amountPaise }))
    );

    // Share first QR code (for simplicity, share one at a time)
    const firstQRBase64 = validBills[0].qrCodeBase64;

    // Haptic feedback before sharing
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Share QR code with message to WhatsApp
    const shared = await shareQRCodeViaWhatsApp(firstQRBase64, formattedPhone, message);

    if (!shared) {
      return {
        success: false,
        participantName,
        error: 'Failed to share QR code',
      };
    }

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
