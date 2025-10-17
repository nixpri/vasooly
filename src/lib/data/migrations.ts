/**
 * Database migration system for schema versioning
 * Supports incremental schema updates with rollback capability
 */

import * as SQLite from 'expo-sqlite';
import { SCHEMA_VERSION } from './database';

/**
 * Migration definition
 */
interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * All migrations in order
 * Add new migrations here as schema evolves
 */
const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema with bills and participants',
    up: async (db) => {
      // Schema is created in database.ts initialization
      // This migration is a no-op since we're at v1
      await db.execAsync('SELECT 1;');
    },
    down: async (db) => {
      await db.execAsync('DROP TABLE IF EXISTS participants;');
      await db.execAsync('DROP TABLE IF EXISTS bills;');
      await db.execAsync('DROP TABLE IF EXISTS schema_version;');
    },
  },
  // Future migrations go here:
  // {
  //   version: 2,
  //   description: 'Add attachments table',
  //   up: async (db) => {
  //     await db.execAsync(`
  //       CREATE TABLE IF NOT EXISTS attachments (
  //         id TEXT PRIMARY KEY NOT NULL,
  //         bill_id TEXT NOT NULL,
  //         file_uri TEXT NOT NULL,
  //         file_type TEXT NOT NULL,
  //         created_at INTEGER NOT NULL,
  //         FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  //       );
  //     `);
  //     await db.execAsync('CREATE INDEX IF NOT EXISTS idx_attachments_bill_id ON attachments(bill_id);');
  //   },
  //   down: async (db) => {
  //     await db.execAsync('DROP TABLE IF EXISTS attachments;');
  //   },
  // },
];

/**
 * Gets current database schema version
 */
export async function getCurrentVersion(
  db: SQLite.SQLiteDatabase
): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    );
    return result?.version ?? 0;
  } catch {
    // Table doesn't exist yet, we're at version 0
    return 0;
  }
}

/**
 * Applies all pending migrations
 */
export async function runMigrations(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  console.log(`Current schema version: ${currentVersion}`);
  console.log(`Target schema version: ${SCHEMA_VERSION}`);

  if (currentVersion >= SCHEMA_VERSION) {
    console.log('No migrations needed');
    return;
  }

  // Get pending migrations
  const pendingMigrations = migrations.filter(
    (m) => m.version > currentVersion && m.version <= SCHEMA_VERSION
  );

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations found');
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s)...`);

  for (const migration of pendingMigrations) {
    try {
      console.log(
        `Applying migration v${migration.version}: ${migration.description}`
      );

      await db.withTransactionAsync(async () => {
        await migration.up(db);

        // Record migration
        await db.runAsync(
          'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
          [migration.version, Date.now()]
        );
      });

      console.log(`Migration v${migration.version} applied successfully`);
    } catch (error) {
      console.error(`Migration v${migration.version} failed:`, error);
      throw new Error(
        `Migration v${migration.version} failed: ${error}`
      );
    }
  }

  console.log('All migrations completed successfully');
}

/**
 * Rolls back migrations to a specific version (use with caution)
 * @param targetVersion Version to roll back to
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('No rollback needed');
    return;
  }

  // Get migrations to rollback in reverse order
  const migrationsToRollback = migrations
    .filter((m) => m.version > targetVersion && m.version <= currentVersion)
    .reverse();

  if (migrationsToRollback.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  console.log(`Rolling back ${migrationsToRollback.length} migration(s)...`);

  for (const migration of migrationsToRollback) {
    if (!migration.down) {
      throw new Error(
        `Migration v${migration.version} has no rollback defined`
      );
    }

    try {
      console.log(
        `Rolling back migration v${migration.version}: ${migration.description}`
      );

      await db.withTransactionAsync(async () => {
        await migration.down!(db);

        // Remove migration record
        await db.runAsync(
          'DELETE FROM schema_version WHERE version = ?',
          [migration.version]
        );
      });

      console.log(`Migration v${migration.version} rolled back successfully`);
    } catch (error) {
      console.error(`Rollback of v${migration.version} failed:`, error);
      throw new Error(
        `Rollback of v${migration.version} failed: ${error}`
      );
    }
  }

  console.log('Rollback completed successfully');
}

/**
 * Gets migration history
 */
export async function getMigrationHistory(
  db: SQLite.SQLiteDatabase
): Promise<Array<{ version: number; appliedAt: Date }>> {
  try {
    const rows = await db.getAllAsync<{ version: number; applied_at: number }>(
      'SELECT version, applied_at FROM schema_version ORDER BY version ASC'
    );

    return rows.map((row) => ({
      version: row.version,
      appliedAt: new Date(row.applied_at),
    }));
  } catch {
    return [];
  }
}

/**
 * Validates that all migrations are properly defined
 */
export function validateMigrations(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate versions
  const versions = migrations.map((m) => m.version);
  const uniqueVersions = new Set(versions);
  if (versions.length !== uniqueVersions.size) {
    errors.push('Duplicate migration versions detected');
  }

  // Check for gaps in version numbers
  const sortedVersions = [...versions].sort((a, b) => a - b);
  for (let i = 0; i < sortedVersions.length - 1; i++) {
    if (sortedVersions[i + 1] !== sortedVersions[i] + 1) {
      errors.push(
        `Gap in migration versions: ${sortedVersions[i]} -> ${sortedVersions[i + 1]}`
      );
    }
  }

  // Check that highest migration matches SCHEMA_VERSION
  const highestVersion = Math.max(...versions, 0);
  if (highestVersion !== SCHEMA_VERSION) {
    errors.push(
      `Highest migration version (${highestVersion}) doesn't match SCHEMA_VERSION (${SCHEMA_VERSION})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
