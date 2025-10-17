/**
 * Split Engine - Core business logic for bill splitting
 * Uses integer paise (not floats) to avoid precision errors
 *
 * Example: ₹100 ÷ 3 = [3334, 3333, 3333] paise
 */

export interface SplitResult {
  shares: number[];
  total: number;
  remainder: number;
}

/**
 * Split amount equally among participants with paise-exact rounding
 * Remainder is distributed to first shares
 *
 * @param totalPaise - Total amount in paise (e.g., 10000 = ₹100.00)
 * @param count - Number of participants
 * @returns Array of share amounts in paise
 */
export function splitEqual(totalPaise: number, count: number): number[] {
  if (count <= 0) {
    throw new Error('Count must be greater than 0');
  }

  if (totalPaise < 0) {
    throw new Error('Total must be non-negative');
  }

  const base = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  const shares = Array(count).fill(base);

  // Distribute remainder to first shares
  for (let i = 0; i < remainder; i++) {
    shares[i]++;
  }

  return shares;
}

/**
 * Calculate detailed split result with metadata
 */
export function calculateSplit(totalPaise: number, count: number): SplitResult {
  const shares = splitEqual(totalPaise, count);
  const total = shares.reduce((sum, share) => sum + share, 0);
  const remainder = totalPaise % count;

  return {
    shares,
    total,
    remainder,
  };
}

/**
 * Convert paise to rupees string with formatting
 * @param paise - Amount in paise
 * @returns Formatted rupees string (e.g., "₹100.00")
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toFixed(2)}`;
}

/**
 * Convert rupees to paise
 * @param rupees - Amount in rupees
 * @returns Amount in paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
