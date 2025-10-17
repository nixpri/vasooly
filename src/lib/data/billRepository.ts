/**
 * Data access layer for bills and participants
 * Handles all database CRUD operations with encryption
 */

import { getDatabase } from './database';
import { Bill, Participant, BillStatus, PaymentStatus } from '../../types';

/**
 * Database row types (snake_case matching DB schema)
 */
interface BillRow {
  id: string;
  title: string;
  total_amount_paise: number;
  created_at: number;
  updated_at: number;
  status: string;
  deleted_at: number | null;
}

interface ParticipantRow {
  id: string;
  bill_id: string;
  name: string;
  phone: string | null;
  amount_paise: number;
  status: string;
  paid_at: number | null;
}

/**
 * Converts database row to domain Bill object
 */
function rowToBill(row: BillRow, participants: Participant[]): Bill {
  return {
    id: row.id,
    title: row.title,
    totalAmountPaise: row.total_amount_paise,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    status: row.status as BillStatus,
    participants,
  };
}

/**
 * Converts database row to domain Participant object
 */
function rowToParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    amountPaise: row.amount_paise,
    status: row.status as PaymentStatus,
  };
}

/**
 * Creates a new bill with participants in a transaction
 */
export async function createBill(bill: Bill): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    // Insert bill
    await db.runAsync(
      `INSERT INTO bills (id, title, total_amount_paise, created_at, updated_at, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        bill.id,
        bill.title,
        bill.totalAmountPaise,
        bill.createdAt.getTime(),
        bill.updatedAt.getTime(),
        bill.status,
      ]
    );

    // Insert participants
    for (const participant of bill.participants) {
      await db.runAsync(
        `INSERT INTO participants (id, bill_id, name, phone, amount_paise, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          participant.id,
          bill.id,
          participant.name,
          participant.phone ?? null,
          participant.amountPaise,
          participant.status,
        ]
      );
    }
  });
}

/**
 * Updates an existing bill with participants in a transaction
 */
export async function updateBill(bill: Bill): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    // Update bill
    await db.runAsync(
      `UPDATE bills SET title = ?, total_amount_paise = ?, updated_at = ? WHERE id = ?`,
      [bill.title, bill.totalAmountPaise, bill.updatedAt.getTime(), bill.id]
    );

    // Delete existing participants
    await db.runAsync('DELETE FROM participants WHERE bill_id = ?', [bill.id]);

    // Insert updated participants
    for (const participant of bill.participants) {
      await db.runAsync(
        `INSERT INTO participants (id, bill_id, name, phone, amount_paise, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          participant.id,
          bill.id,
          participant.name,
          participant.phone ?? null,
          participant.amountPaise,
          participant.status,
        ]
      );
    }
  });
}

/**
 * Retrieves a bill by ID with all participants
 */
export async function getBillById(billId: string): Promise<Bill | null> {
  const db = getDatabase();

  const billRow = await db.getFirstAsync<BillRow>(
    'SELECT * FROM bills WHERE id = ? AND status != ?',
    [billId, BillStatus.DELETED]
  );

  if (!billRow) {
    return null;
  }

  const participantRows = await db.getAllAsync<ParticipantRow>(
    'SELECT * FROM participants WHERE bill_id = ?',
    [billId]
  );

  const participants = participantRows.map(rowToParticipant);
  return rowToBill(billRow, participants);
}

/**
 * Retrieves all active bills (not deleted) ordered by creation date
 */
export async function getAllBills(): Promise<Bill[]> {
  const db = getDatabase();

  const billRows = await db.getAllAsync<BillRow>(
    'SELECT * FROM bills WHERE status != ? ORDER BY created_at DESC',
    [BillStatus.DELETED]
  );

  const bills: Bill[] = [];

  for (const billRow of billRows) {
    const participantRows = await db.getAllAsync<ParticipantRow>(
      'SELECT * FROM participants WHERE bill_id = ?',
      [billRow.id]
    );

    const participants = participantRows.map(rowToParticipant);
    bills.push(rowToBill(billRow, participants));
  }

  return bills;
}

/**
 * Updates a bill's status
 */
export async function updateBillStatus(
  billId: string,
  status: BillStatus
): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    'UPDATE bills SET status = ?, updated_at = ? WHERE id = ?',
    [status, Date.now(), billId]
  );
}

/**
 * Soft deletes a bill (marks as deleted, doesn't remove from DB)
 */
export async function deleteBill(billId: string): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    'UPDATE bills SET status = ?, deleted_at = ?, updated_at = ? WHERE id = ?',
    [BillStatus.DELETED, Date.now(), Date.now(), billId]
  );
}

/**
 * Restores a soft-deleted bill (marks as active again)
 */
export async function restoreBill(billId: string): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    'UPDATE bills SET status = ?, deleted_at = NULL, updated_at = ? WHERE id = ? AND status = ?',
    [BillStatus.ACTIVE, Date.now(), billId, BillStatus.DELETED]
  );
}

/**
 * Retrieves all soft-deleted bills for recovery UI
 */
export async function getDeletedBills(): Promise<Bill[]> {
  const db = getDatabase();

  const billRows = await db.getAllAsync<BillRow>(
    'SELECT * FROM bills WHERE status = ? ORDER BY deleted_at DESC',
    [BillStatus.DELETED]
  );

  const bills: Bill[] = [];

  for (const billRow of billRows) {
    const participantRows = await db.getAllAsync<ParticipantRow>(
      'SELECT * FROM participants WHERE bill_id = ?',
      [billRow.id]
    );

    const participants = participantRows.map(rowToParticipant);
    bills.push(rowToBill(billRow, participants));
  }

  return bills;
}

/**
 * Auto-cleanup: permanently deletes bills deleted more than specified days ago
 * @param daysOld Number of days after which to permanently delete (default: 30)
 * @returns Number of bills permanently deleted
 */
export async function cleanupOldDeletedBills(daysOld: number = 30): Promise<number> {
  const db = getDatabase();
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

  const billsToDelete = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM bills WHERE status = ? AND deleted_at < ?',
    [BillStatus.DELETED, cutoffTime]
  );

  let deletedCount = 0;

  for (const bill of billsToDelete) {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM participants WHERE bill_id = ?', [bill.id]);
      await db.runAsync('DELETE FROM bills WHERE id = ?', [bill.id]);
    });
    deletedCount++;
  }

  return deletedCount;
}

/**
 * Batch restore multiple bills at once
 * @param billIds Array of bill IDs to restore
 * @returns Number of bills successfully restored
 */
export async function restoreBillsBatch(billIds: string[]): Promise<number> {
  const db = getDatabase();
  let restoredCount = 0;

  await db.withTransactionAsync(async () => {
    for (const billId of billIds) {
      const result = await db.runAsync(
        'UPDATE bills SET status = ?, deleted_at = NULL, updated_at = ? WHERE id = ? AND status = ?',
        [BillStatus.ACTIVE, Date.now(), billId, BillStatus.DELETED]
      );

      if (result.changes > 0) {
        restoredCount++;
      }
    }
  });

  return restoredCount;
}

/**
 * Batch soft delete multiple bills at once
 * @param billIds Array of bill IDs to delete
 * @returns Number of bills successfully deleted
 */
export async function deleteBillsBatch(billIds: string[]): Promise<number> {
  const db = getDatabase();
  let deletedCount = 0;
  const now = Date.now();

  await db.withTransactionAsync(async () => {
    for (const billId of billIds) {
      const result = await db.runAsync(
        'UPDATE bills SET status = ?, deleted_at = ?, updated_at = ? WHERE id = ? AND status != ?',
        [BillStatus.DELETED, now, now, billId, BillStatus.DELETED]
      );

      if (result.changes > 0) {
        deletedCount++;
      }
    }
  });

  return deletedCount;
}

/**
 * Hard deletes a bill and all participants (use with caution)
 */
export async function hardDeleteBill(billId: string): Promise<void> {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM participants WHERE bill_id = ?', [billId]);
    await db.runAsync('DELETE FROM bills WHERE id = ?', [billId]);
  });
}

/**
 * Updates a participant's payment status
 */
export async function updateParticipantStatus(
  participantId: string,
  status: PaymentStatus
): Promise<void> {
  const db = getDatabase();

  const paidAt = status === PaymentStatus.PAID ? Date.now() : null;

  await db.runAsync(
    'UPDATE participants SET status = ?, paid_at = ? WHERE id = ?',
    [status, paidAt, participantId]
  );
}

/**
 * Gets all participants for a specific bill
 */
export async function getParticipantsByBillId(
  billId: string
): Promise<Participant[]> {
  const db = getDatabase();

  const rows = await db.getAllAsync<ParticipantRow>(
    'SELECT * FROM participants WHERE bill_id = ?',
    [billId]
  );

  return rows.map(rowToParticipant);
}

/**
 * Gets bill statistics (counts by status)
 */
export async function getBillStatistics(): Promise<{
  total: number;
  active: number;
  settled: number;
  totalAmountPaise: number;
  pendingAmountPaise: number;
}> {
  const db = getDatabase();

  const counts = await db.getFirstAsync<{
    total: number;
    active: number;
    settled: number;
  }>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'SETTLED' THEN 1 ELSE 0 END) as settled
    FROM bills
    WHERE status != 'DELETED'
  `);

  const amounts = await db.getFirstAsync<{
    total: number;
    pending: number;
  }>(`
    SELECT
      SUM(b.total_amount_paise) as total,
      SUM(CASE WHEN p.status = 'PENDING' THEN p.amount_paise ELSE 0 END) as pending
    FROM bills b
    JOIN participants p ON b.id = p.bill_id
    WHERE b.status != 'DELETED'
  `);

  return {
    total: counts?.total ?? 0,
    active: counts?.active ?? 0,
    settled: counts?.settled ?? 0,
    totalAmountPaise: amounts?.total ?? 0,
    pendingAmountPaise: amounts?.pending ?? 0,
  };
}

/**
 * Searches bills by title (case-insensitive)
 */
export async function searchBills(query: string): Promise<Bill[]> {
  const db = getDatabase();

  const billRows = await db.getAllAsync<BillRow>(
    `SELECT * FROM bills
     WHERE status != ? AND title LIKE ?
     ORDER BY created_at DESC`,
    [BillStatus.DELETED, `%${query}%`]
  );

  const bills: Bill[] = [];

  for (const billRow of billRows) {
    const participantRows = await db.getAllAsync<ParticipantRow>(
      'SELECT * FROM participants WHERE bill_id = ?',
      [billRow.id]
    );

    const participants = participantRows.map(rowToParticipant);
    bills.push(rowToBill(billRow, participants));
  }

  return bills;
}

/**
 * Duplicates an existing bill with new IDs and reset status
 */
export async function duplicateBill(
  sourceBillId: string,
  newBillId: string,
  newParticipantIds: string[]
): Promise<Bill> {
  const sourceBill = await getBillById(sourceBillId);

  if (!sourceBill) {
    throw new Error(`Bill ${sourceBillId} not found`);
  }

  if (newParticipantIds.length !== sourceBill.participants.length) {
    throw new Error('Must provide same number of new participant IDs');
  }

  const now = new Date();

  const newBill: Bill = {
    ...sourceBill,
    id: newBillId,
    createdAt: now,
    updatedAt: now,
    status: BillStatus.ACTIVE,
    participants: sourceBill.participants.map((p, index) => ({
      ...p,
      id: newParticipantIds[index],
      status: PaymentStatus.PENDING,
    })),
  };

  await createBill(newBill);
  return newBill;
}
