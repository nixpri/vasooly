/**
 * UPI QR Code Generator
 *
 * Generates QR codes for UPI payment links using react-native-svg.
 * QR codes can be displayed in the app or saved as images.
 */

import { UPIPaymentParams, generateUPILink } from './upiGenerator';

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  /** QR code size in pixels (default: 256) */
  size?: number;

  /** Background color (default: white) */
  backgroundColor?: string;

  /** Foreground color (default: black) */
  foregroundColor?: string;

  /** Error correction level (default: M) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * QR code generation result
 */
export interface QRCodeResult {
  /** QR code data (UPI URI) */
  data: string;

  /** QR code size */
  size: number;

  /** Transaction reference ID */
  transactionRef: string;

  /** Display options */
  options: Required<QRCodeOptions>;
}

/**
 * Default QR code options
 */
const DEFAULT_QR_OPTIONS: Required<QRCodeOptions> = {
  size: 256,
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000',
  errorCorrectionLevel: 'M',
};

/**
 * Generates QR code data for UPI payment
 *
 * Creates a QR code compatible UPI URI that can be scanned by any UPI app.
 * The QR code follows NPCI specifications with proper encoding.
 *
 * @param params - UPI payment parameters
 * @param options - QR code display options
 * @returns QR code result ready for rendering
 * @throws Error if UPI link generation fails
 *
 * @example
 * ```typescript
 * import QRCode from 'react-native-qrcode-svg';
 *
 * const qrResult = generateQRCode({
 *   pa: 'merchant@paytm',
 *   pn: 'John Doe',
 *   am: 100.50,
 *   tn: 'Dinner bill split',
 * });
 *
 * // Render QR code
 * <QRCode
 *   value={qrResult.data}
 *   size={qrResult.size}
 *   backgroundColor={qrResult.options.backgroundColor}
 *   color={qrResult.options.foregroundColor}
 *   ecl={qrResult.options.errorCorrectionLevel}
 * />
 * ```
 */
export function generateQRCode(
  params: UPIPaymentParams,
  options?: QRCodeOptions
): QRCodeResult {
  // Generate UPI link
  const upiLink = generateUPILink(params);

  // Merge options with defaults
  const mergedOptions: Required<QRCodeOptions> = {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  };

  // Validate size
  if (mergedOptions.size < 100 || mergedOptions.size > 1000) {
    throw new Error('QR code size must be between 100 and 1000 pixels');
  }

  return {
    data: upiLink.qrCodeData,
    size: mergedOptions.size,
    transactionRef: upiLink.transactionRef,
    options: mergedOptions,
  };
}

/**
 * Generates QR code with custom branding colors
 *
 * Uses Vasooly brand colors for better visual integration.
 *
 * @param params - UPI payment parameters
 * @param size - QR code size (default: 256)
 * @returns Branded QR code result
 *
 * @example
 * ```typescript
 * const qrResult = generateBrandedQRCode({
 *   pa: 'merchant@paytm',
 *   pn: 'John Doe',
 *   am: 100.50,
 * }, 300);
 * ```
 */
export function generateBrandedQRCode(
  params: UPIPaymentParams,
  size: number = 256
): QRCodeResult {
  return generateQRCode(params, {
    size,
    backgroundColor: '#121212', // Dark background matching Vasooly theme
    foregroundColor: '#00D9FF', // Vasooly primary color
    errorCorrectionLevel: 'H', // High error correction for branding
  });
}

/**
 * Error correction level descriptions
 */
export const ERROR_CORRECTION_LEVELS = {
  L: { name: 'Low', recovery: '~7%' },
  M: { name: 'Medium', recovery: '~15%' },
  Q: { name: 'Quartile', recovery: '~25%' },
  H: { name: 'High', recovery: '~30%' },
} as const;

/**
 * Validates QR code data size
 *
 * QR codes have capacity limits based on error correction level.
 * This validates that the UPI URI will fit in a QR code.
 *
 * @param data - QR code data to validate
 * @param errorCorrectionLevel - Error correction level
 * @returns True if data will fit in QR code
 *
 * @example
 * ```typescript
 * const canFit = isQRCodeDataValid(upiUri, 'M');
 * if (!canFit) {
 *   console.error('UPI URI too long for QR code');
 * }
 * ```
 */
export function isQRCodeDataValid(
  data: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'
): boolean {
  // QR code capacity limits (Version 10, alphanumeric mode)
  const capacityLimits = {
    L: 468,
    M: 360,
    Q: 288,
    H: 224,
  };

  const limit = capacityLimits[errorCorrectionLevel];
  return data.length <= limit;
}
