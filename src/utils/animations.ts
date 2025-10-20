/**
 * Animation utilities for Reanimated worklet animations
 * Provides spring configurations and timing presets for consistent animations
 */

import { withSpring, withTiming, Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Spring animation configurations
 */
export const springConfigs = {
  /**
   * Gentle spring - Smooth, natural feel for most UI interactions
   * Use for: Button presses, card expansions, subtle movements
   */
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  } as WithSpringConfig,

  /**
   * Bouncy spring - Playful, energetic feel
   * Use for: Success states, celebration animations, emphasis
   */
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.3,
  } as WithSpringConfig,

  /**
   * Snappy spring - Quick, responsive feel
   * Use for: Status changes, toggle animations, instant feedback
   */
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.4,
  } as WithSpringConfig,

  /**
   * Smooth spring - Fluid, elegant feel
   * Use for: Progress bars, sliding animations, transitions
   */
  smooth: {
    damping: 18,
    stiffness: 180,
    mass: 0.6,
  } as WithSpringConfig,
} as const;

/**
 * Timing animation configurations
 */
export const timingConfigs = {
  /**
   * Quick timing - Fast, 150ms
   * Use for: Button feedback, instant responses
   */
  quick: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  /**
   * Standard timing - Normal, 250ms
   * Use for: Most UI transitions, modal presentations
   */
  standard: {
    duration: 250,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  /**
   * Slow timing - Deliberate, 400ms
   * Use for: Loading states, progress animations
   */
  slow: {
    duration: 400,
    easing: Easing.inOut(Easing.cubic),
  } as WithTimingConfig,

  /**
   * Linear timing - Constant speed, 300ms
   * Use for: Progress bars, count-up animations
   */
  linear: {
    duration: 300,
    easing: Easing.linear,
  } as WithTimingConfig,
} as const;

/**
 * Animation value presets
 */
export const animationValues = {
  /** Button press scale - 0.95 (subtle press effect) */
  buttonPressScale: 0.95,

  /** Button press opacity - 0.8 (slight dimming on press) */
  buttonPressOpacity: 0.8,

  /** Card hover scale - 1.02 (subtle lift effect) */
  cardHoverScale: 1.02,

  /** Shimmer opacity range - 0.3 to 0.7 (loading shimmer) */
  shimmerOpacityMin: 0.3,
  shimmerOpacityMax: 0.7,

  /** Rotation for loading spinner - 360 degrees */
  spinnerRotation: 360,

  /** Celebration confetti count */
  celebrationConfettiCount: 50,
} as const;

/**
 * Create button press animation (scale + opacity)
 * @param isPressed - Whether button is currently pressed
 * @returns Object with scale and opacity animated values
 */
export const createButtonPressAnimation = (isPressed: boolean) => {
  'worklet';
  return {
    scale: withSpring(
      isPressed ? animationValues.buttonPressScale : 1,
      springConfigs.gentle
    ),
    opacity: withSpring(
      isPressed ? animationValues.buttonPressOpacity : 1,
      springConfigs.gentle
    ),
  };
};

/**
 * Create status change animation (scale bounce)
 * @param trigger - Boolean trigger to start animation
 * @returns Animated scale value
 */
export const createStatusChangeAnimation = (trigger: boolean) => {
  'worklet';
  // Bounce effect: normal -> shrink -> expand -> normal
  return trigger
    ? withSpring(1.1, springConfigs.bouncy, () => {
        return withSpring(1, springConfigs.snappy);
      })
    : withSpring(1, springConfigs.snappy);
};

/**
 * Create progress bar animation
 * @param progress - Progress percentage (0-100)
 * @returns Animated width percentage
 */
export const createProgressAnimation = (progress: number) => {
  'worklet';
  return withSpring(progress, springConfigs.smooth);
};

/**
 * Create fade in animation
 * @param visible - Whether element should be visible
 * @returns Animated opacity value
 */
export const createFadeAnimation = (visible: boolean) => {
  'worklet';
  return withTiming(visible ? 1 : 0, timingConfigs.standard);
};

/**
 * Create slide animation (translateY)
 * @param visible - Whether element should be visible
 * @param distance - Distance to slide (default 20px)
 * @returns Animated translateY value
 */
export const createSlideAnimation = (visible: boolean, distance: number = 20) => {
  'worklet';
  return withSpring(
    visible ? 0 : distance,
    springConfigs.smooth
  );
};

/**
 * Create rotation animation for loading spinners
 * @param isLoading - Whether spinner should be rotating
 * @returns Animated rotation value (0-360 degrees)
 */
export const createSpinnerAnimation = (isLoading: boolean) => {
  'worklet';
  return isLoading
    ? withTiming(animationValues.spinnerRotation, {
        duration: 1000,
        easing: Easing.linear,
      })
    : withTiming(0, timingConfigs.quick);
};

/**
 * Create celebration animation (scale + rotate)
 * Returns animation values for celebration effect
 */
export const createCelebrationAnimation = () => {
  'worklet';
  return {
    scale: withSpring(1.15, springConfigs.bouncy, () => {
      return withSpring(1, springConfigs.smooth);
    }),
    rotation: withTiming(360, { duration: 600, easing: Easing.out(Easing.cubic) }, () => {
      return withTiming(0, { duration: 0 });
    }),
  };
};
