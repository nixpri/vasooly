/**
 * Tests for bill repository data access layer
 */

import {
  createBill,
  getBillById,
  getAllBills,
  updateBillStatus,
  deleteBill,
  restoreBill,
  getDeletedBills,
  cleanupOldDeletedBills,
  restoreBillsBatch,
  deleteBillsBatch,
  updateParticipantStatus,
  getBillStatistics,
  searchBills,
} from '../billRepository';
import { Bill, BillStatus, PaymentStatus } from '../../../types';
import * as database from '../database';

// Mock the database module
jest.mock('../database', () => ({
  getDatabase: jest.fn(),
}));

describe('Bill Repository', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(() => {
    // Create mock database with methods
    mockDb = {
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
      withTransactionAsync: jest.fn(async (callback) => await callback()),
    };

    (database.getDatabase as jest.Mock).mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestBill = (): Bill => ({
    id: 'bill-1',
    title: 'Dinner at restaurant',
    totalAmountPaise: 150000, // ₹1500
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-01-15T10:00:00Z'),
    status: BillStatus.ACTIVE,
    participants: [
      {
        id: 'participant-1',
        name: 'Alice',
        phone: '+919876543210',
        amountPaise: 50000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'participant-2',
        name: 'Bob',
        amountPaise: 50000,
        status: PaymentStatus.PENDING,
      },
      {
        id: 'participant-3',
        name: 'Charlie',
        phone: '+919876543211',
        amountPaise: 50000,
        status: PaymentStatus.PAID,
      },
    ],
  });

  describe('createBill', () => {
    it('should insert bill and participants in a transaction', async () => {
      const bill = createTestBill();

      await createBill(bill);

      // Verify transaction was used
      expect(mockDb.withTransactionAsync).toHaveBeenCalled();

      // Verify bill insert
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO bills'),
        [
          bill.id,
          bill.title,
          bill.totalAmountPaise,
          bill.createdAt.getTime(),
          bill.updatedAt.getTime(),
          bill.status,
        ]
      );

      // Verify participants inserts (3 participants)
      expect(mockDb.runAsync).toHaveBeenCalledTimes(4); // 1 bill + 3 participants
    });
  });

  describe('getBillById', () => {
    it('should return bill with participants', async () => {
      const bill = createTestBill();

      mockDb.getFirstAsync.mockResolvedValue({
        id: bill.id,
        title: bill.title,
        total_amount_paise: bill.totalAmountPaise,
        created_at: bill.createdAt.getTime(),
        updated_at: bill.updatedAt.getTime(),
        status: bill.status,
        deleted_at: null,
      });

      mockDb.getAllAsync.mockResolvedValue([
        {
          id: 'participant-1',
          bill_id: bill.id,
          name: 'Alice',
          phone: '+919876543210',
          amount_paise: 50000,
          status: 'PENDING',
          paid_at: null,
        },
      ]);

      const result = await getBillById(bill.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(bill.id);
      expect(result?.title).toBe(bill.title);
      expect(result?.participants).toHaveLength(1);
    });

    it('should return null if bill not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await getBillById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllBills', () => {
    it('should return all active bills with participants', async () => {
      mockDb.getAllAsync
        .mockResolvedValueOnce([
          {
            id: 'bill-1',
            title: 'Test Bill 1',
            total_amount_paise: 100000,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: 'ACTIVE',
            deleted_at: null,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'participant-1',
            bill_id: 'bill-1',
            name: 'Alice',
            phone: null,
            amount_paise: 100000,
            status: 'PENDING',
            paid_at: null,
          },
        ]);

      const result = await getAllBills();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('bill-1');
      expect(result[0].participants).toHaveLength(1);
    });

    it('should exclude deleted bills', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await getAllBills();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['DELETED']
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('updateBillStatus', () => {
    it('should update bill status', async () => {
      await updateBillStatus('bill-1', BillStatus.SETTLED);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bills SET status'),
        [BillStatus.SETTLED, expect.any(Number), 'bill-1']
      );
    });
  });

  describe('deleteBill', () => {
    it('should soft delete bill', async () => {
      await deleteBill('bill-1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bills SET status'),
        [BillStatus.DELETED, expect.any(Number), expect.any(Number), 'bill-1']
      );
    });
  });

  describe('restoreBill', () => {
    it('should restore soft-deleted bill', async () => {
      await restoreBill('bill-1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bills SET status'),
        [BillStatus.ACTIVE, expect.any(Number), 'bill-1', BillStatus.DELETED]
      );
    });
  });

  describe('getDeletedBills', () => {
    it('should retrieve all soft-deleted bills', async () => {
      mockDb.getAllAsync
        .mockResolvedValueOnce([
          {
            id: 'bill-1',
            title: 'Deleted Bill',
            total_amount_paise: 100000,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: 'DELETED',
            deleted_at: Date.now(),
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await getDeletedBills();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?'),
        [BillStatus.DELETED]
      );
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(BillStatus.DELETED);
    });
  });

  describe('cleanupOldDeletedBills', () => {
    it('should permanently delete bills older than specified days', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([
        { id: 'bill-1' },
        { id: 'bill-2' },
      ]);

      const result = await cleanupOldDeletedBills(30);

      expect(result).toBe(2);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM participants WHERE bill_id = ?',
        expect.any(Array)
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM bills WHERE id = ?',
        expect.any(Array)
      );
    });

    it('should use default 30 days if not specified', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await cleanupOldDeletedBills();

      expect(result).toBe(0);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        [BillStatus.DELETED, expect.any(Number)]
      );
    });
  });

  describe('restoreBillsBatch', () => {
    it('should restore multiple bills in a transaction', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await restoreBillsBatch(['bill-1', 'bill-2', 'bill-3']);

      expect(result).toBe(3);
      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
    });

    it('should only count successfully restored bills', async () => {
      mockDb.runAsync
        .mockResolvedValueOnce({ changes: 1 })
        .mockResolvedValueOnce({ changes: 0 }) // Already restored or doesn't exist
        .mockResolvedValueOnce({ changes: 1 });

      const result = await restoreBillsBatch(['bill-1', 'bill-2', 'bill-3']);

      expect(result).toBe(2);
    });
  });

  describe('deleteBillsBatch', () => {
    it('should delete multiple bills in a transaction', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await deleteBillsBatch(['bill-1', 'bill-2', 'bill-3']);

      expect(result).toBe(3);
      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledTimes(3);
    });

    it('should only count successfully deleted bills', async () => {
      mockDb.runAsync
        .mockResolvedValueOnce({ changes: 1 })
        .mockResolvedValueOnce({ changes: 0 }) // Already deleted
        .mockResolvedValueOnce({ changes: 1 });

      const result = await deleteBillsBatch(['bill-1', 'bill-2', 'bill-3']);

      expect(result).toBe(2);
    });
  });

  describe('updateParticipantStatus', () => {
    it('should update participant to PAID with timestamp', async () => {
      await updateParticipantStatus('participant-1', PaymentStatus.PAID);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE participants SET status'),
        [PaymentStatus.PAID, expect.any(Number), 'participant-1']
      );
    });

    it('should update participant to PENDING without timestamp', async () => {
      await updateParticipantStatus('participant-1', PaymentStatus.PENDING);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE participants SET status'),
        [PaymentStatus.PENDING, null, 'participant-1']
      );
    });
  });

  describe('getBillStatistics', () => {
    it('should return bill statistics', async () => {
      mockDb.getFirstAsync
        .mockResolvedValueOnce({
          total: 10,
          active: 7,
          settled: 3,
        })
        .mockResolvedValueOnce({
          total: 500000,
          pending: 200000,
        });

      const result = await getBillStatistics();

      expect(result.total).toBe(10);
      expect(result.active).toBe(7);
      expect(result.settled).toBe(3);
      expect(result.totalAmountPaise).toBe(500000);
      expect(result.pendingAmountPaise).toBe(200000);
    });
  });

  describe('searchBills', () => {
    it('should search bills by title', async () => {
      mockDb.getAllAsync
        .mockResolvedValueOnce([
          {
            id: 'bill-1',
            title: 'Dinner at restaurant',
            total_amount_paise: 100000,
            created_at: Date.now(),
            updated_at: Date.now(),
            status: 'ACTIVE',
            deleted_at: null,
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await searchBills('dinner');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['DELETED', '%dinner%']
      );
      expect(result).toHaveLength(1);
    });
  });
});
