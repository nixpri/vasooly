/**
 * useButtonAnimation - Reusable button press animation hook
 * Provides animated style and press handlers for TouchableOpacity
 */

import { useCallback } from 'react';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { createButtonPressAnimation } from '@/utils/animations';
import { useHaptics } from './useHaptics';

export interface UseButtonAnimationOptions {
  /** Enable haptic feedback on press (default: false) */
  haptic?: boolean;
  /** Haptic intensity: 'light' | 'medium' | 'heavy' (default: 'light') */
  hapticIntensity?: 'light' | 'medium' | 'heavy';
}

/**
 * Button animation hook with haptic feedback
 * @param options - Animation options
 * @returns Object with animated style and press handlers
 */
export const useButtonAnimation = (options: UseButtonAnimationOptions = {}) => {
  const { haptic = false, hapticIntensity = 'light' } = options;
  const haptics = useHaptics();

  const isPressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    const animation = createButtonPressAnimation(isPressed.value);
    return {
      transform: [{ scale: animation.scale }],
      opacity: animation.opacity,
    };
  });

  const handlePressIn = useCallback(() => {
    isPressed.value = true;
    if (haptic) {
      if (hapticIntensity === 'light') haptics.light();
      else if (hapticIntensity === 'medium') haptics.medium();
      else haptics.heavy();
    }
  }, [haptic, hapticIntensity, haptics, isPressed]);

  const handlePressOut = useCallback(() => {
    isPressed.value = false;
  }, [isPressed]);

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};
