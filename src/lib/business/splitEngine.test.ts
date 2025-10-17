import { splitEqual, calculateSplit, formatPaise, rupeesToPaise } from './splitEngine';

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
});
