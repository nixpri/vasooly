/**
 * UPI Generator Tests
 *
 * Comprehensive test suite for UPI link generation.
 * Target: 90%+ code coverage with edge case handling.
 */

import {
  validateVPA,
  generateTransactionRef,
  generateUPILink,
  rupeesToPaise,
  paiseToRupees,
  UPIApp,
  UPIPaymentParams,
} from '../upiGenerator';

describe('UPI Generator', () => {
  describe('validateVPA', () => {
    it('should validate correct VPA format', () => {
      const result = validateVPA('merchant@paytm');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate VPA with numbers and special characters', () => {
      const validVPAs = [
        'user123@ybl',
        'john.doe@okaxis',
        'merchant_test@paytm',
        'shop-123@icici',
      ];

      validVPAs.forEach((vpa) => {
        const result = validateVPA(vpa);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject VPA without @ symbol', () => {
      const result = validateVPA('merchantpaytm');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VPA must contain @ symbol');
    });

    it('should reject VPA with multiple @ symbols', () => {
      const result = validateVPA('merchant@@paytm');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VPA must have exactly one @ symbol');
    });

    it('should reject VPA with empty username', () => {
      const result = validateVPA('@paytm');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VPA username cannot be empty');
    });

    it('should reject VPA with empty bank handle', () => {
      const result = validateVPA('merchant@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VPA bank handle cannot be empty');
    });

    it('should reject VPA that is too short', () => {
      const result = validateVPA('a@b');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'VPA must be between 5 and 100 characters'
      );
    });

    it('should reject VPA that is too long', () => {
      const longVPA = 'a'.repeat(95) + '@' + 'b'.repeat(10); // 106 chars
      const result = validateVPA(longVPA);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'VPA must be between 5 and 100 characters'
      );
    });

    it('should reject VPA with invalid characters', () => {
      const invalidVPAs = ['user@bank!', 'user#123@bank', 'user@bank space'];

      invalidVPAs.forEach((vpa) => {
        const result = validateVPA(vpa);
        expect(result.isValid).toBe(false);
      });
    });

    it('should reject null or undefined VPA', () => {
      const result1 = validateVPA(null as any);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('VPA is required');

      const result2 = validateVPA(undefined as any);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('VPA is required');
    });

    it('should handle VPA with whitespace', () => {
      const result = validateVPA('  merchant@paytm  ');
      // Should still validate the trimmed version
      expect(result.isValid).toBe(true);
    });
  });

  describe('generateTransactionRef', () => {
    it('should generate transaction reference with bill ID', () => {
      const ref = generateTransactionRef('bill-123');
      expect(ref).toMatch(/^BILL-bill-123-\d+$/);
    });

    it('should generate unique references for same bill ID', async () => {
      const ref1 = generateTransactionRef('bill-123');
      // Wait 1ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const ref2 = generateTransactionRef('bill-123');
      expect(ref1).not.toBe(ref2);
    });

    it('should include timestamp in reference', () => {
      const beforeTime = Date.now();
      const ref = generateTransactionRef('test');
      const afterTime = Date.now();

      const timestampMatch = ref.match(/BILL-test-(\d+)/);
      expect(timestampMatch).not.toBeNull();

      const timestamp = parseInt(timestampMatch![1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('generateUPILink', () => {
    const validParams: UPIPaymentParams = {
      pa: 'merchant@paytm',
      pn: 'John Doe',
      am: 100.5,
      tn: 'Dinner bill split',
    };

    it('should generate valid standard UPI URI', () => {
      const result = generateUPILink(validParams);

      expect(result.standardUri).toContain('upi://pay?');
      expect(result.standardUri).toContain('pa=merchant%40paytm');
      expect(result.standardUri).toContain('pn=John%20Doe');
      expect(result.standardUri).toContain('am=100.50');
      expect(result.standardUri).toContain('cu=INR');
      expect(result.standardUri).toContain('tn=Dinner%20bill%20split');
    });

    it('should generate app-specific fallback URIs', () => {
      const result = generateUPILink(validParams);

      expect(result.fallbackUris[UPIApp.GPAY]).toContain('tez://upi/pay?');
      expect(result.fallbackUris[UPIApp.PHONEPE]).toContain('phonepe://pay?');
      expect(result.fallbackUris[UPIApp.PAYTM]).toContain('paytmmp://pay?');
      expect(result.fallbackUris[UPIApp.BHIM]).toContain('upi://pay?');
      expect(result.fallbackUris[UPIApp.GENERIC]).toContain('upi://pay?');
    });

    it('should generate QR code data with space encoding', () => {
      const result = generateUPILink(validParams);

      // QR code should have spaces, not %20
      expect(result.qrCodeData).toContain('John Doe');
      expect(result.qrCodeData).not.toContain('John%20Doe');
    });

    it('should include transaction reference', () => {
      const result = generateUPILink(validParams);

      expect(result.transactionRef).toMatch(/^BILL-unknown-\d+$/);
      expect(result.standardUri).toContain(`tr=${result.transactionRef}`);
    });

    it('should use provided transaction reference', () => {
      const paramsWithRef: UPIPaymentParams = {
        ...validParams,
        tr: 'CUSTOM-REF-123',
      };

      const result = generateUPILink(paramsWithRef);
      expect(result.transactionRef).toBe('CUSTOM-REF-123');
      expect(result.standardUri).toContain('tr=CUSTOM-REF-123');
    });

    it('should format amount with 2 decimal places', () => {
      const testCases = [
        { input: 100, expected: '100.00' },
        { input: 100.5, expected: '100.50' },
        { input: 100.99, expected: '100.99' },
        { input: 0.01, expected: '0.01' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = generateUPILink({ ...validParams, am: input });
        expect(result.standardUri).toContain(`am=${expected}`);
      });
    });

    it('should throw error for invalid VPA', () => {
      const invalidParams = { ...validParams, pa: 'invalid-vpa' };

      expect(() => generateUPILink(invalidParams)).toThrow('Invalid VPA');
    });

    it('should throw error for zero amount', () => {
      const invalidParams = { ...validParams, am: 0 };

      expect(() => generateUPILink(invalidParams)).toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for negative amount', () => {
      const invalidParams = { ...validParams, am: -100 };

      expect(() => generateUPILink(invalidParams)).toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for amount exceeding UPI limit', () => {
      const invalidParams = { ...validParams, am: 100001 };

      expect(() => generateUPILink(invalidParams)).toThrow(
        'Amount cannot exceed ₹1,00,000'
      );
    });

    it('should throw error for empty payee name', () => {
      const invalidParams = { ...validParams, pn: '' };

      expect(() => generateUPILink(invalidParams)).toThrow(
        'Payee name is required'
      );
    });

    it('should throw error for whitespace-only payee name', () => {
      const invalidParams = { ...validParams, pn: '   ' };

      expect(() => generateUPILink(invalidParams)).toThrow(
        'Payee name is required'
      );
    });

    it('should handle optional currency parameter', () => {
      const paramsWithCurrency: UPIPaymentParams = {
        ...validParams,
        cu: 'USD',
      };

      const result = generateUPILink(paramsWithCurrency);
      expect(result.standardUri).toContain('cu=USD');
    });

    it('should default to INR currency', () => {
      const result = generateUPILink(validParams);
      expect(result.standardUri).toContain('cu=INR');
    });

    it('should handle optional merchant code', () => {
      const paramsWithMC: UPIPaymentParams = {
        ...validParams,
        mc: '1234',
      };

      const result = generateUPILink(paramsWithMC);
      expect(result.standardUri).toContain('mc=1234');
    });

    it('should encode special characters in parameters', () => {
      const paramsWithSpecialChars: UPIPaymentParams = {
        pa: 'test@paytm',
        pn: 'John & Jane',
        am: 100,
        tn: 'Bill #123 (urgent!)',
      };

      const result = generateUPILink(paramsWithSpecialChars);

      // URI encoding should be applied
      expect(result.standardUri).toContain('John%20%26%20Jane');
      expect(result.standardUri).toContain('Bill%20%23123%20(urgent!)');

      // QR code should preserve special chars (with minimal encoding)
      expect(result.qrCodeData).toMatch(/John.*Jane/); // Name present, encoded or not
    });

    it('should handle edge case amounts', () => {
      const edgeCases = [
        0.01, // Minimum amount (1 paisa)
        99999.99, // Just below UPI limit
        100000, // Exactly at UPI limit
      ];

      edgeCases.forEach((amount) => {
        const result = generateUPILink({ ...validParams, am: amount });
        expect(result.standardUri).toContain(`am=${amount.toFixed(2)}`);
      });
    });
  });

  describe('rupeesToPaise', () => {
    it('should convert rupees to paise correctly', () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise(100.5)).toBe(10050);
      expect(rupeesToPaise(0.01)).toBe(1);
      expect(rupeesToPaise(99999.99)).toBe(9999999);
    });

    it('should handle floating point precision', () => {
      expect(rupeesToPaise(100.125)).toBe(10013); // Rounds to nearest paisa
      expect(rupeesToPaise(100.994)).toBe(10099);
      expect(rupeesToPaise(100.995)).toBe(10100);
    });

    it('should handle zero', () => {
      expect(rupeesToPaise(0)).toBe(0);
    });
  });

  describe('paiseToRupees', () => {
    it('should convert paise to rupees correctly', () => {
      expect(paiseToRupees(10000)).toBe(100);
      expect(paiseToRupees(10050)).toBe(100.5);
      expect(paiseToRupees(1)).toBe(0.01);
      expect(paiseToRupees(9999999)).toBe(99999.99);
    });

    it('should handle zero', () => {
      expect(paiseToRupees(0)).toBe(0);
    });

    it('should be inverse of rupeesToPaise', () => {
      const testValues = [100, 100.5, 0.01, 99999.99];

      testValues.forEach((rupees) => {
        const paise = rupeesToPaise(rupees);
        const backToRupees = paiseToRupees(paise);
        expect(backToRupees).toBeCloseTo(rupees, 2);
      });
    });
  });

  describe('Integration: Full payment flow', () => {
    it('should generate complete UPI link for bill participant', async () => {
      // Add small delay to ensure timestamps differ if called multiple times
      await new Promise(resolve => setTimeout(resolve, 1));
      const billId = 'bill-dinner-123';
      const participantShare = paiseToRupees(10050); // ₹100.50

      const result = generateUPILink({
        pa: 'merchant@paytm',
        pn: 'Restaurant ABC',
        am: participantShare,
        tn: `Payment for ${billId}`,
        tr: generateTransactionRef(billId),
      });

      // Verify all components are present
      expect(result.standardUri).toBeTruthy();
      expect(result.fallbackUris).toHaveProperty(UPIApp.GPAY);
      expect(result.fallbackUris).toHaveProperty(UPIApp.PHONEPE);
      expect(result.qrCodeData).toBeTruthy();
      expect(result.transactionRef).toContain(billId);
    });

    it('should handle multiple participants with split amounts', async () => {
      const totalBill = 10050; // ₹100.50 in paise
      const participants = 3;
      const sharePerPerson = Math.floor(totalBill / participants); // 3350 paise

      const results = [];
      for (let i = 0; i < participants; i++) {
        // Add small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 2));
        results.push(generateUPILink({
          pa: `participant${i}@paytm`,
          pn: `Participant ${i + 1}`,
          am: paiseToRupees(sharePerPerson),
          tn: 'Bill split',
        }));
      }

      // Each participant should have unique transaction ref
      const transactionRefs = results.map((r) => r.transactionRef);
      const uniqueRefs = new Set(transactionRefs);
      expect(uniqueRefs.size).toBe(participants);

      // All should have valid URIs
      results.forEach((result) => {
        expect(result.standardUri).toContain('upi://pay?');
        expect(result.standardUri).toContain('am=33.50');
      });
    });
  });
});
