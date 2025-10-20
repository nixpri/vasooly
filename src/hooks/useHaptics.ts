/**
 * useHaptics - Haptic feedback hook integrated with settingsStore
 * Provides haptic feedback functions that respect user preferences
 */

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/stores/settingsStore';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Haptic feedback hook with settings integration
 * @returns Object with haptic trigger functions
 */
export const useHaptics = () => {
  const { enableHaptics } = useSettingsStore();

  /**
   * Trigger haptic feedback (respects user settings)
   * @param type - Type of haptic feedback to trigger
   */
  const triggerHaptic = useCallback(
    async (type: HapticType = 'light') => {
      if (!enableHaptics) return;

      try {
        switch (type) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case 'selection':
            await Haptics.selectionAsync();
            break;
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch (error) {
        // Silently fail if haptics not available
        console.warn('Haptic feedback failed:', error);
      }
    },
    [enableHaptics]
  );

  /**
   * Convenience functions for common haptic patterns
   */
  const haptics = {
    /** Light tap - for button presses, selections */
    light: () => triggerHaptic('light'),

    /** Medium impact - for toggles, status changes */
    medium: () => triggerHaptic('medium'),

    /** Heavy impact - for important actions, confirmations */
    heavy: () => triggerHaptic('heavy'),

    /** Success notification - for completed actions */
    success: () => triggerHaptic('success'),

    /** Warning notification - for warnings, cautions */
    warning: () => triggerHaptic('warning'),

    /** Error notification - for errors, failures */
    error: () => triggerHaptic('error'),

    /** Selection feedback - for picker selections */
    selection: () => triggerHaptic('selection'),
  };

  return haptics;
};
