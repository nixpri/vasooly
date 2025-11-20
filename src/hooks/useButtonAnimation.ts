/**
 * useButtonAnimation - Hook for button press animations
 *
 * Features:
 * - Scale + opacity animations on press
 * - Optional haptic feedback
 * - Memoized animated styles for performance
 * - Platform-optimized timing
 */

import { useCallback } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { springConfigs } from '../utils/animations';

interface UseButtonAnimationOptions {
  /** Enable haptic feedback on press */
  haptic?: boolean;
  /** Haptic intensity */
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  /** Custom press scale (default: 0.95) */
  pressScale?: number;
  /** Custom press opacity (default: 0.8) */
  pressOpacity?: number;
}

const HAPTIC_INTENSITY_MAP = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

export function useButtonAnimation(options: UseButtonAnimationOptions = {}) {
  const {
    haptic = false,
    hapticIntensity = 'light',
    pressScale = 0.95,
    pressOpacity = 0.8,
  } = options;

  // Shared values for animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Handle press in - scale down + dim
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(pressScale, springConfigs.snappy);
    opacity.value = withSpring(pressOpacity, springConfigs.snappy);

    // Trigger haptic feedback if enabled
    if (haptic) {
      Haptics.impactAsync(HAPTIC_INTENSITY_MAP[hapticIntensity]);
    }
  }, [haptic, hapticIntensity, pressScale, pressOpacity, scale, opacity]);

  // Handle press out - scale back + restore opacity
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.gentle);
    opacity.value = withSpring(1, springConfigs.gentle);
  }, [scale, opacity]);

  // Memoized animated style
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  }, [scale, opacity]);

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
}
