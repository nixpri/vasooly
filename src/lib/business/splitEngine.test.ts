import {
  splitEqual,
  calculateSplit,
  formatPaise,
  rupeesToPaise,
  calculateDetailedSplit,
  verifySplitIntegrity,
  formatSplitResult,
} from './splitEngine';

describe('Split Engine', () => {
  describe('splitEqual', () => {
    it('should split evenly when amount divides perfectly', () => {
      const total = 300; // paise
      const count = 3;
      const expected = [100, 100, 100];

      const result = splitEqual(total, count);
      expect(result).toEqual(expected);
    });

    it('should handle remainder by adding to first shares', () => {
      const total = 100; // paise (₹1.00)
      const count = 3;
      const expected = [34, 33, 33]; // 34 + 33 + 33 = 100

      const result = splitEqual(total, count);
      expect(result).toEqual(expected);
      expect(result.reduce((a, b) => a + b, 0)).toBe(total);
    });

    it('should handle single participant', () => {
      const total = 500;
      const count = 1;
      const expected = [500];

      const result = splitEqual(total, count);
      expect(result).toEqual(expected);
    });

    it('should handle zero amount', () => {
      const total = 0;
      const count = 3;
      const expected = [0, 0, 0];

      const result = splitEqual(total, count);
      expect(result).toEqual(expected);
    });

    it('should throw error for invalid count', () => {
      expect(() => splitEqual(100, 0)).toThrow('Count must be greater than 0');
      expect(() => splitEqual(100, -1)).toThrow('Count must be greater than 0');
    });

    it('should throw error for negative amount', () => {
      expect(() => splitEqual(-100, 3)).toThrow('Total must be non-negative');
    });
  });

  describe('calculateSplit', () => {
    it('should return detailed split result', () => {
      const result = calculateSplit(100, 3);

      expect(result.shares).toEqual([34, 33, 33]);
      expect(result.total).toBe(100);
      expect(result.remainder).toBe(1);
    });
  });

  describe('formatPaise', () => {
    it('should format paise to rupees', () => {
      expect(formatPaise(10000)).toBe('₹100.00');
      expect(formatPaise(12345)).toBe('₹123.45');
      expect(formatPaise(100)).toBe('₹1.00');
    });
  });

  describe('rupeesToPaise', () => {
    it('should convert rupees to paise', () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise(123.45)).toBe(12345);
      expect(rupeesToPaise(1)).toBe(100);
    });
  });

  describe('calculateDetailedSplit', () => {
    const participants = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ];

    it('should split equally with participant details', () => {
      const result = calculateDetailedSplit(10000, participants);

      expect(result.splits).toHaveLength(3);
      expect(result.splits[0]).toEqual({
        participantId: '1',
        participantName: 'Alice',
        amountPaise: 3334,
      });
      expect(result.splits[1]).toEqual({
        participantId: '2',
        participantName: 'Bob',
        amountPaise: 3333,
      });
      expect(result.splits[2]).toEqual({
        participantId: '3',
        participantName: 'Charlie',
        amountPaise: 3333,
      });

      expect(result.totalAmountPaise).toBe(10000);
      expect(result.participantCount).toBe(3);
      expect(result.averageAmountPaise).toBe(3333);
      expect(result.remainderPaise).toBe(1);
      expect(result.isExactlySplit).toBe(false);
    });

    it('should handle exact split (no remainder)', () => {
      const result = calculateDetailedSplit(30000, participants);

      expect(result.splits.every((s) => s.amountPaise === 10000)).toBe(true);
      expect(result.remainderPaise).toBe(0);
      expect(result.isExactlySplit).toBe(true);
    });

    it('should handle single participant', () => {
      const result = calculateDetailedSplit(10000, [{ id: '1', name: 'Alice' }]);

      expect(result.splits).toHaveLength(1);
      expect(result.splits[0].amountPaise).toBe(10000);
      expect(result.participantCount).toBe(1);
      expect(result.isExactlySplit).toBe(true);
    });

    it('should handle two participants', () => {
      const result = calculateDetailedSplit(10001, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      expect(result.splits[0].amountPaise).toBe(5001);
      expect(result.splits[1].amountPaise).toBe(5000);
      expect(result.remainderPaise).toBe(1);
    });

    it('should handle 100 participants', () => {
      const many = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        name: `Person ${i}`,
      }));

      const result = calculateDetailedSplit(100000, many);

      expect(result.participantCount).toBe(100);
      expect(result.averageAmountPaise).toBe(1000);

      // Verify sum invariant
      const sum = result.splits.reduce((acc, s) => acc + s.amountPaise, 0);
      expect(sum).toBe(100000);

      // All participants get exact amount (no remainder)
      expect(result.splits.every((s) => s.amountPaise === 1000)).toBe(true);
    });

    it('should handle 1000 participants', () => {
      const many = Array.from({ length: 1000 }, (_, i) => ({
        id: `id-${i}`,
        name: `Person ${i}`,
      }));

      const result = calculateDetailedSplit(1234567, many);

      expect(result.participantCount).toBe(1000);

      // Verify sum invariant
      const sum = result.splits.reduce((acc, s) => acc + s.amountPaise, 0);
      expect(sum).toBe(1234567);

      // Check remainder distribution
      const higherAmount = Math.ceil(1234567 / 1000);
      const lowerAmount = Math.floor(1234567 / 1000);

      result.splits.forEach((split, index) => {
        if (index < 567) {
          // First 567 get 1 paise more
          expect(split.amountPaise).toBe(higherAmount);
        } else {
          expect(split.amountPaise).toBe(lowerAmount);
        }
      });
    });

    it('should handle large amounts (1 crore rupees)', () => {
      const result = calculateDetailedSplit(100000000, participants); // ₹10,00,000

      expect(result.totalAmountPaise).toBe(100000000);

      // Verify sum invariant
      const sum = result.splits.reduce((acc, s) => acc + s.amountPaise, 0);
      expect(sum).toBe(100000000);
    });

    it('should handle zero amount', () => {
      const result = calculateDetailedSplit(0, participants);

      expect(result.splits.every((s) => s.amountPaise === 0)).toBe(true);
      expect(result.remainderPaise).toBe(0);
      expect(result.isExactlySplit).toBe(true);
    });

    it('should throw error for negative amount', () => {
      expect(() => calculateDetailedSplit(-100, participants)).toThrow(
        'Total amount cannot be negative'
      );
    });

    it('should throw error for non-integer amount', () => {
      expect(() => calculateDetailedSplit(100.5, participants)).toThrow(
        'Total amount must be in paise (integer)'
      );
    });

    it('should throw error for infinite amount', () => {
      expect(() => calculateDetailedSplit(Infinity, participants)).toThrow(
        'Total amount must be a finite number'
      );
    });

    it('should throw error for NaN amount', () => {
      expect(() => calculateDetailedSplit(NaN, participants)).toThrow(
        'Total amount must be a finite number'
      );
    });

    it('should throw error for empty participants', () => {
      expect(() => calculateDetailedSplit(100, [])).toThrow(
        'Must have at least one participant'
      );
    });

    it('should throw error for duplicate participant IDs', () => {
      const duplicates = [
        { id: '1', name: 'Alice' },
        { id: '1', name: 'Bob' }, // Duplicate ID
      ];

      expect(() => calculateDetailedSplit(100, duplicates)).toThrow(
        'Participant IDs must be unique'
      );
    });

    it('should throw error for missing participant ID', () => {
      const invalid = [{ id: '', name: 'Alice' }];

      expect(() => calculateDetailedSplit(100, invalid)).toThrow('invalid ID');
    });

    it('should throw error for missing participant name', () => {
      const invalid = [{ id: '1', name: '' }];

      expect(() => calculateDetailedSplit(100, invalid)).toThrow('invalid name');
    });

    it('should throw error for whitespace-only name', () => {
      const invalid = [{ id: '1', name: '   ' }];

      expect(() => calculateDetailedSplit(100, invalid)).toThrow('empty name');
    });
  });

  describe('verifySplitIntegrity', () => {
    it('should verify valid split result', () => {
      const result = calculateDetailedSplit(10000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ]);

      expect(verifySplitIntegrity(result)).toBe(true);
    });

    it('should detect sum mismatch', () => {
      const result = calculateDetailedSplit(10000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Corrupt the result
      result.splits[0].amountPaise += 1;

      expect(verifySplitIntegrity(result)).toBe(false);
    });

    it('should detect negative amounts', () => {
      const result = calculateDetailedSplit(10000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Corrupt the result
      result.splits[0].amountPaise = -100;
      result.splits[1].amountPaise = 10100;

      expect(verifySplitIntegrity(result)).toBe(false);
    });

    it('should detect participant count mismatch', () => {
      const result = calculateDetailedSplit(10000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);

      // Corrupt the result
      result.participantCount = 3;

      expect(verifySplitIntegrity(result)).toBe(false);
    });
  });

  describe('formatSplitResult', () => {
    it('should format split with remainder', () => {
      const result = calculateDetailedSplit(10000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ]);

      const formatted = formatSplitResult(result);

      expect(formatted).toContain('Split ₹100.00 among 3 participant(s)');
      expect(formatted).toContain('Alice: ₹33.34');
      expect(formatted).toContain('Bob: ₹33.33');
      expect(formatted).toContain('Charlie: ₹33.33');
      expect(formatted).toContain('1 paise remainder');
    });

    it('should format exact split without remainder note', () => {
      const result = calculateDetailedSplit(30000, [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Charlie' },
      ]);

      const formatted = formatSplitResult(result);

      expect(formatted).toContain('Split ₹300.00 among 3 participant(s)');
      expect(formatted).not.toContain('remainder');
    });
  });
});
