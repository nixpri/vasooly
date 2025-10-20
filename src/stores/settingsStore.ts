/**
 * Settings Store - Zustand state management for app preferences
 * Manages user preferences with expo-secure-store persistence
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { validateVPA } from '../lib/business/upiGenerator';

interface AppSettings {
  defaultVPA: string | null;
  defaultUPIName: string | null;
  enableHaptics: boolean;
  autoDeleteDays: number;
  reminderEnabled: boolean;
  onboardingCompleted: boolean;
}

interface SettingsState extends AppSettings {
  // State
  isLoading: boolean;
  error: string | null;

  // Actions - VPA Management
  setDefaultVPA: (vpa: string, name: string) => Promise<void>;
  clearDefaultVPA: () => Promise<void>;

  // Actions - Preferences
  setEnableHaptics: (enabled: boolean) => Promise<void>;
  setAutoDeleteDays: (days: number) => Promise<void>;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;

  // Actions - Persistence
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;

  // Actions - Error Handling
  clearError: () => void;

  // Selectors
  hasDefaultVPA: () => boolean;
  getDefaultVPA: () => string | null;
}

// Secure storage keys
const STORAGE_KEYS = {
  DEFAULT_VPA: 'settings_default_vpa',
  DEFAULT_UPI_NAME: 'settings_default_upi_name',
  ENABLE_HAPTICS: 'settings_enable_haptics',
  AUTO_DELETE_DAYS: 'settings_auto_delete_days',
  REMINDER_ENABLED: 'settings_reminder_enabled',
  ONBOARDING_COMPLETED: 'settings_onboarding_completed',
} as const;

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  defaultVPA: null,
  defaultUPIName: null,
  enableHaptics: true,
  autoDeleteDays: 30,
  reminderEnabled: true,
  onboardingCompleted: false,
};

/**
 * Helper: Save value to secure store
 */
async function saveToSecureStore(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

/**
 * Helper: Load value from secure store
 */
async function loadFromSecureStore(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

/**
 * Helper: Delete value from secure store
 */
async function deleteFromSecureStore(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial State
  ...DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  // Set Default VPA
  setDefaultVPA: async (vpa: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      // Validate VPA format
      const validation = validateVPA(vpa);
      if (!validation.isValid) {
        throw new Error(`Invalid VPA format. Must be in format: username@bankname`);
      }

      // Save to secure store
      await saveToSecureStore(STORAGE_KEYS.DEFAULT_VPA, vpa);
      await saveToSecureStore(STORAGE_KEYS.DEFAULT_UPI_NAME, name);

      set({
        defaultVPA: vpa,
        defaultUPIName: name,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save default VPA';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear Default VPA
  clearDefaultVPA: async () => {
    set({ isLoading: true, error: null });

    try {
      await deleteFromSecureStore(STORAGE_KEYS.DEFAULT_VPA);
      await deleteFromSecureStore(STORAGE_KEYS.DEFAULT_UPI_NAME);

      set({
        defaultVPA: null,
        defaultUPIName: null,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear default VPA';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Enable Haptics
  setEnableHaptics: async (enabled: boolean) => {
    set({ isLoading: true, error: null });

    try {
      await saveToSecureStore(STORAGE_KEYS.ENABLE_HAPTICS, enabled.toString());
      set({ enableHaptics: enabled, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update haptics setting';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Auto Delete Days
  setAutoDeleteDays: async (days: number) => {
    set({ isLoading: true, error: null });

    try {
      if (days < 1 || days > 365) {
        throw new Error('Auto delete days must be between 1 and 365');
      }

      await saveToSecureStore(STORAGE_KEYS.AUTO_DELETE_DAYS, days.toString());
      set({ autoDeleteDays: days, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update auto delete days';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Reminder Enabled
  setReminderEnabled: async (enabled: boolean) => {
    set({ isLoading: true, error: null });

    try {
      await saveToSecureStore(STORAGE_KEYS.REMINDER_ENABLED, enabled.toString());
      set({ reminderEnabled: enabled, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update reminder setting';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set Onboarding Completed
  setOnboardingCompleted: async (completed: boolean) => {
    set({ isLoading: true, error: null });

    try {
      await saveToSecureStore(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
      set({ onboardingCompleted: completed, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update onboarding status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Load Settings
  loadSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [vpa, name, haptics, deleteDays, reminders, onboarding] = await Promise.all([
        loadFromSecureStore(STORAGE_KEYS.DEFAULT_VPA),
        loadFromSecureStore(STORAGE_KEYS.DEFAULT_UPI_NAME),
        loadFromSecureStore(STORAGE_KEYS.ENABLE_HAPTICS),
        loadFromSecureStore(STORAGE_KEYS.AUTO_DELETE_DAYS),
        loadFromSecureStore(STORAGE_KEYS.REMINDER_ENABLED),
        loadFromSecureStore(STORAGE_KEYS.ONBOARDING_COMPLETED),
      ]);

      // Ensure boolean values are strictly typed (Switch component requires actual booleans)
      const enableHapticsValue = haptics === null ? DEFAULT_SETTINGS.enableHaptics : Boolean(haptics === 'true');
      const reminderEnabledValue = reminders === null ? DEFAULT_SETTINGS.reminderEnabled : Boolean(reminders === 'true');
      const onboardingCompletedValue = onboarding === null ? DEFAULT_SETTINGS.onboardingCompleted : Boolean(onboarding === 'true');
      const autoDeleteDaysValue = deleteDays ? parseInt(deleteDays, 10) : DEFAULT_SETTINGS.autoDeleteDays;

      set({
        defaultVPA: vpa,
        defaultUPIName: name,
        enableHaptics: enableHapticsValue,
        autoDeleteDays: autoDeleteDaysValue,
        reminderEnabled: reminderEnabledValue,
        onboardingCompleted: onboardingCompletedValue,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      // Fallback to defaults on error
      set({
        ...DEFAULT_SETTINGS,
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset Settings
  resetSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      // Clear all secure store items
      await Promise.all([
        deleteFromSecureStore(STORAGE_KEYS.DEFAULT_VPA),
        deleteFromSecureStore(STORAGE_KEYS.DEFAULT_UPI_NAME),
        deleteFromSecureStore(STORAGE_KEYS.ENABLE_HAPTICS),
        deleteFromSecureStore(STORAGE_KEYS.AUTO_DELETE_DAYS),
        deleteFromSecureStore(STORAGE_KEYS.REMINDER_ENABLED),
        deleteFromSecureStore(STORAGE_KEYS.ONBOARDING_COMPLETED),
      ]);

      set({
        ...DEFAULT_SETTINGS,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset settings';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Selectors
  hasDefaultVPA: () => {
    return get().defaultVPA !== null;
  },

  getDefaultVPA: () => {
    return get().defaultVPA;
  },
}));
