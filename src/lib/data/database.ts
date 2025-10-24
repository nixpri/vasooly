/**
 * SQLite database initialization and management with SQLCipher encryption
 * Uses expo-sqlite with pragma key for encryption
 */

import * as SQLite from 'expo-sqlite';
import { getOrCreateEncryptionKey } from './encryption';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Database schema version for migrations
 */
export const SCHEMA_VERSION = 2;

/**
 * SQL schema definitions
 */
const SCHEMA_SQL = `
-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  total_amount_paise INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'SETTLED', 'DELETED')),
  deleted_at INTEGER,
  category TEXT,
  receipt_photo TEXT,
  description TEXT,
  activity_log TEXT
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY NOT NULL,
  bill_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  amount_paise INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PENDING', 'PAID')),
  paid_at INTEGER,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_bill_id ON participants(bill_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at INTEGER NOT NULL
);
`;

/**
 * Initializes the database with encryption
 * Must be called before any database operations
 * @returns Promise resolving to initialized database instance
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    // Get or create encryption key from secure storage
    const encryptionKey = await getOrCreateEncryptionKey();

    // Open database (creates if doesn't exist)
    db = await SQLite.openDatabaseAsync('vasooly.db');

    // CRITICAL: Set encryption key using PRAGMA
    // This must be the first operation after opening the database
    await db.execAsync(`PRAGMA key = '${encryptionKey}';`);

    // Verify encryption is working by testing a query
    try {
      await db.execAsync('SELECT count(*) FROM sqlite_master;');
    } catch {
      throw new Error('Database encryption verification failed - key may be invalid');
    }

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Set journal mode to WAL for better performance
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Create schema
    await db.execAsync(SCHEMA_SQL);

    // Check and update schema version
    await updateSchemaVersion(db);

    console.log('Database initialized successfully with encryption');
    return db;
  } catch (error) {
    db = null;
    throw new Error(`Failed to initialize database: ${error}`);
  }
}

/**
 * Gets the active database instance
 * Throws error if database not initialized
 * @returns Database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Closes the database connection
 * Should be called when app is closing (rare in mobile apps)
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * Updates schema version tracking
 */
async function updateSchemaVersion(database: SQLite.SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  );

  const currentVersion = result?.version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    await database.runAsync(
      'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
      [SCHEMA_VERSION, Date.now()]
    );
    console.log(`Schema updated from v${currentVersion} to v${SCHEMA_VERSION}`);
  }
}

/**
 * Resets the database (DANGEROUS - deletes all data)
 * Only use for testing or explicit user data deletion
 */
export async function resetDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }

  // Delete database file
  await SQLite.deleteDatabaseAsync('vasooly.db');
  console.log('Database reset complete');
}

/**
 * Verifies database encryption is active
 * @returns Promise resolving to boolean indicating if encryption is active
 */
export async function verifyEncryption(): Promise<boolean> {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{ cipher_version: string }>(
      'PRAGMA cipher_version;'
    );
    return result !== null && result.cipher_version !== undefined;
  } catch {
    return false;
  }
}

/**
 * Gets database statistics for monitoring
 */
export async function getDatabaseStats(): Promise<{
  billCount: number;
  participantCount: number;
  schemaVersion: number;
}> {
  const database = getDatabase();

  const billCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bills WHERE status != ?',
    ['DELETED']
  );

  const participantCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM participants'
  );

  const schemaVersion = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  );

  return {
    billCount: billCount?.count ?? 0,
    participantCount: participantCount?.count ?? 0,
    schemaVersion: schemaVersion?.version ?? 0,
  };
}
