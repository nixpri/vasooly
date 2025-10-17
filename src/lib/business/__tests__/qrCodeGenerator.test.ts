/**
 * QR Code Generator Tests
 *
 * Test suite for UPI QR code generation functionality.
 */

import {
  generateQRCode,
  generateBrandedQRCode,
  isQRCodeDataValid,
  ERROR_CORRECTION_LEVELS,
} from '../qrCodeGenerator';
import { UPIPaymentParams } from '../upiGenerator';

describe('QR Code Generator', () => {
  const validParams: UPIPaymentParams = {
    pa: 'merchant@paytm',
    pn: 'John Doe',
    am: 100.5,
    tn: 'Test payment',
  };

  describe('generateQRCode', () => {
    it('should generate QR code with default options', () => {
      const result = generateQRCode(validParams);

      expect(result.data).toContain('upi://pay?');
      expect(result.size).toBe(256);
      expect(result.options.backgroundColor).toBe('#FFFFFF');
      expect(result.options.foregroundColor).toBe('#000000');
      expect(result.options.errorCorrectionLevel).toBe('M');
      expect(result.transactionRef).toBeTruthy();
    });

    it('should accept custom size', () => {
      const result = generateQRCode(validParams, { size: 512 });

      expect(result.size).toBe(512);
    });

    it('should accept custom colors', () => {
      const result = generateQRCode(validParams, {
        backgroundColor: '#FF0000',
        foregroundColor: '#0000FF',
      });

      expect(result.options.backgroundColor).toBe('#FF0000');
      expect(result.options.foregroundColor).toBe('#0000FF');
    });

    it('should accept custom error correction level', () => {
      const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];

      levels.forEach((level) => {
        const result = generateQRCode(validParams, {
          errorCorrectionLevel: level,
        });

        expect(result.options.errorCorrectionLevel).toBe(level);
      });
    });

    it('should throw error for invalid size (too small)', () => {
      expect(() =>
        generateQRCode(validParams, { size: 50 })
      ).toThrow('QR code size must be between 100 and 1000 pixels');
    });

    it('should throw error for invalid size (too large)', () => {
      expect(() =>
        generateQRCode(validParams, { size: 1500 })
      ).toThrow('QR code size must be between 100 and 1000 pixels');
    });

    it('should generate QR code data in space-encoded format', () => {
      const result = generateQRCode(validParams);

      // QR code data should have spaces, not URL encoding
      expect(result.data).toContain('John Doe');
      expect(result.data).not.toContain('John%20Doe');
    });

    it('should include all UPI parameters in QR code data', () => {
      const result = generateQRCode(validParams);

      // Check for encoded or unencoded versions (encoding may vary)
      expect(result.data).toMatch(/pa=merchant[@%40]paytm/);
      expect(result.data).toContain('pn=John Doe');
      expect(result.data).toContain('am=100.50');
      expect(result.data).toContain('cu=INR');
      expect(result.data).toContain('tn=Test payment');
      expect(result.data).toContain('tr=');
    });

    it('should throw error for invalid UPI parameters', () => {
      const invalidParams = { ...validParams, pa: 'invalid-vpa' };

      expect(() => generateQRCode(invalidParams)).toThrow('Invalid VPA');
    });
  });

  describe('generateBrandedQRCode', () => {
    it('should generate QR code with Vasooly brand colors', () => {
      const result = generateBrandedQRCode(validParams);

      expect(result.options.backgroundColor).toBe('#121212');
      expect(result.options.foregroundColor).toBe('#00D9FF');
      expect(result.options.errorCorrectionLevel).toBe('H');
    });

    it('should accept custom size', () => {
      const result = generateBrandedQRCode(validParams, 300);

      expect(result.size).toBe(300);
    });

    it('should default to 256px size', () => {
      const result = generateBrandedQRCode(validParams);

      expect(result.size).toBe(256);
    });

    it('should use high error correction for branding', () => {
      const result = generateBrandedQRCode(validParams);

      // High error correction allows for logo/branding overlay
      expect(result.options.errorCorrectionLevel).toBe('H');
    });
  });

  describe('isQRCodeDataValid', () => {
    it('should validate short UPI URIs', () => {
      const shortUri = 'upi://pay?pa=test@paytm&pn=Test&am=100';

      const isValid = isQRCodeDataValid(shortUri, 'M');
      expect(isValid).toBe(true);
    });

    it('should validate based on error correction level', () => {
      // Create a URI of medium length (~200 chars)
      const mediumUri = 'upi://pay?' + 'a'.repeat(190);

      expect(isQRCodeDataValid(mediumUri, 'L')).toBe(true); // Limit: 468
      expect(isQRCodeDataValid(mediumUri, 'M')).toBe(true); // Limit: 360
      expect(isQRCodeDataValid(mediumUri, 'Q')).toBe(true); // Limit: 288
      expect(isQRCodeDataValid(mediumUri, 'H')).toBe(true); // Limit: 224
    });

    it('should reject data exceeding capacity', () => {
      // Create a very long URI
      const longUri = 'upi://pay?' + 'a'.repeat(500);

      expect(isQRCodeDataValid(longUri, 'L')).toBe(false); // Limit: 468
      expect(isQRCodeDataValid(longUri, 'M')).toBe(false); // Limit: 360
      expect(isQRCodeDataValid(longUri, 'Q')).toBe(false); // Limit: 288
      expect(isQRCodeDataValid(longUri, 'H')).toBe(false); // Limit: 224
    });

    it('should use Medium level as default', () => {
      const uri = 'upi://pay?' + 'a'.repeat(350);

      const isValid = isQRCodeDataValid(uri);
      expect(isValid).toBe(true); // Should use M level (360 limit)
    });

    it('should handle exact capacity limits', () => {
      // Test exact limits for each level
      expect(isQRCodeDataValid('a'.repeat(468), 'L')).toBe(true);
      expect(isQRCodeDataValid('a'.repeat(469), 'L')).toBe(false);

      expect(isQRCodeDataValid('a'.repeat(360), 'M')).toBe(true);
      expect(isQRCodeDataValid('a'.repeat(361), 'M')).toBe(false);

      expect(isQRCodeDataValid('a'.repeat(288), 'Q')).toBe(true);
      expect(isQRCodeDataValid('a'.repeat(289), 'Q')).toBe(false);

      expect(isQRCodeDataValid('a'.repeat(224), 'H')).toBe(true);
      expect(isQRCodeDataValid('a'.repeat(225), 'H')).toBe(false);
    });
  });

  describe('ERROR_CORRECTION_LEVELS', () => {
    it('should define all error correction levels', () => {
      expect(ERROR_CORRECTION_LEVELS).toHaveProperty('L');
      expect(ERROR_CORRECTION_LEVELS).toHaveProperty('M');
      expect(ERROR_CORRECTION_LEVELS).toHaveProperty('Q');
      expect(ERROR_CORRECTION_LEVELS).toHaveProperty('H');
    });

    it('should include recovery percentages', () => {
      expect(ERROR_CORRECTION_LEVELS.L.recovery).toBe('~7%');
      expect(ERROR_CORRECTION_LEVELS.M.recovery).toBe('~15%');
      expect(ERROR_CORRECTION_LEVELS.Q.recovery).toBe('~25%');
      expect(ERROR_CORRECTION_LEVELS.H.recovery).toBe('~30%');
    });

    it('should include level names', () => {
      expect(ERROR_CORRECTION_LEVELS.L.name).toBe('Low');
      expect(ERROR_CORRECTION_LEVELS.M.name).toBe('Medium');
      expect(ERROR_CORRECTION_LEVELS.Q.name).toBe('Quartile');
      expect(ERROR_CORRECTION_LEVELS.H.name).toBe('High');
    });
  });

  describe('Integration: QR code for bill payment', () => {
    it('should generate scannable QR code for participant payment', () => {
      const participantParams: UPIPaymentParams = {
        pa: 'restaurant@paytm',
        pn: 'Restaurant ABC',
        am: 350.75,
        tn: 'Bill split - Dinner',
        tr: 'BILL-dinner-123-1698765432',
      };

      const qrResult = generateQRCode(participantParams);

      // Verify QR code is ready for react-native-qrcode-svg
      expect(qrResult.data).toBeTruthy();
      expect(qrResult.size).toBeGreaterThanOrEqual(100);
      expect(qrResult.transactionRef).toBe(participantParams.tr);

      // Verify data includes all payment info (with possible encoding)
      expect(qrResult.data).toMatch(/restaurant[@%40]paytm/);
      expect(qrResult.data).toContain(participantParams.pn);
      expect(qrResult.data).toContain('350.75');
      expect(qrResult.data).toContain(participantParams.tn);
      expect(qrResult.data).toContain(participantParams.tr);
    });

    it('should support multiple QR codes for different participants', () => {
      const participants = [
        { pa: 'user1@paytm', pn: 'User 1', am: 100 },
        { pa: 'user2@paytm', pn: 'User 2', am: 100 },
        { pa: 'user3@paytm', pn: 'User 3', am: 100 },
      ];

      const qrCodes = participants.map((p) => generateQRCode(p));

      // Each should have unique data
      expect(qrCodes[0].data).not.toBe(qrCodes[1].data);
      expect(qrCodes[1].data).not.toBe(qrCodes[2].data);

      // All should be valid
      qrCodes.forEach((qr) => {
        expect(isQRCodeDataValid(qr.data)).toBe(true);
      });
    });

    it('should generate branded QR code for premium experience', () => {
      const result = generateBrandedQRCode(validParams, 400);

      // Verify branding
      expect(result.options.backgroundColor).toBe('#121212');
      expect(result.options.foregroundColor).toBe('#00D9FF');
      expect(result.size).toBe(400);

      // Verify data is still valid
      expect(isQRCodeDataValid(result.data, 'H')).toBe(true);
    });
  });
});
