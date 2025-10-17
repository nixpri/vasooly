# Soft Delete Implementation Guide

Complete guide to soft delete functionality in Vasooly's data layer.

## Overview

Soft delete allows bills to be "deleted" without permanently removing them from the database. This provides:
- **Data Recovery**: Restore accidentally deleted bills
- **Audit Trail**: Track when bills were deleted
- **Compliance**: Meet data retention requirements
- **User Safety**: Prevent permanent data loss

## Architecture

### Database Schema
```sql
CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  total_amount_paise INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL,
  deleted_at INTEGER          -- NULL for active bills, timestamp when deleted
);
```

### Status Flow
```
ACTIVE → [soft delete] → DELETED → [restore] → ACTIVE
DELETED → [cleanup after 30 days] → [permanently deleted]
```

## API Reference

### Core Operations

#### `deleteBill(billId: string): Promise<void>`
Soft deletes a bill by marking it as DELETED.

```typescript
import { deleteBill } from '@/lib/data';

await deleteBill('bill-123');
// Bill status = DELETED, deleted_at = current timestamp
// Bill excluded from getAllBills(), getBillById()
```

**Database Effect**:
```sql
UPDATE bills
SET status = 'DELETED',
    deleted_at = ?,
    updated_at = ?
WHERE id = ?
```

#### `restoreBill(billId: string): Promise<void>`
Restores a soft-deleted bill back to ACTIVE status.

```typescript
import { restoreBill } from '@/lib/data';

await restoreBill('bill-123');
// Bill status = ACTIVE, deleted_at = NULL
// Bill visible in getAllBills(), getBillById()
```

**Database Effect**:
```sql
UPDATE bills
SET status = 'ACTIVE',
    deleted_at = NULL,
    updated_at = ?
WHERE id = ? AND status = 'DELETED'
```

#### `getDeletedBills(): Promise<Bill[]>`
Retrieves all soft-deleted bills for recovery UI.

```typescript
import { getDeletedBills } from '@/lib/data';

const deletedBills = await getDeletedBills();
// Returns bills with status = DELETED
// Ordered by deleted_at DESC (most recent first)
```

**Use Case**: Build "Recently Deleted" or "Trash" screen

### Batch Operations

#### `deleteBillsBatch(billIds: string[]): Promise<number>`
Soft deletes multiple bills in a single transaction.

```typescript
import { deleteBillsBatch } from '@/lib/data';

const count = await deleteBillsBatch(['bill-1', 'bill-2', 'bill-3']);
console.log(`${count} bills deleted`); // Returns count of successfully deleted bills
```

**Benefits**:
- Atomic operation (all succeed or all fail)
- Better performance for bulk operations
- Returns count of actually deleted bills (skips already deleted)

#### `restoreBillsBatch(billIds: string[]): Promise<number>`
Restores multiple soft-deleted bills in a single transaction.

```typescript
import { restoreBillsBatch } from '@/lib/data';

const count = await restoreBillsBatch(['bill-1', 'bill-2', 'bill-3']);
console.log(`${count} bills restored`);
```

**Use Case**: "Restore All" functionality in trash screen

### Auto-Cleanup

#### `cleanupOldDeletedBills(daysOld: number = 30): Promise<number>`
Permanently deletes bills that have been soft-deleted for more than specified days.

```typescript
import { cleanupOldDeletedBills } from '@/lib/data';

// Delete bills deleted more than 30 days ago (default)
const count = await cleanupOldDeletedBills();
console.log(`${count} old bills permanently deleted`);

// Custom retention period (e.g., 90 days)
const count90 = await cleanupOldDeletedBills(90);
```

**When to Run**:
- App startup (background task)
- Nightly scheduled job
- User-initiated cleanup in settings

**Safety**: Uses transactions to ensure participants are deleted with bills

## Usage Patterns

### Basic Delete → Restore Flow

```typescript
import { deleteBill, restoreBill, getBillById } from '@/lib/data';

// 1. User deletes bill
await deleteBill('bill-123');

// 2. Bill not visible in normal queries
const bill = await getBillById('bill-123');
console.log(bill); // null

// 3. User changes mind - restore it
await restoreBill('bill-123');

// 4. Bill visible again
const restoredBill = await getBillById('bill-123');
console.log(restoredBill); // Bill object with status = ACTIVE
```

### Trash Screen Implementation

```typescript
import { getDeletedBills, restoreBill, hardDeleteBill } from '@/lib/data';

function TrashScreen() {
  const [deletedBills, setDeletedBills] = useState([]);

  useEffect(() => {
    loadDeletedBills();
  }, []);

  async function loadDeletedBills() {
    const bills = await getDeletedBills();
    setDeletedBills(bills);
  }

  async function handleRestore(billId: string) {
    await restoreBill(billId);
    loadDeletedBills(); // Refresh list
  }

  async function handlePermanentDelete(billId: string) {
    // Show confirmation dialog first!
    const confirmed = await showConfirmation(
      'Permanently delete this bill? This cannot be undone.'
    );

    if (confirmed) {
      await hardDeleteBill(billId);
      loadDeletedBills();
    }
  }

  return (
    <View>
      {deletedBills.map(bill => (
        <BillCard
          key={bill.id}
          bill={bill}
          onRestore={() => handleRestore(bill.id)}
          onPermanentDelete={() => handlePermanentDelete(bill.id)}
        />
      ))}
    </View>
  );
}
```

### Bulk Selection UI

```typescript
import { deleteBillsBatch, restoreBillsBatch } from '@/lib/data';

function BillListScreen() {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  async function handleBulkDelete() {
    const count = await deleteBillsBatch(selectedBills);
    alert(`${count} bills deleted`);
    setSelectedBills([]);
    setSelectionMode(false);
    refreshBills();
  }

  async function handleBulkRestore() {
    const count = await restoreBillsBatch(selectedBills);
    alert(`${count} bills restored`);
    setSelectedBills([]);
    setSelectionMode(false);
    refreshBills();
  }

  return (
    <View>
      {selectionMode && (
        <View>
          <Button title={`Delete ${selectedBills.length} bills`}
                  onPress={handleBulkDelete} />
          <Button title={`Restore ${selectedBills.length} bills`}
                  onPress={handleBulkRestore} />
        </View>
      )}
      {/* Bill list with checkboxes */}
    </View>
  );
}
```

### Scheduled Cleanup Task

```typescript
import { cleanupOldDeletedBills } from '@/lib/data';

// Run on app startup
async function initializeApp() {
  // ... other initialization

  // Clean up bills deleted more than 30 days ago
  const cleanedCount = await cleanupOldDeletedBills(30);

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} old bills`);
  }
}

// Or in settings screen
function SettingsScreen() {
  async function handleManualCleanup() {
    const count = await cleanupOldDeletedBills(30);
    alert(`${count} old bills permanently deleted`);
  }

  return (
    <View>
      <Button
        title="Clean up old deleted bills (30+ days)"
        onPress={handleManualCleanup}
      />
    </View>
  );
}
```

## Best Practices

### 1. Always Confirm Permanent Deletion
```typescript
// ❌ Bad - No confirmation
await hardDeleteBill(billId);

// ✅ Good - Confirm first
const confirmed = await Alert.alert(
  'Permanently Delete',
  'This bill will be permanently deleted. This cannot be undone.',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete Forever', style: 'destructive', onPress: () => hardDeleteBill(billId) }
  ]
);
```

### 2. Show Deletion Timestamp
```typescript
import { formatDistanceToNow } from 'date-fns';

function DeletedBillCard({ bill }: { bill: Bill }) {
  // Calculate time since deletion
  const deletedAt = bill.updatedAt; // deleted_at is set to updated_at during soft delete
  const timeAgo = formatDistanceToNow(deletedAt, { addSuffix: true });

  return (
    <View>
      <Text>{bill.title}</Text>
      <Text>Deleted {timeAgo}</Text>
    </View>
  );
}
```

### 3. Implement Undo Functionality
```typescript
import { deleteBill, restoreBill } from '@/lib/data';

async function handleDeleteWithUndo(billId: string) {
  await deleteBill(billId);

  // Show snackbar/toast with undo option
  showSnackbar({
    message: 'Bill deleted',
    action: {
      label: 'Undo',
      onPress: async () => {
        await restoreBill(billId);
        showSnackbar({ message: 'Bill restored' });
      }
    },
    duration: 5000 // 5 seconds to undo
  });
}
```

### 4. Handle Edge Cases
```typescript
// Check if bill is already deleted before deleting
const bill = await getBillById(billId);
if (bill?.status === BillStatus.DELETED) {
  console.log('Bill already deleted');
  return;
}

await deleteBill(billId);

// Check if bill exists and is deleted before restoring
const deletedBills = await getDeletedBills();
const billToRestore = deletedBills.find(b => b.id === billId);
if (!billToRestore) {
  console.log('Bill not found in deleted bills');
  return;
}

await restoreBill(billId);
```

### 5. Set Appropriate Retention Period
```typescript
// Different retention policies for different contexts
const RETENTION_POLICIES = {
  default: 30,        // 30 days for normal users
  compliance: 90,     // 90 days for regulatory compliance
  enterprise: 365,    // 1 year for enterprise accounts
  development: 7,     // 7 days in development
};

await cleanupOldDeletedBills(RETENTION_POLICIES.default);
```

## Testing

### Unit Tests
```typescript
import { deleteBill, restoreBill, getDeletedBills, cleanupOldDeletedBills } from '@/lib/data';

describe('Soft Delete', () => {
  it('should soft delete and restore bill', async () => {
    const bill = createTestBill();
    await createBill(bill);

    // Soft delete
    await deleteBill(bill.id);
    expect(await getBillById(bill.id)).toBeNull();

    // Restore
    await restoreBill(bill.id);
    expect(await getBillById(bill.id)).not.toBeNull();
  });

  it('should cleanup old deleted bills', async () => {
    // Create and delete bill 35 days ago
    const oldBill = createTestBill();
    await createBill(oldBill);
    await deleteBill(oldBill.id);

    // Mock timestamp to 35 days ago
    jest.setSystemTime(Date.now() - 35 * 24 * 60 * 60 * 1000);

    const count = await cleanupOldDeletedBills(30);
    expect(count).toBe(1);
  });
});
```

## Performance Considerations

### Query Optimization
All queries automatically exclude soft-deleted bills using indexed `status` column:
```sql
-- Fast query with index on status
SELECT * FROM bills WHERE status != 'DELETED' ORDER BY created_at DESC;
```

### Batch Operations
- Use batch operations for multiple deletions/restorations
- Reduces transaction overhead
- Improves UI responsiveness

### Cleanup Scheduling
- Run cleanup during low-usage periods (e.g., 3 AM)
- Use background tasks (WorkManager on Android, BackgroundTasks on iOS)
- Set reasonable retention periods to avoid large cleanup operations

## Security & Privacy

### Data Retention Compliance
- GDPR: Right to deletion (consider immediate hard delete for user requests)
- CCPA: Honor user deletion requests
- Set retention policies based on legal requirements

### Encryption
All soft-deleted bills remain encrypted in the database using SQLCipher.

### Audit Trail
Track deletion and restoration in application logs:
```typescript
import { deleteBill } from '@/lib/data';
import { logEvent } from '@/lib/analytics';

async function deleteBillWithLogging(billId: string, userId: string) {
  await deleteBill(billId);

  logEvent('bill_deleted', {
    billId,
    userId,
    timestamp: Date.now(),
  });
}
```

## Migration from Hard Delete

If you previously used hard delete (`DELETE FROM bills`), migrate to soft delete:

```typescript
// Old code (hard delete)
await db.runAsync('DELETE FROM bills WHERE id = ?', [billId]);

// New code (soft delete)
await deleteBill(billId);

// For permanent deletion (after confirmation)
await hardDeleteBill(billId);
```

## Troubleshooting

### Issue: Deleted bills still appearing
**Solution**: Check query filters
```typescript
// ❌ Wrong - includes deleted bills
const bills = await db.getAllAsync('SELECT * FROM bills');

// ✅ Correct - excludes deleted bills
const bills = await getAllBills(); // Uses WHERE status != 'DELETED'
```

### Issue: Cannot restore bill
**Solution**: Verify bill is actually soft-deleted
```typescript
const deletedBills = await getDeletedBills();
const billExists = deletedBills.find(b => b.id === billId);

if (!billExists) {
  console.log('Bill not found in deleted bills');
  // Bill might be permanently deleted or never existed
}
```

### Issue: Cleanup not working
**Solution**: Check deletion timestamps
```typescript
const deletedBills = await getDeletedBills();
deletedBills.forEach(bill => {
  const daysSinceDeleted = (Date.now() - bill.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  console.log(`Bill ${bill.id}: ${daysSinceDeleted} days old`);
});
```

## Summary

Soft delete provides a safety net for users while maintaining data integrity and compliance. Key features:

✅ **Restore capability** - Undo accidental deletions
✅ **Batch operations** - Efficient bulk actions
✅ **Auto-cleanup** - Configurable retention policies
✅ **Transaction safety** - Atomic operations with rollback
✅ **Query optimization** - Indexed status filtering
✅ **Encryption maintained** - SQLCipher protection preserved

For production apps, implement:
1. Trash/Recently Deleted screen with restore UI
2. Scheduled cleanup task (30-90 day retention)
3. User confirmation for permanent deletion
4. Undo functionality with toast/snackbar
5. Compliance-aware retention policies
