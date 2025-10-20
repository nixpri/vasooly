/**
 * Contacts Service
 *
 * Handles contact picker integration with permission management
 * and graceful fallback for when permissions are denied.
 *
 * Features:
 * - Permission request with proper messaging
 * - Contact picker for participant selection
 * - Graceful fallback to manual entry
 * - Error handling for edge cases
 */

import * as Contacts from 'expo-contacts';

export interface ContactPickerResult {
  success: boolean;
  contacts?: Array<{
    name: string;
    phoneNumber?: string;
  }>;
  error?: string;
  permissionDenied?: boolean;
}

/**
 * Request contacts permission from the user
 *
 * @returns Permission status and whether it was granted
 */
export async function requestContactsPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  try {
    const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting contacts permission:', error);
    return { granted: false, canAskAgain: false };
  }
}

/**
 * Check if contacts permission is already granted
 *
 * @returns Whether permission is granted
 */
export async function hasContactsPermission(): Promise<boolean> {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking contacts permission:', error);
    return false;
  }
}

/**
 * Pick a single contact from the user's contacts
 *
 * @returns ContactPickerResult with selected contact or error
 */
export async function pickContact(): Promise<ContactPickerResult> {
  try {
    // Check if permission is already granted
    const hasPermission = await hasContactsPermission();

    if (!hasPermission) {
      // Request permission
      const { granted, canAskAgain } = await requestContactsPermission();

      if (!granted) {
        return {
          success: false,
          permissionDenied: true,
          error: canAskAgain
            ? 'Contacts permission denied. Please grant permission to select contacts.'
            : 'Contacts permission denied. Please enable in Settings.',
        };
      }
    }

    // Get contact
    const contact = await Contacts.presentContactPickerAsync();

    if (!contact) {
      // User cancelled
      return {
        success: false,
        error: 'Contact selection cancelled',
      };
    }

    // Extract name and phone number
    const name = contact.name || 'Unknown';
    const phoneNumber =
      contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers[0].number
        : undefined;

    return {
      success: true,
      contacts: [{ name, phoneNumber }],
    };
  } catch (error) {
    console.error('Error picking contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pick contact',
    };
  }
}

/**
 * Pick multiple contacts from the user's contacts
 *
 * Note: Expo Contacts doesn't support multiple selection natively,
 * so this will need to be called multiple times in sequence.
 *
 * @param count Number of contacts to pick
 * @returns ContactPickerResult with selected contacts or error
 */
export async function pickMultipleContacts(
  count: number
): Promise<ContactPickerResult> {
  try {
    const contacts: Array<{ name: string; phoneNumber?: string }> = [];

    for (let i = 0; i < count; i++) {
      const result = await pickContact();

      if (!result.success) {
        // If user cancels or permission denied, return what we have so far
        if (contacts.length > 0) {
          return {
            success: true,
            contacts,
          };
        }
        return result;
      }

      if (result.contacts && result.contacts.length > 0) {
        contacts.push(result.contacts[0]);
      }
    }

    return {
      success: true,
      contacts,
    };
  } catch (error) {
    console.error('Error picking multiple contacts:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to pick contacts',
    };
  }
}

/**
 * Search contacts by name
 *
 * Note: This requires full contacts permission and access to all contacts.
 * Use sparingly and only when necessary for better privacy.
 *
 * @param query Search query (name substring)
 * @returns ContactPickerResult with matching contacts or error
 */
export async function searchContacts(
  query: string
): Promise<ContactPickerResult> {
  try {
    // Check permission
    const hasPermission = await hasContactsPermission();

    if (!hasPermission) {
      const { granted } = await requestContactsPermission();

      if (!granted) {
        return {
          success: false,
          permissionDenied: true,
          error: 'Contacts permission denied',
        };
      }
    }

    // Get all contacts and filter
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });

    const filtered = data.filter((contact) =>
      contact.name?.toLowerCase().includes(query.toLowerCase())
    );

    const contacts = filtered.map((contact) => ({
      name: contact.name || 'Unknown',
      phoneNumber:
        contact.phoneNumbers && contact.phoneNumbers.length > 0
          ? contact.phoneNumbers[0].number
          : undefined,
    }));

    return {
      success: true,
      contacts,
    };
  } catch (error) {
    console.error('Error searching contacts:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to search contacts',
    };
  }
}

/**
 * Get formatted error message for UI display
 *
 * @param result ContactPickerResult
 * @returns User-friendly error message
 */
export function getContactErrorMessage(result: ContactPickerResult): string {
  if (!result.error) return '';

  if (result.permissionDenied) {
    return 'To select from your contacts, please allow contact access in your device settings.';
  }

  return result.error;
}
