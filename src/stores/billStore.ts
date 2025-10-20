/**
 * Bill Store - Zustand state management for bills
 * Manages bill creation, updates, deletion with SQLite persistence
 */

import { create } from 'zustand';
import { Bill, BillStatus, PaymentStatus } from '../types';
import {
  createBill as dbCreateBill,
  updateBill as dbUpdateBill,
  deleteBill as dbDeleteBill,
  restoreBill as dbRestoreBill,
  getBillById as dbGetBillById,
  getAllBills as dbGetAllBills,
  updateBillStatus as dbUpdateBillStatus,
  updateParticipantStatus as dbUpdateParticipantStatus,
} from '../lib/data/billRepository';

interface BillState {
  // State
  bills: Bill[];
  currentBill: Bill | null;
  isLoading: boolean;
  error: string | null;

  // Actions - Bill CRUD
  createBill: (bill: Bill) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
  restoreBill: (billId: string) => Promise<void>;
  loadBill: (billId: string) => Promise<void>;
  loadAllBills: () => Promise<void>;

  // Actions - Bill Status
  settleBill: (billId: string) => Promise<void>;
  markBillActive: (billId: string) => Promise<void>;

  // Actions - Participant Status
  markParticipantPaid: (billId: string, participantId: string) => Promise<void>;
  markParticipantPending: (billId: string, participantId: string) => Promise<void>;

  // Actions - Current Bill
  setCurrentBill: (bill: Bill | null) => void;
  clearCurrentBill: () => void;

  // Actions - Error Handling
  clearError: () => void;

  // Selectors (derived state)
  getBillById: (billId: string) => Bill | undefined;
  getPendingBills: () => Bill[];
  getSettledBills: () => Bill[];
  getNetBalance: () => number;
}

export const useBillStore = create<BillState>((set, get) => ({
  // Initial State
  bills: [],
  currentBill: null,
  isLoading: false,
  error: null,

  // Create Bill
  createBill: async (bill: Bill) => {
    set({ isLoading: true, error: null });
    try {
      await dbCreateBill(bill);
      set((state) => ({
        bills: [bill, ...state.bills],
        currentBill: bill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bill';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update Bill
  updateBill: async (bill: Bill) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update
      const updatedBill = { ...bill, updatedAt: new Date() };
      set((state) => ({
        bills: state.bills.map((b) => (b.id === bill.id ? updatedBill : b)),
        currentBill: state.currentBill?.id === bill.id ? updatedBill : state.currentBill,
      }));

      await dbUpdateBill(updatedBill);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bill';
      // Rollback on error - reload from DB
      const currentBills = await dbGetAllBills();
      set({
        bills: currentBills,
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete Bill (soft delete)
  deleteBill: async (billId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbDeleteBill(billId);
      set((state) => ({
        bills: state.bills.filter((b) => b.id !== billId),
        currentBill: state.currentBill?.id === billId ? null : state.currentBill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bill';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Restore Bill
  restoreBill: async (billId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbRestoreBill(billId);
      const restoredBill = await dbGetBillById(billId);
      if (restoredBill) {
        set((state) => ({
          bills: [restoredBill, ...state.bills],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore bill';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Load Single Bill
  loadBill: async (billId: string) => {
    set({ isLoading: true, error: null });
    try {
      const bill = await dbGetBillById(billId);
      set({
        currentBill: bill,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bill';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Load All Bills
  loadAllBills: async () => {
    set({ isLoading: true, error: null });
    try {
      const bills = await dbGetAllBills();
      set({
        bills,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bills';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Settle Bill
  settleBill: async (billId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbUpdateBillStatus(billId, BillStatus.SETTLED);
      set((state) => ({
        bills: state.bills.map((b) =>
          b.id === billId ? { ...b, status: BillStatus.SETTLED, updatedAt: new Date() } : b
        ),
        currentBill:
          state.currentBill?.id === billId
            ? { ...state.currentBill, status: BillStatus.SETTLED, updatedAt: new Date() }
            : state.currentBill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to settle bill';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Mark Bill Active
  markBillActive: async (billId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbUpdateBillStatus(billId, BillStatus.ACTIVE);
      set((state) => ({
        bills: state.bills.map((b) =>
          b.id === billId ? { ...b, status: BillStatus.ACTIVE, updatedAt: new Date() } : b
        ),
        currentBill:
          state.currentBill?.id === billId
            ? { ...state.currentBill, status: BillStatus.ACTIVE, updatedAt: new Date() }
            : state.currentBill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark bill active';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Mark Participant Paid
  markParticipantPaid: async (billId: string, participantId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbUpdateParticipantStatus(participantId, PaymentStatus.PAID);
      set((state) => ({
        bills: state.bills.map((b) =>
          b.id === billId
            ? {
                ...b,
                participants: b.participants.map((p) =>
                  p.id === participantId ? { ...p, status: PaymentStatus.PAID } : p
                ),
                updatedAt: new Date(),
              }
            : b
        ),
        currentBill:
          state.currentBill?.id === billId
            ? {
                ...state.currentBill,
                participants: state.currentBill.participants.map((p) =>
                  p.id === participantId ? { ...p, status: PaymentStatus.PAID } : p
                ),
                updatedAt: new Date(),
              }
            : state.currentBill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to mark participant paid';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Mark Participant Pending
  markParticipantPending: async (billId: string, participantId: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbUpdateParticipantStatus(participantId, PaymentStatus.PENDING);
      set((state) => ({
        bills: state.bills.map((b) =>
          b.id === billId
            ? {
                ...b,
                participants: b.participants.map((p) =>
                  p.id === participantId ? { ...p, status: PaymentStatus.PENDING } : p
                ),
                updatedAt: new Date(),
              }
            : b
        ),
        currentBill:
          state.currentBill?.id === billId
            ? {
                ...state.currentBill,
                participants: state.currentBill.participants.map((p) =>
                  p.id === participantId ? { ...p, status: PaymentStatus.PENDING } : p
                ),
                updatedAt: new Date(),
              }
            : state.currentBill,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to mark participant pending';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Current Bill
  setCurrentBill: (bill: Bill | null) => {
    set({ currentBill: bill });
  },

  // Clear Current Bill
  clearCurrentBill: () => {
    set({ currentBill: null });
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Selectors
  getBillById: (billId: string) => {
    return get().bills.find((b) => b.id === billId);
  },

  getPendingBills: () => {
    return get().bills.filter((b) => b.status === BillStatus.ACTIVE);
  },

  getSettledBills: () => {
    return get().bills.filter((b) => b.status === BillStatus.SETTLED);
  },

  /**
   * Get net balance across all active bills
   * Returns positive value if you are owed money (total PENDING payments)
   * Note: Current model tracks money owed TO you, not what you owe others
   */
  getNetBalance: () => {
    const activeBills = get().bills.filter((b) => b.status === BillStatus.ACTIVE);

    let totalOwedToPaise = 0; // Money owed to you (PENDING participants)

    activeBills.forEach((bill) => {
      bill.participants.forEach((participant) => {
        if (participant.status === PaymentStatus.PENDING) {
          totalOwedToPaise += participant.amountPaise;
        }
      });
    });

    return totalOwedToPaise;
  },
}));
