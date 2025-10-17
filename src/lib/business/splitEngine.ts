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
 * Enhanced split result with participant-level details
 */
export interface ParticipantSplit {
  participantId: string;
  participantName: string;
  amountPaise: number;
}

/**
 * Detailed split result with metadata
 */
export interface DetailedSplitResult {
  splits: ParticipantSplit[];
  totalAmountPaise: number;
  participantCount: number;
  averageAmountPaise: number;
  remainderPaise: number;
  isExactlySplit: boolean;
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

/**
 * Validation error types for split calculations
 */
export class SplitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SplitValidationError';
  }
}

/**
 * Validate split calculation inputs
 * @throws {SplitValidationError} If inputs are invalid
 */
export function validateSplitInputs(
  totalPaise: number,
  participants: Array<{ id: string; name: string }>
): void {
  // Validate total amount
  if (!Number.isFinite(totalPaise)) {
    throw new SplitValidationError('Total amount must be a finite number');
  }

  if (totalPaise < 0) {
    throw new SplitValidationError('Total amount cannot be negative');
  }

  if (!Number.isInteger(totalPaise)) {
    throw new SplitValidationError('Total amount must be in paise (integer)');
  }

  // Validate participants
  if (!Array.isArray(participants)) {
    throw new SplitValidationError('Participants must be an array');
  }

  if (participants.length === 0) {
    throw new SplitValidationError('Must have at least one participant');
  }

  // Check for duplicate participant IDs
  const ids = participants.map((p) => p.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    throw new SplitValidationError('Participant IDs must be unique');
  }

  // Validate each participant
  participants.forEach((participant, index) => {
    if (!participant.id || typeof participant.id !== 'string') {
      throw new SplitValidationError(`Participant at index ${index} has invalid ID`);
    }

    if (!participant.name || typeof participant.name !== 'string') {
      throw new SplitValidationError(
        `Participant "${participant.id}" has invalid name`
      );
    }

    if (participant.name.trim().length === 0) {
      throw new SplitValidationError(
        `Participant "${participant.id}" has empty name`
      );
    }
  });
}

/**
 * Calculate equal split with participant details
 * 
 * This is the primary function for splitting bills in the MVP.
 * It distributes the total amount equally among participants,
 * with any remainder (due to paise-exact rounding) distributed
 * to the first participants.
 * 
 * @param totalPaise - Total bill amount in paise (e.g., 10000 = ₹100.00)
 * @param participants - Array of participant objects with id and name
 * @returns Detailed split result with per-participant breakdown
 * @throws {SplitValidationError} If inputs are invalid
 * 
 * @example
 * ```typescript
 * const result = calculateDetailedSplit(10000, [
 *   { id: '1', name: 'Alice' },
 *   { id: '2', name: 'Bob' },
 *   { id: '3', name: 'Charlie' }
 * ]);
 * // result.splits[0].amountPaise === 3334 (Alice gets 1 paise more)
 * // result.splits[1].amountPaise === 3333 (Bob)
 * // result.splits[2].amountPaise === 3333 (Charlie)
 * // result.totalAmountPaise === 10000
 * // result.isExactlySplit === false (1 paise remainder)
 * ```
 */
export function calculateDetailedSplit(
  totalPaise: number,
  participants: Array<{ id: string; name: string }>
): DetailedSplitResult {
  // Validate inputs
  validateSplitInputs(totalPaise, participants);

  // Calculate split amounts
  const shares = splitEqual(totalPaise, participants.length);

  // Create participant splits
  const splits: ParticipantSplit[] = participants.map((participant, index) => ({
    participantId: participant.id,
    participantName: participant.name,
    amountPaise: shares[index],
  }));

  // Calculate metadata
  const count = participants.length;
  const baseAmount = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  return {
    splits,
    totalAmountPaise: totalPaise,
    participantCount: count,
    averageAmountPaise: baseAmount,
    remainderPaise: remainder,
    isExactlySplit: remainder === 0,
  };
}

/**
 * Verify split result integrity
 * 
 * This function ensures that:
 * 1. Sum of all shares equals total amount (no money lost/created)
 * 2. All shares are non-negative integers
 * 3. Participant count matches split count
 * 
 * @param result - Split result to verify
 * @returns True if valid, false otherwise
 */
export function verifySplitIntegrity(result: DetailedSplitResult): boolean {
  // Verify sum equals total
  const sum = result.splits.reduce((acc, split) => acc + split.amountPaise, 0);
  if (sum !== result.totalAmountPaise) {
    return false;
  }

  // Verify all amounts are non-negative integers
  for (const split of result.splits) {
    if (!Number.isInteger(split.amountPaise) || split.amountPaise < 0) {
      return false;
    }
  }

  // Verify participant count
  if (result.splits.length !== result.participantCount) {
    return false;
  }

  return true;
}

/**
 * Format split result for display
 * 
 * @param result - Split result to format
 * @returns Formatted string representation
 * 
 * @example
 * ```typescript
 * const result = calculateDetailedSplit(10000, [...]);
 * console.log(formatSplitResult(result));
 * // Output:
 * // Split ₹100.00 among 3 participants:
 * //   Alice: ₹33.34
 * //   Bob: ₹33.33
 * //   Charlie: ₹33.33
 * ```
 */
export function formatSplitResult(result: DetailedSplitResult): string {
  const lines: string[] = [];

  lines.push(
    `Split ${formatPaise(result.totalAmountPaise)} among ${result.participantCount} participant(s):`
  );

  result.splits.forEach((split) => {
    lines.push(`  ${split.participantName}: ${formatPaise(split.amountPaise)}`);
  });

  if (!result.isExactlySplit) {
    lines.push(
      `  (${result.remainderPaise} paise remainder distributed to first participant(s))`
    );
  }

  return lines.join('\n');
}
