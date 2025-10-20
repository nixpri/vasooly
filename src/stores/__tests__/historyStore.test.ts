/**
 * History Store Tests
 * Comprehensive tests for Zustand history state management
 */

import { renderHook, act } from '@testing-library/react-native';
import { useHistoryStore } from '../historyStore';
import { Bill, BillStatus, PaymentStatus } from '../../types';
import * as billRepository from '../../lib/data/billRepository';

// Mock the bill repository
jest.mock('../../lib/data/billRepository');

const mockBillRepository = billRepository as jest.Mocked<typeof billRepository>;

describe('useHistoryStore', () => {
  // Test data
  const mockBill1: Bill = {
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
        amountPaise: 60000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'p2',
        name: 'Bob',
        amountPaise: 60000,
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
    status: BillStatus.SETTLED,
    participants: [
      {
        id: 'p3',
        name: 'Charlie',
        amountPaise: 30000,
        status: PaymentStatus.PAID,
      },
      {
        id: 'p4',
        name: 'Dave',
        amountPaise: 30000,
        status: PaymentStatus.PAID,
      },
    ],
  };

  const mockBill3: Bill = {
    id: 'bill-3',
    title: 'Coffee Break',
    totalAmountPaise: 30000,
    createdAt: new Date('2025-01-22'),
    updatedAt: new Date('2025-01-22'),
    status: BillStatus.ACTIVE,
    participants: [
      {
        id: 'p5',
        name: 'Eve',
        amountPaise: 15000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'p6',
        name: 'Frank',
        amountPaise: 15000,
        status: PaymentStatus.PENDING,
      },
    ],
  };

  const mockStatistics = {
    total: 3,
    active: 2,
    settled: 1,
    totalAmountPaise: 210000,
    pendingAmountPaise: 150000,
  };

  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useHistoryStore());
    act(() => {
      result.current.bills = [];
      result.current.filteredBills = [];
      result.current.searchQuery = '';
      result.current.filterStatus = 'ALL';
      result.current.isLoading = false;
      result.current.isRefreshing = false;
      result.current.error = null;
      result.current.statistics = null;
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useHistoryStore());

      expect(result.current.bills).toEqual([]);
      expect(result.current.filteredBills).toEqual([]);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filterStatus).toBe('ALL');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.statistics).toBeNull();
    });
  });

  describe('loadHistory', () => {
    it('should load history successfully', async () => {
      const bills = [mockBill1, mockBill2, mockBill3];
      mockBillRepository.getAllBills.mockResolvedValueOnce(bills);

      const { result } = renderHook(() => useHistoryStore());

      await act(async () => {
        await result.current.loadHistory();
      });

      expect(mockBillRepository.getAllBills).toHaveBeenCalled();
      expect(result.current.bills).toEqual(bills);
      expect(result.current.filteredBills).toEqual(bills);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle load error', async () => {
      const errorMessage = 'Database error';
      mockBillRepository.getAllBills.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useHistoryStore());

      await act(async () => {
        try {
          await result.current.loadHistory();
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('refreshHistory', () => {
    it('should refresh history successfully', async () => {
      const bills = [mockBill1, mockBill2, mockBill3];
      mockBillRepository.getAllBills.mockResolvedValueOnce(bills);

      const { result } = renderHook(() => useHistoryStore());

      await act(async () => {
        await result.current.refreshHistory();
      });

      expect(mockBillRepository.getAllBills).toHaveBeenCalled();
      expect(result.current.bills).toEqual(bills);
      expect(result.current.filteredBills).toEqual(bills);
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should apply filters during refresh', async () => {
      const bills = [mockBill1, mockBill2, mockBill3];
      mockBillRepository.getAllBills.mockResolvedValueOnce(bills);

      const { result } = renderHook(() => useHistoryStore());

      // Set filter before refresh
      act(() => {
        result.current.filterStatus = BillStatus.ACTIVE;
      });

      await act(async () => {
        await result.current.refreshHistory();
      });

      expect(result.current.bills).toEqual(bills);
      expect(result.current.filteredBills).toHaveLength(2);
      expect(result.current.filteredBills.every((b) => b.status === BillStatus.ACTIVE)).toBe(true);
    });

    it('should apply search during refresh', async () => {
      const bills = [mockBill1, mockBill2, mockBill3];
      mockBillRepository.getAllBills.mockResolvedValueOnce(bills);
      mockBillRepository.searchBills.mockResolvedValueOnce([mockBill3]);

      const { result } = renderHook(() => useHistoryStore());

      // Set search query before refresh
      act(() => {
        result.current.searchQuery = 'Coffee';
      });

      await act(async () => {
        await result.current.refreshHistory();
      });

      expect(mockBillRepository.searchBills).toHaveBeenCalledWith('Coffee');
      expect(result.current.filteredBills).toHaveLength(1);
      expect(result.current.filteredBills[0].id).toBe(mockBill3.id);
    });
  });

  describe('loadStatistics', () => {
    it('should load statistics successfully', async () => {
      mockBillRepository.getBillStatistics.mockResolvedValueOnce(mockStatistics);

      const { result } = renderHook(() => useHistoryStore());

      await act(async () => {
        await result.current.loadStatistics();
      });

      expect(mockBillRepository.getBillStatistics).toHaveBeenCalled();
      expect(result.current.statistics).toEqual(mockStatistics);
    });

    it('should handle statistics error', async () => {
      const errorMessage = 'Stats error';
      mockBillRepository.getBillStatistics.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useHistoryStore());

      await act(async () => {
        try {
          await result.current.loadStatistics();
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('setSearchQuery', () => {
    it('should search successfully', async () => {
      const searchResults = [mockBill2];
      mockBillRepository.searchBills.mockResolvedValueOnce(searchResults);

      const { result } = renderHook(() => useHistoryStore());

      // Set initial bills
      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
      });

      await act(async () => {
        await result.current.setSearchQuery('Movie');
      });

      expect(mockBillRepository.searchBills).toHaveBeenCalledWith('Movie');
      expect(result.current.searchQuery).toBe('Movie');
      expect(result.current.filteredBills).toEqual(searchResults);
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear search with empty query', async () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
        result.current.searchQuery = 'Movie';
        result.current.filteredBills = [mockBill2];
      });

      await act(async () => {
        await result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.filteredBills).toEqual([mockBill1, mockBill2, mockBill3]);
    });

    it('should apply status filter to search results', async () => {
      const searchResults = [mockBill1, mockBill2];
      mockBillRepository.searchBills.mockResolvedValueOnce(searchResults);

      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2];
        result.current.filterStatus = BillStatus.ACTIVE;
      });

      await act(async () => {
        await result.current.setSearchQuery('Team');
      });

      expect(result.current.filteredBills).toHaveLength(1);
      expect(result.current.filteredBills[0].id).toBe(mockBill1.id);
    });
  });

  describe('setFilterStatus', () => {
    it('should filter by ACTIVE status', () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
      });

      act(() => {
        result.current.setFilterStatus(BillStatus.ACTIVE);
      });

      expect(result.current.filterStatus).toBe(BillStatus.ACTIVE);
      expect(result.current.filteredBills).toHaveLength(2);
      expect(result.current.filteredBills.every((b) => b.status === BillStatus.ACTIVE)).toBe(true);
    });

    it('should filter by SETTLED status', () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
      });

      act(() => {
        result.current.setFilterStatus(BillStatus.SETTLED);
      });

      expect(result.current.filterStatus).toBe(BillStatus.SETTLED);
      expect(result.current.filteredBills).toHaveLength(1);
      expect(result.current.filteredBills[0].id).toBe(mockBill2.id);
    });

    it('should show all bills with ALL filter', () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
        result.current.filterStatus = BillStatus.ACTIVE;
        result.current.filteredBills = [mockBill1, mockBill3];
      });

      act(() => {
        result.current.setFilterStatus('ALL');
      });

      expect(result.current.filterStatus).toBe('ALL');
      expect(result.current.filteredBills).toEqual([mockBill1, mockBill2, mockBill3]);
    });

    it('should combine status filter with search', () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
        result.current.searchQuery = 'Night';
      });

      act(() => {
        result.current.setFilterStatus(BillStatus.SETTLED);
      });

      expect(result.current.filteredBills).toHaveLength(1);
      expect(result.current.filteredBills[0].id).toBe(mockBill2.id);
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      const { result } = renderHook(() => useHistoryStore());

      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
        result.current.searchQuery = 'Movie';
        result.current.filterStatus = BillStatus.ACTIVE;
        result.current.filteredBills = [mockBill1];
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.filterStatus).toBe('ALL');
      expect(result.current.filteredBills).toEqual([mockBill1, mockBill2, mockBill3]);
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useHistoryStore());
      act(() => {
        result.current.bills = [mockBill1, mockBill2, mockBill3];
      });
    });

    it('should get total bills count', () => {
      const { result } = renderHook(() => useHistoryStore());
      expect(result.current.getTotalBills()).toBe(3);
    });

    it('should get active bills', () => {
      const { result } = renderHook(() => useHistoryStore());

      const activeBills = result.current.getActiveBills();
      expect(activeBills).toHaveLength(2);
      expect(activeBills.every((b) => b.status === BillStatus.ACTIVE)).toBe(true);
    });

    it('should get settled bills', () => {
      const { result } = renderHook(() => useHistoryStore());

      const settledBills = result.current.getSettledBills();
      expect(settledBills).toHaveLength(1);
      expect(settledBills[0].id).toBe(mockBill2.id);
    });

    it('should get bills by status', () => {
      const { result } = renderHook(() => useHistoryStore());

      const activeBills = result.current.getBillsByStatus(BillStatus.ACTIVE);
      expect(activeBills).toHaveLength(2);

      const settledBills = result.current.getBillsByStatus(BillStatus.SETTLED);
      expect(settledBills).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useHistoryStore());

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
});
