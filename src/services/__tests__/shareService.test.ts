/**
 * Share Service Tests
 *
 * Comprehensive tests for share message generation and utilities
 */

import {
  generatePaymentMessage,
  generateReminderMessage,
  generateBillSummary,
  getShareErrorMessage,
} from '../shareService';
import type { Bill, Participant } from '../../types';
import type { ShareResult } from '../shareService';

describe('Share Service', () => {
  const mockBill: Bill = {
    id: '123',
    title: 'Dinner at Restaurant',
    totalAmountPaise: 10000,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    participants: [
      {
        id: 'p1',
        name: 'Alice',
        amountPaise: 5000,
        status: 'PENDING',
      },
      {
        id: 'p2',
        name: 'Bob',
        amountPaise: 5000,
        status: 'PAID',
      },
    ],
    status: 'ACTIVE',
  };

  const mockParticipant: Participant = mockBill.participants[0];
  const mockUPILink = 'upi://pay?pa=test@upi&pn=Test&am=50.00&tn=Dinner';

  describe('generatePaymentMessage', () => {
    it('should generate payment message with correct amount', () => {
      const message = generatePaymentMessage(mockBill, mockParticipant, mockUPILink);

      expect(message).toContain('₹50.00');
      expect(message).toContain('Dinner at Restaurant');
      expect(message).toContain(mockUPILink);
    });

    it('should include greeting and thanks', () => {
      const message = generatePaymentMessage(mockBill, mockParticipant, mockUPILink);

      expect(message).toContain('Hi! 👋');
      expect(message).toContain('Thanks! 🙏');
    });

    it('should format amount correctly with paise', () => {
      const participantWithPaise: Participant = {
        ...mockParticipant,
        amountPaise: 12345,
      };

      const message = generatePaymentMessage(mockBill, participantWithPaise, mockUPILink);

      expect(message).toContain('₹123.45');
    });

    it('should handle zero paise amounts', () => {
      const participantZero: Participant = {
        ...mockParticipant,
        amountPaise: 5000,
      };

      const message = generatePaymentMessage(mockBill, participantZero, mockUPILink);

      expect(message).toContain('₹50.00');
    });

    it('should handle large amounts', () => {
      const participantLarge: Participant = {
        ...mockParticipant,
        amountPaise: 100000000, // 1 crore paise = 10 lakh rupees
      };

      const message = generatePaymentMessage(mockBill, participantLarge, mockUPILink);

      expect(message).toContain('₹1000000.00');
    });
  });

  describe('generateReminderMessage', () => {
    it('should generate reminder with pending participants', () => {
      const pendingParticipants = [mockBill.participants[0]];
      const message = generateReminderMessage(mockBill, pendingParticipants);

      expect(message).toContain('Reminder');
      expect(message).toContain('Dinner at Restaurant');
      expect(message).toContain('Alice');
      expect(message).toContain('₹50.00');
    });

    it('should handle multiple pending participants', () => {
      const pendingParticipants = [
        {
          id: 'p1',
          name: 'Alice',
          amountPaise: 3000,
          status: 'PENDING' as const,
        },
        {
          id: 'p2',
          name: 'Bob',
          amountPaise: 4000,
          status: 'PENDING' as const,
        },
        {
          id: 'p3',
          name: 'Charlie',
          amountPaise: 3000,
          status: 'PENDING' as const,
        },
      ];

      const message = generateReminderMessage(mockBill, pendingParticipants);

      expect(message).toContain('Alice, Bob, Charlie');
      expect(message).toContain('₹100.00'); // 30 + 40 + 30
    });

    it('should include UPI link when provided', () => {
      const pendingParticipants = [mockBill.participants[0]];
      const message = generateReminderMessage(
        mockBill,
        pendingParticipants,
        mockUPILink
      );

      expect(message).toContain('Pay now:');
      expect(message).toContain(mockUPILink);
    });

    it('should not include UPI link when not provided', () => {
      const pendingParticipants = [mockBill.participants[0]];
      const message = generateReminderMessage(mockBill, pendingParticipants);

      expect(message).not.toContain('Pay now:');
      expect(message).not.toContain('upi://');
    });

    it('should calculate total pending amount correctly', () => {
      const pendingParticipants = [
        {
          id: 'p1',
          name: 'Alice',
          amountPaise: 12345,
          status: 'PENDING' as const,
        },
        {
          id: 'p2',
          name: 'Bob',
          amountPaise: 67890,
          status: 'PENDING' as const,
        },
      ];

      const message = generateReminderMessage(mockBill, pendingParticipants);

      expect(message).toContain('₹802.35'); // 123.45 + 678.90
    });
  });

  describe('generateBillSummary', () => {
    it('should generate complete bill summary', () => {
      const summary = generateBillSummary(mockBill);

      expect(summary).toContain('Bill: Dinner at Restaurant');
      expect(summary).toContain('Total: ₹100.00');
      expect(summary).toContain('Split 2 ways');
      expect(summary).toContain('Created with Vasooly');
    });

    it('should show pending status for pending participants', () => {
      const summary = generateBillSummary(mockBill);

      expect(summary).toContain('⏳ Alice: ₹50.00');
    });

    it('should show paid status for paid participants', () => {
      const summary = generateBillSummary(mockBill);

      expect(summary).toContain('✅ Bob: ₹50.00');
    });

    it('should handle bills with many participants', () => {
      const manyParticipantsBill: Bill = {
        ...mockBill,
        participants: Array.from({ length: 10 }, (_, i) => ({
          id: `p${i}`,
          name: `Person ${i + 1}`,
          amountPaise: 1000,
          status: i % 2 === 0 ? ('PAID' as const) : ('PENDING' as const),
        })),
      };

      const summary = generateBillSummary(manyParticipantsBill);

      expect(summary).toContain('Split 10 ways');
      expect(summary.split('\n').length).toBeGreaterThan(10);
    });

    it('should format amounts with paise correctly', () => {
      const bill: Bill = {
        ...mockBill,
        totalAmountPaise: 12345,
        participants: [
          {
            id: 'p1',
            name: 'Alice',
            amountPaise: 6173,
            status: 'PENDING',
          },
          {
            id: 'p2',
            name: 'Bob',
            amountPaise: 6172,
            status: 'PAID',
          },
        ],
      };

      const summary = generateBillSummary(bill);

      expect(summary).toContain('Total: ₹123.45');
      expect(summary).toContain('Alice: ₹61.73');
      expect(summary).toContain('Bob: ₹61.72');
    });
  });

  describe('getShareErrorMessage', () => {
    it('should return empty string for successful share', () => {
      const result: ShareResult = {
        success: true,
      };

      expect(getShareErrorMessage(result)).toBe('');
    });

    it('should return cancellation message', () => {
      const result: ShareResult = {
        success: false,
        cancelled: true,
        error: 'User cancelled',
      };

      expect(getShareErrorMessage(result)).toBe('Share cancelled');
    });

    it('should return error message', () => {
      const result: ShareResult = {
        success: false,
        error: 'Share failed',
      };

      expect(getShareErrorMessage(result)).toBe('Share failed');
    });

    it('should return empty string when no error', () => {
      const result: ShareResult = {
        success: false,
      };

      expect(getShareErrorMessage(result)).toBe('');
    });
  });
});
