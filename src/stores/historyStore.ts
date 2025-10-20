/**
 * History Store - Zustand state management for bill history
 * Manages bill list caching, search, filters, and pagination
 */

import { create } from 'zustand';
import { Bill, BillStatus } from '../types';
import {
  getAllBills,
  searchBills as dbSearchBills,
  getBillStatistics,
} from '../lib/data/billRepository';

export interface BillStatistics {
  total: number;
  active: number;
  settled: number;
  totalAmountPaise: number;
  pendingAmountPaise: number;
}

interface HistoryState {
  // State
  bills: Bill[];
  filteredBills: Bill[];
  searchQuery: string;
  filterStatus: BillStatus | 'ALL';
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  statistics: BillStatistics | null;

  // Actions - Data Loading
  loadHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadBills: () => Promise<void>; // Alias for loadHistory
  refreshBills: () => Promise<void>; // Alias for refreshHistory

  // Actions - Search & Filter
  setSearchQuery: (query: string) => Promise<void>;
  setFilterStatus: (status: BillStatus | 'ALL') => void;
  clearFilters: () => void;

  // Actions - Error Handling
  clearError: () => void;

  // Selectors (derived state)
  getTotalBills: () => number;
  getActiveBills: () => Bill[];
  getSettledBills: () => Bill[];
  getBillsByStatus: (status: BillStatus) => Bill[];
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Initial State
  bills: [],
  filteredBills: [],
  searchQuery: '',
  filterStatus: 'ALL',
  isLoading: false,
  isRefreshing: false,
  error: null,
  statistics: null,

  // Load History
  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const bills = await getAllBills();
      set({
        bills,
        filteredBills: bills,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Refresh History (pull-to-refresh)
  refreshHistory: async () => {
    set({ isRefreshing: true, error: null });
    try {
      const bills = await getAllBills();
      const { searchQuery, filterStatus } = get();

      // Apply current filters to refreshed data
      let filtered = bills;

      if (searchQuery) {
        filtered = await dbSearchBills(searchQuery);
      }

      if (filterStatus !== 'ALL') {
        filtered = filtered.filter((b) => b.status === filterStatus);
      }

      set({
        bills,
        filteredBills: filtered,
        isRefreshing: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh history';
      set({ error: errorMessage, isRefreshing: false });
      throw error;
    }
  },

  // Load Statistics
  loadStatistics: async () => {
    try {
      const statistics = await getBillStatistics();
      set({ statistics });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Set Search Query
  setSearchQuery: async (query: string) => {
    set({ searchQuery: query, isLoading: true, error: null });

    try {
      if (!query.trim()) {
        // Empty search - show all bills with current filter
        const { bills, filterStatus } = get();
        const filtered =
          filterStatus === 'ALL' ? bills : bills.filter((b) => b.status === filterStatus);
        set({ filteredBills: filtered, isLoading: false });
      } else {
        // Search in database
        const searchResults = await dbSearchBills(query);
        const { filterStatus } = get();

        // Apply status filter to search results
        const filtered =
          filterStatus === 'ALL'
            ? searchResults
            : searchResults.filter((b) => b.status === filterStatus);

        set({ filteredBills: filtered, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Filter Status
  setFilterStatus: (status: BillStatus | 'ALL') => {
    const { bills, searchQuery } = get();

    // Apply filter to current bills
    let filtered = bills;

    if (status !== 'ALL') {
      filtered = bills.filter((b) => b.status === status);
    }

    // If there's a search query, apply it too
    if (searchQuery) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    set({
      filterStatus: status,
      filteredBills: filtered,
    });
  },

  // Clear Filters
  clearFilters: () => {
    const { bills } = get();
    set({
      searchQuery: '',
      filterStatus: 'ALL',
      filteredBills: bills,
    });
  },

  // Aliases for convenience
  loadBills: async () => {
    return get().loadHistory();
  },

  refreshBills: async () => {
    return get().refreshHistory();
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Selectors
  getTotalBills: () => {
    return get().bills.length;
  },

  getActiveBills: () => {
    return get().bills.filter((b) => b.status === BillStatus.ACTIVE);
  },

  getSettledBills: () => {
    return get().bills.filter((b) => b.status === BillStatus.SETTLED);
  },

  getBillsByStatus: (status: BillStatus) => {
    return get().bills.filter((b) => b.status === status);
  },
}));
