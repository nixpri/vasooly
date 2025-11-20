/**
 * Animation utilities for Reanimated worklet animations
 * Provides spring configurations and timing presets for consistent animations
 *
 * Performance optimizations:
 * - overshootClamping prevents bounce-back (smoother on Android)
 * - Platform-specific configs for cross-platform consistency
 * - Decay animations for momentum/flick gestures
 */

import { Platform } from 'react-native';
import { withSpring, withTiming, withDecay, Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig, WithDecayConfig } from 'react-native-reanimated';

/**
 * Spring animation configurations
 * Updated with overshootClamping for smoother Android performance
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
    overshootClamping: false,  // Allow natural bounce
  } as WithSpringConfig,

  /**
   * Bouncy spring - Playful, energetic feel
   * Use for: Success states, celebration animations, emphasis
   */
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.3,
    overshootClamping: false,  // Allow playful bounce
  } as WithSpringConfig,

  /**
   * Snappy spring - Quick, responsive feel
   * Use for: Status changes, toggle animations, instant feedback
   */
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.4,
    overshootClamping: true,   // Prevent overshoot for crisp stops
  } as WithSpringConfig,

  /**
   * Smooth spring - Fluid, elegant feel
   * Use for: Progress bars, sliding animations, transitions
   */
  smooth: {
    damping: 18,
    stiffness: 180,
    mass: 0.6,
    overshootClamping: true,   // Smooth, controlled motion
  } as WithSpringConfig,
} as const;

/**
 * Timing animation configurations
 * Platform-optimized for consistent cross-platform performance
 */
export const timingConfigs = {
  /**
   * Quick timing - Fast, 150ms
   * Use for: Button feedback, instant responses
   */
  quick: {
    duration: Platform.select({ ios: 150, android: 120 }),  // Faster on Android
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  /**
   * Standard timing - Normal, 250ms
   * Use for: Most UI transitions, modal presentations
   */
  standard: {
    duration: Platform.select({ ios: 250, android: 220 }),  // Slightly faster on Android
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
 * Decay animation configurations for momentum/flick gestures
 * Creates natural deceleration with optional rubber-banding at boundaries
 */
export const decayConfigs = {
  /**
   * Flick decay - High velocity, natural deceleration
   * Use for: Swipe-to-dismiss, flick gestures, momentum scrolling
   */
  flick: {
    deceleration: 0.998,      // Very gradual slowdown
    velocityFactor: 1,         // Full velocity applied
    rubberBandEffect: true,    // Bounce at boundaries
    rubberBandFactor: 0.6,     // Moderate bounce strength
    clamp: undefined,          // No boundaries (set per-use)
  } as WithDecayConfig,

  /**
   * Scroll decay - Moderate velocity, controlled deceleration
   * Use for: Custom scroll views, pan gestures with momentum
   */
  scroll: {
    deceleration: 0.995,       // Faster slowdown than flick
    velocityFactor: 0.8,       // Slightly reduced velocity
    rubberBandEffect: true,
    rubberBandFactor: 0.4,     // Subtle bounce
    clamp: undefined,
  } as WithDecayConfig,

  /**
   * Snap decay - Quick settling, snaps to position
   * Use for: Carousel items, swipeable cards with snap points
   */
  snap: {
    deceleration: 0.99,        // Fast deceleration
    velocityFactor: 0.6,       // Reduced velocity
    rubberBandEffect: false,   // No bounce, crisp snap
    clamp: undefined,
  } as WithDecayConfig,
} as const;

/**
 * Platform-specific spring configs
 * Android benefits from overshootClamping, iOS handles bounces better
 */
export const platformSpringConfigs = Platform.select({
  ios: springConfigs,
  android: {
    gentle: { ...springConfigs.gentle, overshootClamping: true },
    bouncy: { ...springConfigs.bouncy, overshootClamping: true, damping: 12 },
    snappy: { ...springConfigs.snappy, overshootClamping: true },
    smooth: { ...springConfigs.smooth, overshootClamping: true },
  },
}) as typeof springConfigs;

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

/**
 * Platform-specific hardware acceleration props
 * Optimizes rendering performance for animated components
 */
export const platformHardwareProps = Platform.select({
  ios: {
    shouldRasterizeIOS: true,  // Cache layer for better performance
  },
  android: {
    renderToHardwareTextureAndroid: true,  // Enable hardware texture
    needsOffscreenAlphaCompositing: false, // Disable unless needed for opacity
  },
}) as const;

/**
 * Get platform-optimized text props for animated text
 * Android requires hardware texture for smooth animated text
 */
export const getAnimatedTextProps = () => ({
  ...Platform.select({
    android: {
      renderToHardwareTextureAndroid: true,
    },
    ios: {
      shouldRasterizeIOS: true,
    },
  }),
});

/**
 * Transform helpers for GPU-accelerated animations
 * Always use transforms instead of layout properties for best performance
 */
export const createTransform = {
  /**
   * Translate helper - Use instead of left/right/top/bottom
   */
  translate: (x: number, y: number = 0) => [
    { translateX: x },
    { translateY: y },
  ],

  /**
   * Scale helper - Use instead of width/height changes
   */
  scale: (scale: number) => [{ scale }],

  /**
   * Rotate helper - Degrees to transform
   */
  rotate: (degrees: number) => [{ rotate: `${degrees}deg` }],

  /**
   * Combined transform - All transformations in order
   */
  combined: (x: number, y: number, scale: number, rotation: number) => [
    { translateX: x },
    { translateY: y },
    { scale },
    { rotate: `${rotation}deg` },
  ],
};

/**
 * Memory optimization - Use for gesture memoization
 * Prevents re-creating gesture objects on every render
 *
 * Usage:
 * ```typescript
 * const gesture = useMemo(
 *   () => createGesture(dependencies),
 *   [dependencies]
 * );
 * ```
 */
export const gestureConfig = {
  /**
   * Standard pan gesture config
   */
  pan: {
    activeOffsetX: [-10, 10],
    activeOffsetY: [-10, 10],
    failOffsetX: [-5, 5],
    failOffsetY: [-5, 5],
  },

  /**
   * Horizontal-only pan
   */
  panHorizontal: {
    activeOffsetX: [-10, 10],
    failOffsetY: [-10, 10],
  },

  /**
   * Vertical-only pan
   */
  panVertical: {
    activeOffsetY: [-10, 10],
    failOffsetX: [-10, 10],
  },
} as const;
