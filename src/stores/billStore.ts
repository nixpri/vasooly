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
import { determineBillStatus } from '../lib/business/statusManager';

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
      // Get the bill before deleting to update karzedaar stats
      const billToDelete = get().bills.find((b) => b.id === billId);

      await dbDeleteBill(billId);
      set((state) => ({
        bills: state.bills.filter((b) => b.id !== billId),
        currentBill: state.currentBill?.id === billId ? null : state.currentBill,
        isLoading: false,
      }));

      // Update karzedaar stats after successful deletion
      if (billToDelete) {
        // Import karzedaarsStore to update stats
        const { useKarzedaarsStore } = await import('./karzedaarsStore');
        const { updateKarzedaarStats, karzedaars, removeKarzedaar } = useKarzedaarsStore.getState();

        // Update stats for each participant (decrement)
        for (const participant of billToDelete.participants) {
          const trimmedName = participant.name.trim();
          // Skip current user (You or empty)
          if (trimmedName === '' || trimmedName.toLowerCase() === 'you') continue;

          await updateKarzedaarStats(participant.name, participant.amountPaise, false);

          // Check if karzedaar now has zero bills and remove them
          const karzedaar = karzedaars.find(
            (k) => k.name.toLowerCase() === participant.name.toLowerCase()
          );
          if (karzedaar && karzedaar.billCount <= 1) {
            // This was their last bill, remove the karzedaar
            console.log(`Removing karzedaar ${karzedaar.name} after deleting last bill`);
            await removeKarzedaar(karzedaar.id);
          }
        }
      }
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

      // Data migration: Fix "You" participants that are marked as PENDING
      // This handles legacy data where current user was stored as "You" or empty string
      let needsMigration = false;
      const migratedBills = bills.map(bill => {
        const migratedParticipants = bill.participants.map(participant => {
          const trimmedName = participant.name.trim();
          // Check if this is the current user (empty, "You", or matches default UPI name)
          const isCurrentUser = trimmedName === '' || trimmedName.toLowerCase() === 'you';

          // If current user is marked as PENDING, fix it to PAID
          if (isCurrentUser && participant.status === PaymentStatus.PENDING) {
            needsMigration = true;
            console.log(`Migrating participant "${participant.name}" to PAID in bill "${bill.title}"`);
            return { ...participant, status: PaymentStatus.PAID };
          }
          return participant;
        });

        // If any participants were migrated, return updated bill
        if (migratedParticipants.some((p, i) => p.status !== bill.participants[i].status)) {
          return { ...bill, participants: migratedParticipants, updatedAt: new Date() };
        }
        return bill;
      });

      // If migration occurred, update database
      if (needsMigration) {
        console.log('Running data migration for current user participants...');
        for (const bill of migratedBills) {
          const originalBill = bills.find(b => b.id === bill.id);
          if (originalBill && bill !== originalBill) {
            await dbUpdateBill(bill);
            // Also update participant status in database
            for (const participant of bill.participants) {
              const originalParticipant = originalBill.participants.find(p => p.id === participant.id);
              if (originalParticipant && participant.status !== originalParticipant.status) {
                await dbUpdateParticipantStatus(participant.id, participant.status);
              }
            }
          }
        }
      }

      set({
        bills: migratedBills,
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

      // Update participant status in memory
      const updatedBillsWithParticipant = get().bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              participants: b.participants.map((p) =>
                p.id === participantId ? { ...p, status: PaymentStatus.PAID } : p
              ),
              updatedAt: new Date(),
            }
          : b
      );

      // Find the updated bill and determine its new status
      const updatedBill = updatedBillsWithParticipant.find((b) => b.id === billId);
      if (updatedBill) {
        const newBillStatus = determineBillStatus(updatedBill);

        // If bill status changed, update it in database
        if (newBillStatus !== updatedBill.status) {
          await dbUpdateBillStatus(billId, newBillStatus);
        }

        // Update state with both participant and bill status
        set((state) => ({
          bills: updatedBillsWithParticipant.map((b) =>
            b.id === billId ? { ...b, status: newBillStatus } : b
          ),
          currentBill:
            state.currentBill?.id === billId
              ? {
                  ...state.currentBill,
                  participants: state.currentBill.participants.map((p) =>
                    p.id === participantId ? { ...p, status: PaymentStatus.PAID } : p
                  ),
                  status: newBillStatus,
                  updatedAt: new Date(),
                }
              : state.currentBill,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
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

      // Update participant status in memory
      const updatedBillsWithParticipant = get().bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              participants: b.participants.map((p) =>
                p.id === participantId ? { ...p, status: PaymentStatus.PENDING } : p
              ),
              updatedAt: new Date(),
            }
          : b
      );

      // Find the updated bill and determine its new status
      const updatedBill = updatedBillsWithParticipant.find((b) => b.id === billId);
      if (updatedBill) {
        const newBillStatus = determineBillStatus(updatedBill);

        // If bill status changed, update it in database
        if (newBillStatus !== updatedBill.status) {
          await dbUpdateBillStatus(billId, newBillStatus);
        }

        // Update state with both participant and bill status
        set((state) => ({
          bills: updatedBillsWithParticipant.map((b) =>
            b.id === billId ? { ...b, status: newBillStatus } : b
          ),
          currentBill:
            state.currentBill?.id === billId
              ? {
                  ...state.currentBill,
                  participants: state.currentBill.participants.map((p) =>
                    p.id === participantId ? { ...p, status: PaymentStatus.PENDING } : p
                  ),
                  status: newBillStatus,
                  updatedAt: new Date(),
                }
              : state.currentBill,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
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
