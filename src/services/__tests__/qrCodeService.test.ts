/**
 * QR Code Service Tests
 *
 * Comprehensive tests for QR code generation functionality
 */

import {
  generateUPIQRCode,
  generateBillSharingQRCode,
  generateBatchQRCodes,
  calculateOptimalSize,
  getECLDescription,
  validateQROptions,
  getQRCodeFileName,
  formatQRAmount,
  DEFAULT_QR_OPTIONS,
} from '../qrCodeService';
import type { Bill, Participant } from '../../types';
import { BillStatus, PaymentStatus } from '../../types';

describe('QR Code Service', () => {
  const mockBill: Bill = {
    id: '123',
    title: 'Test Bill',
    totalAmountPaise: 10000,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    participants: [
      {
        id: 'p1',
        name: 'Alice',
        amountPaise: 5000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'p2',
        name: 'Bob',
        amountPaise: 5000,
        status: PaymentStatus.PAID,
      },
    ],
    status: BillStatus.ACTIVE,
  };

  const mockParticipant: Participant = mockBill.participants[0];
  const mockUPILink = 'upi://pay?pa=test@upi&pn=Test&am=50.00&tn=TestBill';

  describe('generateUPIQRCode', () => {
    it('should generate QR code data with default options', () => {
      const result = generateUPIQRCode(mockUPILink);

      expect(result.value).toBe(mockUPILink);
      expect(result.options).toEqual(DEFAULT_QR_OPTIONS);
      expect(result.metadata).toBeUndefined();
    });

    it('should generate QR code data with bill and participant metadata', () => {
      const result = generateUPIQRCode(mockUPILink, mockBill, mockParticipant);

      expect(result.value).toBe(mockUPILink);
      expect(result.metadata).toEqual({
        title: 'Test Bill',
        description: 'Payment for Alice',
        amount: 5000,
      });
    });

    it('should merge custom options with defaults', () => {
      const customOptions = {
        size: 512,
        color: '#FF0000',
      };

      const result = generateUPIQRCode(mockUPILink, undefined, undefined, customOptions);

      expect(result.options.size).toBe(512);
      expect(result.options.color).toBe('#FF0000');
      expect(result.options.backgroundColor).toBe(DEFAULT_QR_OPTIONS.backgroundColor);
    });

    it('should handle long UPI links', () => {
      const longLink = 'upi://pay?pa=verylongvpa@verylongbank&pn=VeryLongPersonName&am=999999.99&tn=VeryLongTransactionNote';

      const result = generateUPIQRCode(longLink);

      expect(result.value).toBe(longLink);
      expect(result.value.length).toBeGreaterThan(50);
    });
  });

  describe('generateBillSharingQRCode', () => {
    it('should generate QR code for bill sharing', () => {
      const result = generateBillSharingQRCode('bill123');

      expect(result.value).toBe('vasooly://bill/bill123');
      expect(result.metadata).toEqual({
        title: 'Share Bill',
        description: 'Scan to view bill details',
      });
    });

    it('should handle custom options', () => {
      const result = generateBillSharingQRCode('bill123', { size: 512 });

      expect(result.options.size).toBe(512);
    });
  });

  describe('generateBatchQRCodes', () => {
    it('should generate QR codes for all participants', () => {
      const upiLinks = new Map([
        ['p1', 'upi://pay?pa=alice@upi&am=50.00'],
        ['p2', 'upi://pay?pa=bob@upi&am=50.00'],
      ]);

      const results = generateBatchQRCodes(mockBill, upiLinks);

      expect(results).toHaveLength(2);
      expect(results[0].value).toBe('upi://pay?pa=alice@upi&am=50.00');
      expect(results[0].metadata?.description).toBe('Payment for Alice');
      expect(results[1].value).toBe('upi://pay?pa=bob@upi&am=50.00');
      expect(results[1].metadata?.description).toBe('Payment for Bob');
    });

    it('should throw error if UPI link not found for participant', () => {
      const upiLinks = new Map([['p1', 'upi://pay?pa=alice@upi&am=50.00']]);

      expect(() => generateBatchQRCodes(mockBill, upiLinks)).toThrow(
        'UPI link not found for participant p2'
      );
    });

    it('should handle empty participants array', () => {
      const emptyBill: Bill = {
        ...mockBill,
        participants: [],
      };

      const results = generateBatchQRCodes(emptyBill, new Map());

      expect(results).toHaveLength(0);
    });
  });

  describe('calculateOptimalSize', () => {
    it('should calculate optimal size for mobile screens', () => {
      const size = calculateOptimalSize(375, 667);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(375 * 0.8);
      expect(size % 16).toBe(0); // Should be multiple of 16
    });

    it('should use screen width for landscape', () => {
      const size = calculateOptimalSize(667, 375);

      expect(size).toBeLessThanOrEqual(375 * 0.8);
    });

    it('should respect custom max percentage', () => {
      const size = calculateOptimalSize(400, 600, 0.5);

      expect(size).toBeLessThanOrEqual(400 * 0.5);
    });

    it('should round to nearest multiple of 16', () => {
      const size = calculateOptimalSize(400, 600, 0.8);

      expect(size % 16).toBe(0);
    });
  });

  describe('getECLDescription', () => {
    it('should return correct description for Low ECL', () => {
      expect(getECLDescription('L')).toBe('Low (7% damage recovery)');
    });

    it('should return correct description for Medium ECL', () => {
      expect(getECLDescription('M')).toBe('Medium (15% damage recovery)');
    });

    it('should return correct description for Quartile ECL', () => {
      expect(getECLDescription('Q')).toBe('Quartile (25% damage recovery)');
    });

    it('should return correct description for High ECL', () => {
      expect(getECLDescription('H')).toBe('High (30% damage recovery)');
    });

    it('should handle unknown ECL', () => {
      expect(getECLDescription(undefined as any)).toBe('Unknown');
    });
  });

  describe('validateQROptions', () => {
    it('should validate valid options', () => {
      expect(() =>
        validateQROptions({
          size: 256,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          ecl: 'M',
          logoSize: 0.2,
        })
      ).not.toThrow();
    });

    it('should throw error for size too small', () => {
      expect(() =>
        validateQROptions({
          size: 32,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          ecl: 'M',
        })
      ).toThrow('QR code size must be between 64 and 2048 pixels');
    });

    it('should throw error for size too large', () => {
      expect(() =>
        validateQROptions({
          size: 3000,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          ecl: 'M',
        })
      ).toThrow('QR code size must be between 64 and 2048 pixels');
    });

    it('should throw error for invalid logo size', () => {
      expect(() =>
        validateQROptions({
          size: 256,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          ecl: 'M',
          logoSize: 0.6,
        })
      ).toThrow('Logo size must be between 0 and 0.5 (0-50%)');
    });

    it('should throw error for invalid background color', () => {
      expect(() =>
        validateQROptions({
          size: 256,
          backgroundColor: 'invalid',
          color: '#000000',
          ecl: 'M',
        })
      ).toThrow('Invalid background color');
    });

    it('should throw error for invalid foreground color', () => {
      expect(() =>
        validateQROptions({
          size: 256,
          backgroundColor: '#FFFFFF',
          color: 'rgb(0,0,0)',
          ecl: 'M',
        })
      ).toThrow('Invalid foreground color');
    });
  });

  describe('getQRCodeFileName', () => {
    it('should generate valid file name', () => {
      const fileName = getQRCodeFileName(mockBill, mockParticipant);

      expect(fileName).toMatch(/^vasooly_test_bill_alice_\d+\.png$/);
    });

    it('should sanitize special characters', () => {
      const specialBill: Bill = {
        ...mockBill,
        title: 'Test@Bill#123!',
      };

      const specialParticipant: Participant = {
        ...mockParticipant,
        name: 'Alice & Bob',
      };

      const fileName = getQRCodeFileName(specialBill, specialParticipant);

      expect(fileName).not.toContain('@');
      expect(fileName).not.toContain('#');
      expect(fileName).not.toContain('!');
      expect(fileName).not.toContain('&');
      expect(fileName).toMatch(/^vasooly_test_bill_123__alice___bob_\d+\.png$/);
    });

    it('should convert to lowercase', () => {
      const fileName = getQRCodeFileName(mockBill, mockParticipant);

      expect(fileName).toBe(fileName.toLowerCase());
    });

    it('should include timestamp', () => {
      const fileName = getQRCodeFileName(mockBill, mockParticipant);

      // Should contain a numeric timestamp
      expect(fileName).toMatch(/_\d+\.png$/);

      // Extract timestamp and verify it's a valid number
      const timestampMatch = fileName.match(/_(\d+)\.png$/);
      expect(timestampMatch).not.toBeNull();

      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1], 10);
        expect(timestamp).toBeGreaterThan(0);
        expect(timestamp).toBeLessThanOrEqual(Date.now());
      }
    });
  });

  describe('formatQRAmount', () => {
    it('should format whole rupees', () => {
      expect(formatQRAmount(10000)).toBe('₹100.00');
    });

    it('should format rupees with paise', () => {
      expect(formatQRAmount(12345)).toBe('₹123.45');
    });

    it('should format small amounts', () => {
      expect(formatQRAmount(1)).toBe('₹0.01');
    });

    it('should format large amounts', () => {
      expect(formatQRAmount(100000000)).toBe('₹1000000.00');
    });

    it('should handle zero', () => {
      expect(formatQRAmount(0)).toBe('₹0.00');
    });
  });
});
