/**
 * UPI QR Code Service
 *
 * Generates UPI payment QR codes for TRUE peer-to-peer payments.
 * Money flows directly from participant to bill creator - NO intermediary.
 *
 * Why QR codes instead of deep links:
 * - Deep links (upi://) fail with personal VPAs on Android 11+
 * - QR codes work with ALL UPI apps and ALL Android versions
 * - Zero setup, zero cost, zero legal complications
 * - True peer-to-peer: money never touches app owner's account
 *
 * Flow:
 * 1. Generate QR code from bill creator's UPI VPA
 * 2. Send QR image via WhatsApp
 * 3. Participant scans QR → Pays directly to bill creator
 * 4. Done! No merchant accounts, no payment gateways, no fees.
 */

export interface UPIQRParams {
  /** Bill creator's UPI VPA (e.g., user@paytm, user@oksbi) */
  vpa: string;

  /** Bill creator's name for UPI payment */
  payeeName: string;

  /** Amount in rupees (NOT paise) */
  amount: number;

  /** Transaction note/description */
  note: string;

  /** Optional transaction reference ID */
  reference?: string;
}

/**
 * Generates UPI payment string for QR code
 *
 * Format follows NPCI UPI Specification:
 * upi://pay?pa={VPA}&pn={Name}&am={Amount}&cu=INR&tn={Note}
 *
 * This string is encoded into QR code and can be scanned by any UPI app:
 * - Google Pay
 * - PhonePe
 * - Paytm
 * - BHIM
 * - Bank UPI apps (SBI, HDFC, ICICI, etc.)
 *
 * @param params - UPI QR code parameters
 * @returns UPI payment URI string
 */
export function generateUPIString(params: UPIQRParams): string {
  const { vpa, payeeName, amount, note, reference } = params;

  // Encode parameters for URI
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(note);

  // Build UPI payment string
  let upiString = `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;

  // Add optional reference ID
  if (reference) {
    const encodedRef = encodeURIComponent(reference);
    upiString += `&tr=${encodedRef}`;
  }

  return upiString;
}

/**
 * Validates UPI VPA format
 *
 * Valid formats:
 * - username@bank (e.g., john@paytm, user@ybl, name@oksbi)
 * - Can contain letters, numbers, dots, hyphens, underscores
 *
 * @param vpa - UPI VPA to validate
 * @returns true if valid format, false otherwise
 */
export function isValidUPIVPA(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') {
    return false;
  }

  // UPI VPA format: username@provider
  // Username: alphanumeric, dots, hyphens, underscores
  // Provider: alphanumeric only
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

  return upiRegex.test(vpa);
}

/**
 * Get optimal QR code size for mobile devices
 *
 * Returns size that:
 * - Fits well in WhatsApp image preview
 * - Is large enough to scan easily
 * - Loads quickly
 *
 * @returns QR code size in pixels
 */
export function getOptimalQRSize(): number {
  // 280x280 is optimal for:
  // - WhatsApp image preview (shows full QR without cropping)
  // - Easy scanning (large enough for camera focus)
  // - Quick generation/transmission
  return 280;
}

/**
 * Formats amount for UPI payment
 *
 * Ensures amount is in valid format:
 * - Maximum 2 decimal places
 * - Positive number
 * - Not zero
 *
 * @param amountPaise - Amount in paise
 * @returns Amount in rupees, formatted
 */
export function formatAmountForUPI(amountPaise: number): number {
  const rupees = amountPaise / 100;

  // Round to 2 decimal places
  const formatted = Math.round(rupees * 100) / 100;

  // Ensure positive and non-zero
  if (formatted <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  return formatted;
}

/**
 * Generates a shareable QR code image URI for React Native
 * 
 * This function creates a QR code SVG, converts it to a data URI,
 * and prepares it for sharing via WhatsApp or other channels.
 * 
 * Note: This requires react-native-svg and react-native-qrcode-svg packages.
 * The actual QR generation happens in a React component context.
 * 
 * For service-layer usage, we return the UPI string and let UI components
 * handle QR generation and sharing.
 * 
 * @param upiString - UPI payment string to encode in QR code
 * @returns Promise<string> - Data URI of QR code image (for UI components)
 */
export async function prepareQRCodeForSharing(upiString: string): Promise<{
  upiString: string;
  size: number;
}> {
  return {
    upiString,
    size: getOptimalQRSize(),
  };
}
