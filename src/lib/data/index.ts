/**
 * Data layer public API
 * Exports all database functionality with encryption
 */

// Database initialization
export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  resetDatabase,
  verifyEncryption,
  getDatabaseStats,
  SCHEMA_VERSION,
} from './database';

// Encryption key management
export {
  getOrCreateEncryptionKey,
  deleteEncryptionKey,
  hasEncryptionKey,
  isSecureStorageAvailable,
} from './encryption';

// Bill repository (data access layer)
export {
  createBill,
  getBillById,
  getAllBills,
  updateBillStatus,
  deleteBill,
  hardDeleteBill,
  updateParticipantStatus,
  getParticipantsByBillId,
  getBillStatistics,
  searchBills,
  duplicateBill,
} from './billRepository';

// Migration system
export {
  getCurrentVersion,
  runMigrations,
  rollbackToVersion,
  getMigrationHistory,
  validateMigrations,
} from './migrations';
