/**
 * Encryption key management for SQLite database
 * Uses expo-secure-store for OS-level keychain integration
 */

import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'vasooly_db_encryption_key';

/**
 * Generates a cryptographically secure random key for database encryption
 * @returns 32-byte hex string suitable for SQLCipher
 */
export function generateEncryptionKey(): string {
  // Generate 32 random bytes (256-bit key)
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for older environments (should not happen with modern Expo)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to hex string
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Retrieves or creates the database encryption key
 * Key is stored in OS keychain (iOS) or Android Keystore
 * @returns Promise resolving to encryption key hex string
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  try {
    // Try to retrieve existing key
    const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

    if (existingKey) {
      return existingKey;
    }

    // Generate new key if none exists
    const newKey = generateEncryptionKey();

    // Store in secure storage with strictest settings
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, newKey, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return newKey;
  } catch (error) {
    throw new Error(`Failed to get or create encryption key: ${error}`);
  }
}

/**
 * Deletes the encryption key (use with extreme caution - will make DB unreadable)
 * Only use for testing or if user explicitly requests data deletion
 */
export async function deleteEncryptionKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
  } catch (error) {
    throw new Error(`Failed to delete encryption key: ${error}`);
  }
}

/**
 * Checks if an encryption key exists in secure storage
 * @returns Promise resolving to boolean
 */
export async function hasEncryptionKey(): Promise<boolean> {
  try {
    const key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    return key !== null;
  } catch {
    return false;
  }
}

/**
 * Validates that secure storage is available on the device
 * @returns Promise resolving to boolean indicating if secure storage works
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  try {
    // Test write
    const testKey = '__vasooly_test__';
    const testValue = 'test';
    await SecureStore.setItemAsync(testKey, testValue);

    // Test read
    const retrieved = await SecureStore.getItemAsync(testKey);

    // Clean up
    await SecureStore.deleteItemAsync(testKey);

    return retrieved === testValue;
  } catch {
    return false;
  }
}
