/**
 * Bill Store Tests
 * Comprehensive tests for Zustand bill state management
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useBillStore } from '../billStore';
import { Bill, BillStatus, PaymentStatus } from '../../types';
import * as billRepository from '../../lib/data/billRepository';

// Mock the bill repository
jest.mock('../../lib/data/billRepository');

const mockBillRepository = billRepository as jest.Mocked<typeof billRepository>;

describe('useBillStore', () => {
  // Test data
  const mockBill: Bill = {
    id: 'bill-1',
    title: 'Team Lunch',
    totalAmountPaise: 120000,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    status: BillStatus.ACTIVE,
    participants: [
      {
        id: 'p1',
        name: 'Alice',
        phone: '9876543210',
        amountPaise: 40000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'p2',
        name: 'Bob',
        phone: '9876543211',
        amountPaise: 40000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'p3',
        name: 'Charlie',
        amountPaise: 40000,
        status: PaymentStatus.PENDING,
      },
    ],
  };

  const mockBill2: Bill = {
    id: 'bill-2',
    title: 'Movie Night',
    totalAmountPaise: 60000,
    createdAt: new Date('2025-01-21'),
    updatedAt: new Date('2025-01-21'),
    status: BillStatus.ACTIVE,
    participants: [
      {
        id: 'p4',
        name: 'Dave',
        amountPaise: 30000,
        status: PaymentStatus.PAID,
      },
      {
        id: 'p5',
        name: 'Eve',
        amountPaise: 30000,
        status: PaymentStatus.PENDING,
      },
    ],
  };

  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useBillStore());
    act(() => {
      result.current.bills = [];
      result.current.currentBill = null;
      result.current.isLoading = false;
      result.current.error = null;
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBillStore());

      expect(result.current.bills).toEqual([]);
      expect(result.current.currentBill).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createBill', () => {
    it('should create a bill successfully', async () => {
      mockBillRepository.createBill.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      await act(async () => {
        await result.current.createBill(mockBill);
      });

      expect(mockBillRepository.createBill).toHaveBeenCalledWith(mockBill);
      expect(result.current.bills).toHaveLength(1);
      expect(result.current.bills[0]).toEqual(mockBill);
      expect(result.current.currentBill).toEqual(mockBill);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle create bill error', async () => {
      const errorMessage = 'Database error';
      mockBillRepository.createBill.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useBillStore());

      await act(async () => {
        try {
          await result.current.createBill(mockBill);
        } catch {
          // Expected error
        }
      });

      expect(result.current.bills).toHaveLength(0);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateBill', () => {
    it('should update a bill successfully', async () => {
      mockBillRepository.updateBill.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      // Set initial state
      act(() => {
        result.current.bills = [mockBill];
        result.current.currentBill = mockBill;
      });

      const updatedBill = { ...mockBill, title: 'Updated Title' };

      await act(async () => {
        await result.current.updateBill(updatedBill);
      });

      expect(mockBillRepository.updateBill).toHaveBeenCalled();
      expect(result.current.bills[0].title).toBe('Updated Title');
      expect(result.current.currentBill?.title).toBe('Updated Title');
      expect(result.current.isLoading).toBe(false);
    });

    it('should rollback on update error', async () => {
      const errorMessage = 'Update failed';
      mockBillRepository.updateBill.mockRejectedValueOnce(new Error(errorMessage));
      mockBillRepository.getAllBills.mockResolvedValueOnce([mockBill]);

      const { result } = renderHook(() => useBillStore());

      // Set initial state
      act(() => {
        result.current.bills = [mockBill];
      });

      const updatedBill = { ...mockBill, title: 'Updated Title' };

      await act(async () => {
        try {
          await result.current.updateBill(updatedBill);
        } catch {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.bills).toEqual([mockBill]);
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });

  describe('deleteBill', () => {
    it('should delete a bill successfully', async () => {
      mockBillRepository.deleteBill.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      // Set initial state
      act(() => {
        result.current.bills = [mockBill, mockBill2];
        result.current.currentBill = mockBill;
      });

      await act(async () => {
        await result.current.deleteBill(mockBill.id);
      });

      expect(mockBillRepository.deleteBill).toHaveBeenCalledWith(mockBill.id);
      expect(result.current.bills).toHaveLength(1);
      expect(result.current.bills[0].id).toBe(mockBill2.id);
      expect(result.current.currentBill).toBeNull();
    });

    it('should handle delete error', async () => {
      const errorMessage = 'Delete failed';
      mockBillRepository.deleteBill.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.bills = [mockBill];
      });

      await act(async () => {
        try {
          await result.current.deleteBill(mockBill.id);
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.bills).toHaveLength(1);
    });
  });

  describe('restoreBill', () => {
    it('should restore a bill successfully', async () => {
      mockBillRepository.restoreBill.mockResolvedValueOnce();
      mockBillRepository.getBillById.mockResolvedValueOnce(mockBill);

      const { result } = renderHook(() => useBillStore());

      await act(async () => {
        await result.current.restoreBill(mockBill.id);
      });

      expect(mockBillRepository.restoreBill).toHaveBeenCalledWith(mockBill.id);
      expect(mockBillRepository.getBillById).toHaveBeenCalledWith(mockBill.id);
      expect(result.current.bills).toHaveLength(1);
      expect(result.current.bills[0]).toEqual(mockBill);
    });
  });

  describe('loadBill', () => {
    it('should load a single bill successfully', async () => {
      mockBillRepository.getBillById.mockResolvedValueOnce(mockBill);

      const { result } = renderHook(() => useBillStore());

      await act(async () => {
        await result.current.loadBill(mockBill.id);
      });

      expect(mockBillRepository.getBillById).toHaveBeenCalledWith(mockBill.id);
      expect(result.current.currentBill).toEqual(mockBill);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('loadAllBills', () => {
    it('should load all bills successfully', async () => {
      mockBillRepository.getAllBills.mockResolvedValueOnce([mockBill, mockBill2]);

      const { result } = renderHook(() => useBillStore());

      await act(async () => {
        await result.current.loadAllBills();
      });

      expect(mockBillRepository.getAllBills).toHaveBeenCalled();
      expect(result.current.bills).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('settleBill', () => {
    it('should settle a bill successfully', async () => {
      mockBillRepository.updateBillStatus.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.bills = [mockBill];
        result.current.currentBill = mockBill;
      });

      await act(async () => {
        await result.current.settleBill(mockBill.id);
      });

      expect(mockBillRepository.updateBillStatus).toHaveBeenCalledWith(
        mockBill.id,
        BillStatus.SETTLED
      );
      expect(result.current.bills[0].status).toBe(BillStatus.SETTLED);
      expect(result.current.currentBill?.status).toBe(BillStatus.SETTLED);
    });
  });

  describe('markBillActive', () => {
    it('should mark a bill as active', async () => {
      mockBillRepository.updateBillStatus.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      const settledBill = { ...mockBill, status: BillStatus.SETTLED };
      act(() => {
        result.current.bills = [settledBill];
      });

      await act(async () => {
        await result.current.markBillActive(mockBill.id);
      });

      expect(mockBillRepository.updateBillStatus).toHaveBeenCalledWith(
        mockBill.id,
        BillStatus.ACTIVE
      );
      expect(result.current.bills[0].status).toBe(BillStatus.ACTIVE);
    });
  });

  describe('markParticipantPaid', () => {
    it('should mark a participant as paid', async () => {
      mockBillRepository.updateParticipantStatus.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.bills = [mockBill];
        result.current.currentBill = mockBill;
      });

      await act(async () => {
        await result.current.markParticipantPaid(mockBill.id, 'p1');
      });

      expect(mockBillRepository.updateParticipantStatus).toHaveBeenCalledWith(
        'p1',
        PaymentStatus.PAID
      );
      expect(result.current.bills[0].participants[0].status).toBe(PaymentStatus.PAID);
      expect(result.current.currentBill?.participants[0].status).toBe(PaymentStatus.PAID);
    });
  });

  describe('markParticipantPending', () => {
    it('should mark a participant as pending', async () => {
      mockBillRepository.updateParticipantStatus.mockResolvedValueOnce();

      const { result } = renderHook(() => useBillStore());

      const billWithPaidParticipant = {
        ...mockBill,
        participants: [
          { ...mockBill.participants[0], status: PaymentStatus.PAID },
          ...mockBill.participants.slice(1),
        ],
      };

      act(() => {
        result.current.bills = [billWithPaidParticipant];
        result.current.currentBill = billWithPaidParticipant;
      });

      await act(async () => {
        await result.current.markParticipantPending(mockBill.id, 'p1');
      });

      expect(mockBillRepository.updateParticipantStatus).toHaveBeenCalledWith(
        'p1',
        PaymentStatus.PENDING
      );
      expect(result.current.bills[0].participants[0].status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useBillStore());
      act(() => {
        result.current.bills = [
          mockBill,
          mockBill2,
          { ...mockBill, id: 'bill-3', status: BillStatus.SETTLED },
        ];
      });
    });

    it('should get bill by id', () => {
      const { result } = renderHook(() => useBillStore());

      const bill = result.current.getBillById(mockBill.id);
      expect(bill).toEqual(mockBill);
    });

    it('should return undefined for non-existent bill', () => {
      const { result } = renderHook(() => useBillStore());

      const bill = result.current.getBillById('non-existent');
      expect(bill).toBeUndefined();
    });

    it('should get pending bills', () => {
      const { result } = renderHook(() => useBillStore());

      const pending = result.current.getPendingBills();
      expect(pending).toHaveLength(2);
      expect(pending.every((b) => b.status === BillStatus.ACTIVE)).toBe(true);
    });

    it('should get settled bills', () => {
      const { result } = renderHook(() => useBillStore());

      const settled = result.current.getSettledBills();
      expect(settled).toHaveLength(1);
      expect(settled[0].status).toBe(BillStatus.SETTLED);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Current Bill Management', () => {
    it('should set current bill', () => {
      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.setCurrentBill(mockBill);
      });

      expect(result.current.currentBill).toEqual(mockBill);
    });

    it('should clear current bill', () => {
      const { result } = renderHook(() => useBillStore());

      act(() => {
        result.current.currentBill = mockBill;
      });

      expect(result.current.currentBill).toEqual(mockBill);

      act(() => {
        result.current.clearCurrentBill();
      });

      expect(result.current.currentBill).toBeNull();
    });
  });
});
