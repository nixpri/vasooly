/**
 * Tests for encryption key management
 */

import {
  generateEncryptionKey,
  getOrCreateEncryptionKey,
  deleteEncryptionKey,
  hasEncryptionKey,
  isSecureStorageAvailable,
} from '../encryption';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

describe('Encryption Key Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex string', () => {
      const key = generateEncryptionKey();
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('getOrCreateEncryptionKey', () => {
    it('should return existing key if one exists', async () => {
      const existingKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(existingKey);

      const key = await getOrCreateEncryptionKey();

      expect(key).toBe(existingKey);
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should create and store new key if none exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      const key = await getOrCreateEncryptionKey();

      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]+$/);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'vasooly_db_encryption_key',
        key,
        { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
      );
    });

    it('should throw error if secure storage fails', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      await expect(getOrCreateEncryptionKey()).rejects.toThrow(
        'Failed to get or create encryption key'
      );
    });
  });

  describe('deleteEncryptionKey', () => {
    it('should delete the encryption key', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await deleteEncryptionKey();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'vasooly_db_encryption_key'
      );
    });

    it('should throw error if deletion fails', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('Deletion failed')
      );

      await expect(deleteEncryptionKey()).rejects.toThrow(
        'Failed to delete encryption key'
      );
    });
  });

  describe('hasEncryptionKey', () => {
    it('should return true if key exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('some-key');

      const result = await hasEncryptionKey();

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await hasEncryptionKey();

      expect(result).toBe(false);
    });

    it('should return false if error occurs', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const result = await hasEncryptionKey();

      expect(result).toBe(false);
    });
  });

  describe('isSecureStorageAvailable', () => {
    it('should return true if secure storage works', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test');
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      const result = await isSecureStorageAvailable();

      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        '__vasooly_test__',
        'test'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        '__vasooly_test__'
      );
    });

    it('should return false if secure storage fails', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const result = await isSecureStorageAvailable();

      expect(result).toBe(false);
    });
  });
});
