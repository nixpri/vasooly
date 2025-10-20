/**
 * QR Code Service
 *
 * Generates QR codes for UPI payment links with branding
 * and customization options.
 *
 * Features:
 * - UPI payment QR code generation
 * - Customizable size and colors
 * - Error correction levels
 * - Branding support (logo overlay)
 * - SVG output for scalability
 */

import type { Bill, Participant } from '../types';

export interface QRCodeOptions {
  /**
   * Size of the QR code in pixels
   * @default 256
   */
  size?: number;

  /**
   * Background color
   * @default '#FFFFFF'
   */
  backgroundColor?: string;

  /**
   * Foreground color (QR code color)
   * @default '#000000'
   */
  color?: string;

  /**
   * Error correction level
   * @default 'M'
   */
  ecl?: 'L' | 'M' | 'Q' | 'H';

  /**
   * Logo image URI (optional)
   */
  logo?: string;

  /**
   * Logo size (percentage of QR code size)
   * @default 0.2 (20%)
   */
  logoSize?: number;

  /**
   * Logo background padding
   * @default 0
   */
  logoBackgroundPadding?: number;

  /**
   * Logo background color
   * @default '#FFFFFF'
   */
  logoBackgroundColor?: string;
}

export interface QRCodeData {
  /**
   * The data to encode in the QR code
   */
  value: string;

  /**
   * QR code options
   */
  options: QRCodeOptions;

  /**
   * Metadata for display
   */
  metadata?: {
    title?: string;
    description?: string;
    amount?: number;
  };
}

/**
 * Default QR code options for Vasooly branding
 */
export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  size: 256,
  backgroundColor: '#0A0A0F', // Dark theme background
  color: '#C2662D', // Terracotta accent
  ecl: 'M', // Medium error correction (15% damage recovery)
  logoSize: 0.2,
  logoBackgroundPadding: 10,
  logoBackgroundColor: '#0A0A0F',
};

/**
 * Generate QR code data for UPI payment link
 *
 * @param upiLink UPI payment link
 * @param bill Optional bill details for metadata
 * @param participant Optional participant details
 * @param options QR code customization options
 * @returns QR code data ready for rendering
 */
export function generateUPIQRCode(
  upiLink: string,
  bill?: Bill,
  participant?: Participant,
  options?: Partial<QRCodeOptions>
): QRCodeData {
  const qrOptions = {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  };

  const metadata = bill && participant
    ? {
        title: bill.title,
        description: `Payment for ${participant.name}`,
        amount: participant.amountPaise,
      }
    : undefined;

  return {
    value: upiLink,
    options: qrOptions,
    metadata,
  };
}

/**
 * Generate QR code data for bill sharing
 *
 * @param billId Bill ID for sharing
 * @param options QR code customization options
 * @returns QR code data
 */
export function generateBillSharingQRCode(
  billId: string,
  options?: Partial<QRCodeOptions>
): QRCodeData {
  const qrOptions = {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  };

  // For future deep linking support
  const value = `vasooly://bill/${billId}`;

  return {
    value,
    options: qrOptions,
    metadata: {
      title: 'Share Bill',
      description: 'Scan to view bill details',
    },
  };
}

/**
 * Generate batch QR codes for all participants
 *
 * @param bill Bill details
 * @param upiLinks Map of participant ID to UPI link
 * @param options QR code customization options
 * @returns Array of QR code data for each participant
 */
export function generateBatchQRCodes(
  bill: Bill,
  upiLinks: Map<string, string>,
  options?: Partial<QRCodeOptions>
): QRCodeData[] {
  return bill.participants.map((participant) => {
    const upiLink = upiLinks.get(participant.id);

    if (!upiLink) {
      throw new Error(`UPI link not found for participant ${participant.id}`);
    }

    return generateUPIQRCode(upiLink, bill, participant, options);
  });
}

/**
 * Calculate optimal QR code size based on screen dimensions
 *
 * @param screenWidth Screen width in pixels
 * @param screenHeight Screen height in pixels
 * @param maxPercentage Maximum percentage of screen width (default 80%)
 * @returns Optimal QR code size
 */
export function calculateOptimalSize(
  screenWidth: number,
  screenHeight: number,
  maxPercentage: number = 0.8
): number {
  const maxSize = Math.min(screenWidth, screenHeight) * maxPercentage;

  // Round to nearest multiple of 16 for better rendering
  return Math.floor(maxSize / 16) * 16;
}

/**
 * Get error correction level description
 *
 * @param ecl Error correction level
 * @returns Human-readable description
 */
export function getECLDescription(ecl: QRCodeOptions['ecl']): string {
  switch (ecl) {
    case 'L':
      return 'Low (7% damage recovery)';
    case 'M':
      return 'Medium (15% damage recovery)';
    case 'Q':
      return 'Quartile (25% damage recovery)';
    case 'H':
      return 'High (30% damage recovery)';
    default:
      return 'Unknown';
  }
}

/**
 * Validate QR code options
 *
 * @param options QR code options
 * @throws Error if options are invalid
 */
export function validateQROptions(options: QRCodeOptions): void {
  if (options.size && (options.size < 64 || options.size > 2048)) {
    throw new Error('QR code size must be between 64 and 2048 pixels');
  }

  if (options.logoSize && (options.logoSize < 0 || options.logoSize > 0.5)) {
    throw new Error('Logo size must be between 0 and 0.5 (0-50%)');
  }

  if (options.backgroundColor && !isValidColor(options.backgroundColor)) {
    throw new Error('Invalid background color');
  }

  if (options.color && !isValidColor(options.color)) {
    throw new Error('Invalid foreground color');
  }
}

/**
 * Validate color format (hex)
 *
 * @param color Color string
 * @returns Whether color is valid
 */
function isValidColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Get QR code file name for saving
 *
 * @param bill Bill details
 * @param participant Participant details
 * @returns Suggested file name
 */
export function getQRCodeFileName(
  bill: Bill,
  participant: Participant
): string {
  const billTitle = bill.title.replaceAll(/[^a-z0-9]/gi, '_').toLowerCase();
  const participantName = participant.name
    .replaceAll(/[^a-z0-9]/gi, '_')
    .toLowerCase();
  const timestamp = Date.now();

  return `vasooly_${billTitle}_${participantName}_${timestamp}.png`;
}

/**
 * Format amount for QR code display
 *
 * @param amountInPaise Amount in paise
 * @returns Formatted amount string
 */
export function formatQRAmount(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
}
