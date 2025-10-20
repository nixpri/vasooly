/**
 * Settings Store Tests
 * Comprehensive tests for Zustand settings state management
 */

import { renderHook, act } from '@testing-library/react-native';
import { useSettingsStore } from '../settingsStore';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useSettingsStore());
    act(() => {
      result.current.defaultVPA = null;
      result.current.defaultUPIName = null;
      result.current.enableHaptics = true;
      result.current.autoDeleteDays = 30;
      result.current.reminderEnabled = true;
      result.current.isLoading = false;
      result.current.error = null;
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.defaultVPA).toBeNull();
      expect(result.current.defaultUPIName).toBeNull();
      expect(result.current.enableHaptics).toBe(true);
      expect(result.current.autoDeleteDays).toBe(30);
      expect(result.current.reminderEnabled).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setDefaultVPA', () => {
    it('should set default VPA successfully', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setDefaultVPA('user@upi', 'John Doe');
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_default_vpa',
        'user@upi'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_default_upi_name',
        'John Doe'
      );
      expect(result.current.defaultVPA).toBe('user@upi');
      expect(result.current.defaultUPIName).toBe('John Doe');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should reject invalid VPA format', async () => {
      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.setDefaultVPA('invalid-vpa', 'John Doe');
        } catch {
          // Expected error
        }
      });

      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(result.current.error).toBe(
        'Invalid VPA format. Must be in format: username@bankname'
      );
      expect(result.current.defaultVPA).toBeNull();
    });

    it('should handle storage error', async () => {
      const errorMessage = 'Storage error';
      mockSecureStore.setItemAsync.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.setDefaultVPA('user@upi', 'John Doe');
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearDefaultVPA', () => {
    it('should clear default VPA successfully', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      // Set initial VPA
      act(() => {
        result.current.defaultVPA = 'user@upi';
        result.current.defaultUPIName = 'John Doe';
      });

      await act(async () => {
        await result.current.clearDefaultVPA();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('settings_default_vpa');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('settings_default_upi_name');
      expect(result.current.defaultVPA).toBeNull();
      expect(result.current.defaultUPIName).toBeNull();
    });

    it('should handle clear error', async () => {
      const errorMessage = 'Delete error';
      mockSecureStore.deleteItemAsync.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.clearDefaultVPA();
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('setEnableHaptics', () => {
    it('should enable haptics', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setEnableHaptics(true);
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('settings_enable_haptics', 'true');
      expect(result.current.enableHaptics).toBe(true);
    });

    it('should disable haptics', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setEnableHaptics(false);
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_enable_haptics',
        'false'
      );
      expect(result.current.enableHaptics).toBe(false);
    });
  });

  describe('setAutoDeleteDays', () => {
    it('should set auto delete days successfully', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setAutoDeleteDays(60);
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_auto_delete_days',
        '60'
      );
      expect(result.current.autoDeleteDays).toBe(60);
    });

    it('should reject days < 1', async () => {
      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.setAutoDeleteDays(0);
        } catch {
          // Expected error
        }
      });

      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Auto delete days must be between 1 and 365');
    });

    it('should reject days > 365', async () => {
      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.setAutoDeleteDays(400);
        } catch {
          // Expected error
        }
      });

      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Auto delete days must be between 1 and 365');
    });
  });

  describe('setReminderEnabled', () => {
    it('should enable reminders', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setReminderEnabled(true);
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_reminder_enabled',
        'true'
      );
      expect(result.current.reminderEnabled).toBe(true);
    });

    it('should disable reminders', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.setReminderEnabled(false);
      });

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'settings_reminder_enabled',
        'false'
      );
      expect(result.current.reminderEnabled).toBe(false);
    });
  });

  describe('loadSettings', () => {
    it('should load all settings successfully', async () => {
      mockSecureStore.getItemAsync.mockImplementation((key) => {
        const values: Record<string, string> = {
          settings_default_vpa: 'user@upi',
          settings_default_upi_name: 'John Doe',
          settings_enable_haptics: 'false',
          settings_auto_delete_days: '60',
          settings_reminder_enabled: 'false',
        };
        return Promise.resolve(values[key] || null);
      });

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.loadSettings();
      });

      expect(result.current.defaultVPA).toBe('user@upi');
      expect(result.current.defaultUPIName).toBe('John Doe');
      expect(result.current.enableHaptics).toBe(false);
      expect(result.current.autoDeleteDays).toBe(60);
      expect(result.current.reminderEnabled).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should use defaults for missing settings', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        await result.current.loadSettings();
      });

      expect(result.current.defaultVPA).toBeNull();
      expect(result.current.defaultUPIName).toBeNull();
      expect(result.current.enableHaptics).toBe(true);
      expect(result.current.autoDeleteDays).toBe(30);
      expect(result.current.reminderEnabled).toBe(true);
    });

    it('should handle load error with fallback to defaults', async () => {
      const errorMessage = 'Load error';
      mockSecureStore.getItemAsync.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.loadSettings();
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
      // Should fallback to defaults
      expect(result.current.defaultVPA).toBeNull();
      expect(result.current.enableHaptics).toBe(true);
      expect(result.current.autoDeleteDays).toBe(30);
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      const { result } = renderHook(() => useSettingsStore());

      // Set custom values
      act(() => {
        result.current.defaultVPA = 'user@upi';
        result.current.defaultUPIName = 'John Doe';
        result.current.enableHaptics = false;
        result.current.autoDeleteDays = 60;
        result.current.reminderEnabled = false;
      });

      await act(async () => {
        await result.current.resetSettings();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(6);
      expect(result.current.defaultVPA).toBeNull();
      expect(result.current.defaultUPIName).toBeNull();
      expect(result.current.enableHaptics).toBe(true);
      expect(result.current.autoDeleteDays).toBe(30);
      expect(result.current.reminderEnabled).toBe(true);
    });

    it('should handle reset error', async () => {
      const errorMessage = 'Reset error';
      mockSecureStore.deleteItemAsync.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useSettingsStore());

      await act(async () => {
        try {
          await result.current.resetSettings();
        } catch {
          // Expected error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Selectors', () => {
    it('should check if has default VPA', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.hasDefaultVPA()).toBe(false);

      act(() => {
        result.current.defaultVPA = 'user@upi';
      });

      expect(result.current.hasDefaultVPA()).toBe(true);
    });

    it('should get default VPA', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.getDefaultVPA()).toBeNull();

      act(() => {
        result.current.defaultVPA = 'user@upi';
      });

      expect(result.current.getDefaultVPA()).toBe('user@upi');
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
