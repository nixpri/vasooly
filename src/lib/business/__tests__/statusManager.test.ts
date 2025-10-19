/**
 * Status Manager Tests
 *
 * Comprehensive test suite for payment status management.
 * Target: 90%+ code coverage with all edge cases.
 */

import {
  updatePaymentStatus,
  validateStatusTransition,
  computeSettlementSummary,
  calculateRemainder,
  determineBillStatus,
  updateBillPaymentStatuses,
  hasPendingPayments,
  isFullyPaid,
} from '../statusManager';
import { Bill, BillStatus, Participant, PaymentStatus } from '../../../types';

describe('Status Manager', () => {
  // Helper function to create test bills
  const createTestBill = (overrides?: Partial<Bill>): Bill => ({
    id: 'bill-1',
    title: 'Test Bill',
    totalAmountPaise: 10000, // ₹100.00
    createdAt: new Date(),
    updatedAt: new Date(),
    status: BillStatus.ACTIVE,
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
        status: PaymentStatus.PENDING,
      },
    ],
    ...overrides,
  });

  const createTestParticipant = (
    overrides?: Partial<Participant>
  ): Participant => ({
    id: 'p1',
    name: 'Test Participant',
    amountPaise: 5000,
    status: PaymentStatus.PENDING,
    ...overrides,
  });

  describe('updatePaymentStatus', () => {
    it('should update participant status to PAID', () => {
      const participant = createTestParticipant();
      const updated = updatePaymentStatus(participant, PaymentStatus.PAID);

      expect(updated.status).toBe(PaymentStatus.PAID);
      expect(updated.id).toBe(participant.id);
      expect(updated.name).toBe(participant.name);
      expect(updated.amountPaise).toBe(participant.amountPaise);
    });

    it('should update participant status to PENDING', () => {
      const participant = createTestParticipant({
        status: PaymentStatus.PAID,
      });
      const updated = updatePaymentStatus(participant, PaymentStatus.PENDING);

      expect(updated.status).toBe(PaymentStatus.PENDING);
    });

    it('should not mutate original participant', () => {
      const participant = createTestParticipant();
      const originalStatus = participant.status;

      updatePaymentStatus(participant, PaymentStatus.PAID);

      expect(participant.status).toBe(originalStatus);
    });

    it('should throw error for null participant', () => {
      expect(() =>
        updatePaymentStatus(null as any, PaymentStatus.PAID)
      ).toThrow('Participant is required');
    });

    it('should throw error for participant without ID', () => {
      const participant = createTestParticipant();
      delete (participant as any).id;

      expect(() =>
        updatePaymentStatus(participant, PaymentStatus.PAID)
      ).toThrow('Participant ID is required');
    });

    it('should throw error for invalid status', () => {
      const participant = createTestParticipant();

      expect(() =>
        updatePaymentStatus(participant, 'INVALID' as any)
      ).toThrow('Invalid payment status');
    });
  });

  describe('validateStatusTransition', () => {
    it('should validate PENDING to PAID transition', () => {
      const result = validateStatusTransition(
        PaymentStatus.PENDING,
        PaymentStatus.PAID
      );

      expect(result.isValid).toBe(true);
      expect(result.newStatus).toBe(PaymentStatus.PAID);
      expect(result.error).toBeUndefined();
    });

    it('should validate PAID to PENDING transition', () => {
      const result = validateStatusTransition(
        PaymentStatus.PAID,
        PaymentStatus.PENDING
      );

      expect(result.isValid).toBe(true);
      expect(result.newStatus).toBe(PaymentStatus.PENDING);
    });

    it('should validate same status transition (no-op)', () => {
      const result1 = validateStatusTransition(
        PaymentStatus.PENDING,
        PaymentStatus.PENDING
      );
      expect(result1.isValid).toBe(true);
      expect(result1.newStatus).toBe(PaymentStatus.PENDING);

      const result2 = validateStatusTransition(
        PaymentStatus.PAID,
        PaymentStatus.PAID
      );
      expect(result2.isValid).toBe(true);
      expect(result2.newStatus).toBe(PaymentStatus.PAID);
    });

    it('should reject invalid current status', () => {
      const result = validateStatusTransition(
        'INVALID' as any,
        PaymentStatus.PAID
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid current status');
    });

    it('should reject invalid new status', () => {
      const result = validateStatusTransition(
        PaymentStatus.PENDING,
        'INVALID' as any
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid new status');
    });
  });

  describe('computeSettlementSummary', () => {
    it('should compute summary for bill with all pending', () => {
      const bill = createTestBill();
      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(10000);
      expect(summary.paidAmountPaise).toBe(0);
      expect(summary.pendingAmountPaise).toBe(10000);
      expect(summary.paidPercentage).toBe(0);
      expect(summary.pendingPercentage).toBe(100);
      expect(summary.paidCount).toBe(0);
      expect(summary.pendingCount).toBe(2);
      expect(summary.totalCount).toBe(2);
      expect(summary.isFullySettled).toBe(false);
      expect(summary.isPartiallySettled).toBe(false);
    });

    it('should compute summary for bill with all paid', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
      });

      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(10000);
      expect(summary.paidAmountPaise).toBe(10000);
      expect(summary.pendingAmountPaise).toBe(0);
      expect(summary.paidPercentage).toBe(100);
      expect(summary.pendingPercentage).toBe(0);
      expect(summary.paidCount).toBe(2);
      expect(summary.pendingCount).toBe(0);
      expect(summary.totalCount).toBe(2);
      expect(summary.isFullySettled).toBe(true);
      expect(summary.isPartiallySettled).toBe(false);
    });

    it('should compute summary for bill with partial payment', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(10000);
      expect(summary.paidAmountPaise).toBe(5000);
      expect(summary.pendingAmountPaise).toBe(5000);
      expect(summary.paidPercentage).toBe(50);
      expect(summary.pendingPercentage).toBe(50);
      expect(summary.paidCount).toBe(1);
      expect(summary.pendingCount).toBe(1);
      expect(summary.totalCount).toBe(2);
      expect(summary.isFullySettled).toBe(false);
      expect(summary.isPartiallySettled).toBe(true);
    });

    it('should handle bill with many participants', () => {
      const participants: Participant[] = [];
      for (let i = 0; i < 100; i++) {
        participants.push({
          id: `p${i}`,
          name: `Participant ${i}`,
          amountPaise: 100,
          status: i < 50 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        });
      }

      const bill = createTestBill({
        totalAmountPaise: 10000,
        participants,
      });

      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(10000);
      expect(summary.paidAmountPaise).toBe(5000);
      expect(summary.paidCount).toBe(50);
      expect(summary.pendingCount).toBe(50);
      expect(summary.paidPercentage).toBe(50);
      expect(summary.isPartiallySettled).toBe(true);
    });

    it('should handle unequal split amounts', () => {
      const bill = createTestBill({
        totalAmountPaise: 10050,
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 3350,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 3350,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p3',
            name: 'Charlie',
            amountPaise: 3350,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(10050);
      expect(summary.paidAmountPaise).toBe(6700);
      expect(summary.pendingAmountPaise).toBe(3350);
      expect(summary.paidPercentage).toBeCloseTo(66.67, 1);
      expect(summary.isPartiallySettled).toBe(true);
    });

    it('should throw error for null bill', () => {
      expect(() => computeSettlementSummary(null as any)).toThrow(
        'Bill is required'
      );
    });

    it('should throw error for bill without participants', () => {
      const bill = createTestBill({ participants: [] });

      expect(() => computeSettlementSummary(bill)).toThrow(
        'Bill must have at least one participant'
      );
    });

    it('should handle zero amount bill (edge case)', () => {
      const bill = createTestBill({
        totalAmountPaise: 0,
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 0,
            status: PaymentStatus.PAID,
          },
        ],
      });

      const summary = computeSettlementSummary(bill);

      expect(summary.totalAmountPaise).toBe(0);
      expect(summary.paidPercentage).toBe(0); // Avoids division by zero
      expect(summary.pendingPercentage).toBe(100);
    });
  });

  describe('calculateRemainder', () => {
    it('should calculate remainder for bill with pending payments', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const remainder = calculateRemainder(bill);

      expect(remainder.remainingAmountPaise).toBe(5000);
      expect(remainder.remainingAmountRupees).toBe(50);
      expect(remainder.pendingParticipants).toHaveLength(1);
      expect(remainder.pendingParticipants[0].name).toBe('Bob');
      expect(remainder.pendingCount).toBe(1);
    });

    it('should return zero remainder for fully paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
      });

      const remainder = calculateRemainder(bill);

      expect(remainder.remainingAmountPaise).toBe(0);
      expect(remainder.remainingAmountRupees).toBe(0);
      expect(remainder.pendingParticipants).toHaveLength(0);
      expect(remainder.pendingCount).toBe(0);
    });

    it('should calculate remainder for all pending bill', () => {
      const bill = createTestBill();
      const remainder = calculateRemainder(bill);

      expect(remainder.remainingAmountPaise).toBe(10000);
      expect(remainder.remainingAmountRupees).toBe(100);
      expect(remainder.pendingParticipants).toHaveLength(2);
      expect(remainder.pendingCount).toBe(2);
    });

    it('should handle multiple pending participants', () => {
      const bill = createTestBill({
        totalAmountPaise: 15000,
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
          {
            id: 'p3',
            name: 'Charlie',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const remainder = calculateRemainder(bill);

      expect(remainder.remainingAmountPaise).toBe(10000);
      expect(remainder.pendingParticipants).toHaveLength(2);
      expect(remainder.pendingCount).toBe(2);
    });

    it('should throw error for null bill', () => {
      expect(() => calculateRemainder(null as any)).toThrow(
        'Bill is required'
      );
    });

    it('should throw error for bill without participants', () => {
      const bill = createTestBill({ participants: [] });

      expect(() => calculateRemainder(bill)).toThrow(
        'Bill must have at least one participant'
      );
    });
  });

  describe('determineBillStatus', () => {
    it('should return ACTIVE for bill with pending payments', () => {
      const bill = createTestBill();
      const status = determineBillStatus(bill);

      expect(status).toBe(BillStatus.ACTIVE);
    });

    it('should return SETTLED for fully paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
      });

      const status = determineBillStatus(bill);

      expect(status).toBe(BillStatus.SETTLED);
    });

    it('should return ACTIVE for partially paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const status = determineBillStatus(bill);

      expect(status).toBe(BillStatus.ACTIVE);
    });

    it('should preserve DELETED status', () => {
      const bill = createTestBill({
        status: BillStatus.DELETED,
      });

      const status = determineBillStatus(bill);

      expect(status).toBe(BillStatus.DELETED);
    });

    it('should throw error for null bill', () => {
      expect(() => determineBillStatus(null as any)).toThrow(
        'Bill is required'
      );
    });
  });

  describe('updateBillPaymentStatuses', () => {
    it('should update single participant status', () => {
      const bill = createTestBill();
      const updates = [{ participantId: 'p1', status: PaymentStatus.PAID }];

      const updatedBill = updateBillPaymentStatuses(bill, updates);

      expect(updatedBill.participants[0].status).toBe(PaymentStatus.PAID);
      expect(updatedBill.participants[1].status).toBe(PaymentStatus.PENDING);
      expect(updatedBill.status).toBe(BillStatus.ACTIVE);
    });

    it('should update multiple participant statuses', () => {
      const bill = createTestBill();
      const updates = [
        { participantId: 'p1', status: PaymentStatus.PAID },
        { participantId: 'p2', status: PaymentStatus.PAID },
      ];

      const updatedBill = updateBillPaymentStatuses(bill, updates);

      expect(updatedBill.participants[0].status).toBe(PaymentStatus.PAID);
      expect(updatedBill.participants[1].status).toBe(PaymentStatus.PAID);
      expect(updatedBill.status).toBe(BillStatus.SETTLED);
    });

    it('should update bill status to SETTLED when all paid', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      const updates = [{ participantId: 'p2', status: PaymentStatus.PAID }];
      const updatedBill = updateBillPaymentStatuses(bill, updates);

      expect(updatedBill.status).toBe(BillStatus.SETTLED);
    });

    it('should not mutate original bill', () => {
      const bill = createTestBill();
      const originalParticipantStatus = bill.participants[0].status;

      updateBillPaymentStatuses(bill, [
        { participantId: 'p1', status: PaymentStatus.PAID },
      ]);

      expect(bill.participants[0].status).toBe(originalParticipantStatus);
      expect(bill.status).toBe(BillStatus.ACTIVE);
    });

    it('should return original bill for empty updates', () => {
      const bill = createTestBill();
      const updatedBill = updateBillPaymentStatuses(bill, []);

      expect(updatedBill).toBe(bill);
    });

    it('should ignore updates for non-existent participants', () => {
      const bill = createTestBill();
      const updates = [
        { participantId: 'p1', status: PaymentStatus.PAID },
        { participantId: 'p999', status: PaymentStatus.PAID }, // Non-existent
      ];

      const updatedBill = updateBillPaymentStatuses(bill, updates);

      expect(updatedBill.participants[0].status).toBe(PaymentStatus.PAID);
      expect(updatedBill.participants[1].status).toBe(PaymentStatus.PENDING);
    });

    it('should throw error for null bill', () => {
      expect(() =>
        updateBillPaymentStatuses(null as any, [])
      ).toThrow('Bill is required');
    });
  });

  describe('hasPendingPayments', () => {
    it('should return true for bill with pending payments', () => {
      const bill = createTestBill();
      expect(hasPendingPayments(bill)).toBe(true);
    });

    it('should return false for fully paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
      });

      expect(hasPendingPayments(bill)).toBe(false);
    });

    it('should return true for partially paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      expect(hasPendingPayments(bill)).toBe(true);
    });

    it('should return false for null bill', () => {
      expect(hasPendingPayments(null as any)).toBe(false);
    });

    it('should return false for bill without participants', () => {
      const bill = createTestBill({ participants: [] });
      expect(hasPendingPayments(bill)).toBe(false);
    });
  });

  describe('isFullyPaid', () => {
    it('should return false for bill with pending payments', () => {
      const bill = createTestBill();
      expect(isFullyPaid(bill)).toBe(false);
    });

    it('should return true for fully paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
      });

      expect(isFullyPaid(bill)).toBe(true);
    });

    it('should return false for partially paid bill', () => {
      const bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      expect(isFullyPaid(bill)).toBe(false);
    });

    it('should return false for null bill', () => {
      expect(isFullyPaid(null as any)).toBe(false);
    });

    it('should return false for bill without participants', () => {
      const bill = createTestBill({ participants: [] });
      expect(isFullyPaid(bill)).toBe(false);
    });
  });

  describe('Integration: Complete payment flow', () => {
    it('should handle full payment lifecycle', () => {
      // Step 1: Create bill with all pending
      let bill = createTestBill({
        totalAmountPaise: 15000,
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
            status: PaymentStatus.PENDING,
          },
          {
            id: 'p3',
            name: 'Charlie',
            amountPaise: 5000,
            status: PaymentStatus.PENDING,
          },
        ],
      });

      // Verify initial state
      expect(hasPendingPayments(bill)).toBe(true);
      expect(isFullyPaid(bill)).toBe(false);

      const initialSummary = computeSettlementSummary(bill);
      expect(initialSummary.paidPercentage).toBe(0);
      expect(initialSummary.pendingPercentage).toBe(100);

      // Step 2: Alice pays
      bill = updateBillPaymentStatuses(bill, [
        { participantId: 'p1', status: PaymentStatus.PAID },
      ]);

      const partialSummary1 = computeSettlementSummary(bill);
      expect(partialSummary1.paidPercentage).toBeCloseTo(33.33, 1);
      expect(partialSummary1.isPartiallySettled).toBe(true);
      expect(bill.status).toBe(BillStatus.ACTIVE);

      // Step 3: Bob pays
      bill = updateBillPaymentStatuses(bill, [
        { participantId: 'p2', status: PaymentStatus.PAID },
      ]);

      const partialSummary2 = computeSettlementSummary(bill);
      expect(partialSummary2.paidPercentage).toBeCloseTo(66.67, 1);
      expect(partialSummary2.isPartiallySettled).toBe(true);
      expect(bill.status).toBe(BillStatus.ACTIVE);

      // Step 4: Charlie pays (bill fully settled)
      bill = updateBillPaymentStatuses(bill, [
        { participantId: 'p3', status: PaymentStatus.PAID },
      ]);

      const finalSummary = computeSettlementSummary(bill);
      expect(finalSummary.paidPercentage).toBe(100);
      expect(finalSummary.isFullySettled).toBe(true);
      expect(finalSummary.isPartiallySettled).toBe(false);
      expect(bill.status).toBe(BillStatus.SETTLED);
      expect(isFullyPaid(bill)).toBe(true);
      expect(hasPendingPayments(bill)).toBe(false);

      // Step 5: Verify remainder is zero
      const remainder = calculateRemainder(bill);
      expect(remainder.remainingAmountPaise).toBe(0);
      expect(remainder.pendingCount).toBe(0);
    });

    it('should handle payment reversal flow', () => {
      // Start with fully paid bill
      let bill = createTestBill({
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 5000,
            status: PaymentStatus.PAID,
          },
        ],
        status: BillStatus.SETTLED,
      });

      expect(isFullyPaid(bill)).toBe(true);

      // Revert Bob's payment
      bill = updateBillPaymentStatuses(bill, [
        { participantId: 'p2', status: PaymentStatus.PENDING },
      ]);

      expect(bill.status).toBe(BillStatus.ACTIVE);
      expect(isFullyPaid(bill)).toBe(false);
      expect(hasPendingPayments(bill)).toBe(true);

      const summary = computeSettlementSummary(bill);
      expect(summary.paidPercentage).toBe(50);
      expect(summary.isPartiallySettled).toBe(true);

      const remainder = calculateRemainder(bill);
      expect(remainder.remainingAmountPaise).toBe(5000);
      expect(remainder.pendingCount).toBe(1);
    });
  });
});
