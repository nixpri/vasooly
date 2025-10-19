/**
 * Payment Status Manager
 *
 * Manages payment status tracking, settlement summaries, and remainder calculations
 * for bill splits. Handles transitions between payment states and computes
 * aggregated status for bills and participants.
 *
 * Core responsibilities:
 * - Payment status updates (pending → paid, paid → pending)
 * - Settlement summary computation (total paid, pending, percentages)
 * - Remainder calculation for partial payments
 * - Bill status determination (active vs settled)
 */

import { Bill, BillStatus, Participant, PaymentStatus } from '../../types';
import { paiseToRupees } from './upiGenerator';

/**
 * Payment status update request
 */
export interface PaymentStatusUpdate {
  /** Participant ID to update */
  participantId: string;

  /** New payment status */
  status: PaymentStatus;
}

/**
 * Settlement summary for a bill
 */
export interface SettlementSummary {
  /** Total bill amount in paise */
  totalAmountPaise: number;

  /** Total amount paid in paise */
  paidAmountPaise: number;

  /** Total amount pending in paise */
  pendingAmountPaise: number;

  /** Percentage paid (0-100) */
  paidPercentage: number;

  /** Percentage pending (0-100) */
  pendingPercentage: number;

  /** Number of participants who paid */
  paidCount: number;

  /** Number of participants pending */
  pendingCount: number;

  /** Total number of participants */
  totalCount: number;

  /** Whether bill is fully settled (all participants paid) */
  isFullySettled: boolean;

  /** Whether bill is partially settled (at least one participant paid) */
  isPartiallySettled: boolean;
}

/**
 * Remainder calculation result for unsettled amount
 */
export interface RemainderCalculation {
  /** Remaining amount to be paid in paise */
  remainingAmountPaise: number;

  /** Remaining amount in rupees (decimal) */
  remainingAmountRupees: number;

  /** List of participants who haven't paid */
  pendingParticipants: Participant[];

  /** Number of pending participants */
  pendingCount: number;
}

/**
 * Status transition validation result
 */
export interface StatusTransitionResult {
  /** Whether the transition is valid */
  isValid: boolean;

  /** Error message if invalid */
  error?: string;

  /** New status if valid */
  newStatus?: PaymentStatus;
}

/**
 * Updates payment status for a participant
 *
 * Validates the status transition and returns updated participant.
 * Does not mutate the original participant object.
 *
 * @param participant - Participant to update
 * @param newStatus - New payment status
 * @returns Updated participant with new status
 * @throws Error if participant is invalid
 *
 * @example
 * ```typescript
 * const updatedParticipant = updatePaymentStatus(participant, PaymentStatus.PAID);
 * console.log(updatedParticipant.status); // 'PAID'
 * ```
 */
export function updatePaymentStatus(
  participant: Participant,
  newStatus: PaymentStatus
): Participant {
  if (!participant) {
    throw new Error('Participant is required');
  }

  if (!participant.id) {
    throw new Error('Participant ID is required');
  }

  if (!Object.values(PaymentStatus).includes(newStatus)) {
    throw new Error(`Invalid payment status: ${newStatus}`);
  }

  // Return new participant object with updated status
  return {
    ...participant,
    status: newStatus,
  };
}

/**
 * Validates a status transition
 *
 * All transitions are valid in our simple model:
 * - PENDING → PAID (participant paid)
 * - PAID → PENDING (payment reverted/refunded)
 *
 * @param currentStatus - Current payment status
 * @param newStatus - Proposed new status
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateStatusTransition(PaymentStatus.PENDING, PaymentStatus.PAID);
 * if (result.isValid) {
 *   // Proceed with transition
 * }
 * ```
 */
export function validateStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): StatusTransitionResult {
  // Validate both statuses are valid enum values
  if (!Object.values(PaymentStatus).includes(currentStatus)) {
    return {
      isValid: false,
      error: `Invalid current status: ${currentStatus}`,
    };
  }

  if (!Object.values(PaymentStatus).includes(newStatus)) {
    return {
      isValid: false,
      error: `Invalid new status: ${newStatus}`,
    };
  }

  // No-op transition (same status)
  if (currentStatus === newStatus) {
    return {
      isValid: true,
      newStatus: currentStatus,
    };
  }

  // All other transitions are valid (PENDING ↔ PAID)
  return {
    isValid: true,
    newStatus,
  };
}

/**
 * Computes settlement summary for a bill
 *
 * Analyzes all participants and calculates aggregated payment statistics.
 * Determines if bill is fully settled, partially settled, or unsettled.
 *
 * @param bill - Bill to analyze
 * @returns Settlement summary with payment statistics
 * @throws Error if bill is invalid or has no participants
 *
 * @example
 * ```typescript
 * const summary = computeSettlementSummary(bill);
 * console.log(`Paid: ${summary.paidPercentage}%`);
 * console.log(`Fully settled: ${summary.isFullySettled}`);
 * ```
 */
export function computeSettlementSummary(bill: Bill): SettlementSummary {
  if (!bill) {
    throw new Error('Bill is required');
  }

  if (!bill.participants || bill.participants.length === 0) {
    throw new Error('Bill must have at least one participant');
  }

  const totalAmountPaise = bill.totalAmountPaise;
  const totalCount = bill.participants.length;

  // Calculate paid and pending amounts
  let paidAmountPaise = 0;
  let paidCount = 0;
  let pendingCount = 0;

  bill.participants.forEach((participant) => {
    if (participant.status === PaymentStatus.PAID) {
      paidAmountPaise += participant.amountPaise;
      paidCount++;
    } else {
      pendingCount++;
    }
  });

  const pendingAmountPaise = totalAmountPaise - paidAmountPaise;

  // Calculate percentages (avoid division by zero)
  const paidPercentage =
    totalAmountPaise > 0 ? (paidAmountPaise / totalAmountPaise) * 100 : 0;
  const pendingPercentage = 100 - paidPercentage;

  // Determine settlement status
  const isFullySettled = paidCount === totalCount && pendingAmountPaise === 0;
  const isPartiallySettled = paidCount > 0 && !isFullySettled;

  return {
    totalAmountPaise,
    paidAmountPaise,
    pendingAmountPaise,
    paidPercentage,
    pendingPercentage,
    paidCount,
    pendingCount,
    totalCount,
    isFullySettled,
    isPartiallySettled,
  };
}

/**
 * Calculates remainder for unsettled payments
 *
 * Returns remaining amount and list of pending participants.
 * Useful for generating payment reminders or follow-up UPI links.
 *
 * @param bill - Bill to analyze
 * @returns Remainder calculation with pending participants
 * @throws Error if bill is invalid
 *
 * @example
 * ```typescript
 * const remainder = calculateRemainder(bill);
 * if (remainder.pendingCount > 0) {
 *   console.log(`₹${remainder.remainingAmountRupees} pending`);
 *   remainder.pendingParticipants.forEach(p => {
 *     sendReminder(p);
 *   });
 * }
 * ```
 */
export function calculateRemainder(bill: Bill): RemainderCalculation {
  if (!bill) {
    throw new Error('Bill is required');
  }

  if (!bill.participants || bill.participants.length === 0) {
    throw new Error('Bill must have at least one participant');
  }

  // Find all pending participants
  const pendingParticipants = bill.participants.filter(
    (p) => p.status === PaymentStatus.PENDING
  );

  // Calculate remaining amount
  const remainingAmountPaise = pendingParticipants.reduce(
    (sum, p) => sum + p.amountPaise,
    0
  );

  const remainingAmountRupees = paiseToRupees(remainingAmountPaise);

  return {
    remainingAmountPaise,
    remainingAmountRupees,
    pendingParticipants,
    pendingCount: pendingParticipants.length,
  };
}

/**
 * Determines bill status based on payment settlement
 *
 * Returns SETTLED if all participants paid, otherwise ACTIVE.
 * Does not change DELETED status.
 *
 * @param bill - Bill to analyze
 * @returns Appropriate bill status
 * @throws Error if bill is invalid
 *
 * @example
 * ```typescript
 * const status = determineBillStatus(bill);
 * if (status === BillStatus.SETTLED) {
 *   showCelebration();
 * }
 * ```
 */
export function determineBillStatus(bill: Bill): BillStatus {
  if (!bill) {
    throw new Error('Bill is required');
  }

  // Don't change deleted status
  if (bill.status === BillStatus.DELETED) {
    return BillStatus.DELETED;
  }

  // Check if all participants paid
  const summary = computeSettlementSummary(bill);

  return summary.isFullySettled ? BillStatus.SETTLED : BillStatus.ACTIVE;
}

/**
 * Updates multiple participant statuses in bulk
 *
 * Applies multiple status updates efficiently without mutating original bill.
 * Returns new bill object with updated participants.
 *
 * @param bill - Bill to update
 * @param updates - Array of status updates
 * @returns Updated bill with new participant statuses
 * @throws Error if any update is invalid
 *
 * @example
 * ```typescript
 * const updates = [
 *   { participantId: 'p1', status: PaymentStatus.PAID },
 *   { participantId: 'p2', status: PaymentStatus.PAID },
 * ];
 * const updatedBill = updateBillPaymentStatuses(bill, updates);
 * ```
 */
export function updateBillPaymentStatuses(
  bill: Bill,
  updates: PaymentStatusUpdate[]
): Bill {
  if (!bill) {
    throw new Error('Bill is required');
  }

  if (!updates || updates.length === 0) {
    return bill; // No updates, return original
  }

  // Create map of updates for quick lookup
  const updateMap = new Map(updates.map((u) => [u.participantId, u.status]));

  // Update participants
  const updatedParticipants = bill.participants.map((participant) => {
    const newStatus = updateMap.get(participant.id);
    if (newStatus !== undefined) {
      return updatePaymentStatus(participant, newStatus);
    }
    return participant;
  });

  // Return new bill with updated participants
  const updatedBill: Bill = {
    ...bill,
    participants: updatedParticipants,
  };

  // Update bill status based on settlement
  const billStatus = determineBillStatus(updatedBill);

  return {
    ...updatedBill,
    status: billStatus,
  };
}

/**
 * Checks if a bill has any pending payments
 *
 * @param bill - Bill to check
 * @returns True if at least one participant is pending
 *
 * @example
 * ```typescript
 * if (hasPendingPayments(bill)) {
 *   sendReminders(bill);
 * }
 * ```
 */
export function hasPendingPayments(bill: Bill): boolean {
  if (!bill || !bill.participants) {
    return false;
  }

  return bill.participants.some((p) => p.status === PaymentStatus.PENDING);
}

/**
 * Checks if a bill is fully paid
 *
 * @param bill - Bill to check
 * @returns True if all participants have paid
 *
 * @example
 * ```typescript
 * if (isFullyPaid(bill)) {
 *   markAsSettled(bill);
 * }
 * ```
 */
export function isFullyPaid(bill: Bill): boolean {
  if (!bill || !bill.participants || bill.participants.length === 0) {
    return false;
  }

  return bill.participants.every((p) => p.status === PaymentStatus.PAID);
}
