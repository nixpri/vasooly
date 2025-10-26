/**
 * Shared Element Transition Helpers
 *
 * Utilities for React Navigation shared element transitions.
 * Works with @react-navigation/native-stack v7+ and react-native-screens.
 *
 * Features:
 * - Screen configuration helpers for native-stack
 * - Shared element ID management
 * - Transition timing configurations
 * - Type-safe navigation integration
 *
 * Usage:
 * ```tsx
 * // In screen options
 * <Stack.Screen
 *   name="Details"
 *   component={DetailsScreen}
 *   options={getSharedElementScreenOptions()}
 * />
 *
 * // In components
 * <View sharedTransitionTag={createSharedElementId('card', itemId)} />
 * ```
 */

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Shared element transition types
 */
export enum SharedElementTransition {
  /** Fade transition (opacity) */
  FADE = 'fade',
  /** Fade with scale */
  FADE_SCALE = 'fade_scale',
  /** Move transition (position) */
  MOVE = 'move',
  /** Cross-fade between elements */
  CROSS_FADE = 'cross_fade',
}

/**
 * Timing configurations for different transition types
 */
export const transitionTimings = {
  /** Quick transitions (200ms) */
  quick: 200,
  /** Standard transitions (300ms) */
  standard: 300,
  /** Smooth transitions (400ms) */
  smooth: 400,
  /** Slow transitions (500ms) */
  slow: 500,
} as const;

/**
 * Create a unique shared element ID
 *
 * @param elementType - Type of element (e.g., 'card', 'image', 'avatar')
 * @param id - Unique identifier for the specific instance
 * @returns Formatted shared element ID
 *
 * @example
 * ```tsx
 * const sharedId = createSharedElementId('card', bill.id);
 * // Returns: "shared_card_bill-123"
 * ```
 */
export const createSharedElementId = (elementType: string, id: string | number): string => {
  return `shared_${elementType}_${id}`;
};

/**
 * Get screen options for shared element transitions
 *
 * @param animation - Animation type (default: 'default')
 * @param duration - Transition duration in ms (default: 300)
 * @returns Native stack navigation options
 *
 * @example
 * ```tsx
 * <Stack.Screen
 *   name="Details"
 *   options={getSharedElementScreenOptions('fade_from_bottom', 400)}
 * />
 * ```
 */
export const getSharedElementScreenOptions = (
  animation: 'default' | 'fade' | 'fade_from_bottom' | 'slide_from_right' | 'slide_from_left' = 'default',
  duration: number = transitionTimings.standard
): NativeStackNavigationOptions => {
  return {
    animation,
    animationDuration: duration,
    // Enable gesture-based navigation
    fullScreenGestureEnabled: true,
  };
};

/**
 * Get modal screen options with slide-up animation
 *
 * @param duration - Transition duration in ms (default: 300)
 * @returns Native stack navigation options
 *
 * @example
 * ```tsx
 * <Stack.Screen
 *   name="AddVasooly"
 *   options={getModalScreenOptions()}
 * />
 * ```
 */
export const getModalScreenOptions = (
  duration: number = transitionTimings.smooth
): NativeStackNavigationOptions => {
  return {
    presentation: 'modal',
    animation: 'fade_from_bottom',
    animationDuration: duration,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  };
};

/**
 * Get card expand transition options
 *
 * Optimized for card-to-detail transitions with shared elements
 *
 * @param duration - Transition duration in ms (default: 400)
 * @returns Native stack navigation options
 */
export const getCardExpandOptions = (
  duration: number = transitionTimings.smooth
): NativeStackNavigationOptions => {
  return {
    animation: 'default',
    animationDuration: duration,
    fullScreenGestureEnabled: true,
  };
};

/**
 * Common shared element IDs for the Vasooly app
 */
export const SharedElementIds = {
  /**
   * Create bill card shared element ID
   */
  billCard: (billId: string) => createSharedElementId('bill_card', billId),

  /**
   * Create karzedaar card shared element ID
   */
  karzedaarCard: (karzedaarId: string) => createSharedElementId('karzedaar_card', karzedaarId),

  /**
   * Create avatar shared element ID
   */
  avatar: (userId: string) => createSharedElementId('avatar', userId),

  /**
   * Create image shared element ID
   */
  image: (imageId: string) => createSharedElementId('image', imageId),

  /**
   * Create balance card shared element ID
   */
  balanceCard: () => createSharedElementId('balance_card', 'main'),
} as const;

/**
 * Helper to check if shared element transitions are supported
 *
 * @returns True if platform supports shared elements
 */
export const isSharedElementSupported = (): boolean => {
  // Native stack with react-native-screens supports shared elements on iOS and Android
  return true;
};

/**
 * Type guard for shared element transition tag
 */
export type SharedElementTag = string;

/**
 * Helper to apply shared element tag to a component
 *
 * @example
 * ```tsx
 * const cardProps = applySharedElementTag(SharedElementIds.billCard(bill.id));
 * <Animated.View {...cardProps}>
 *   <BillCard bill={bill} />
 * </Animated.View>
 * ```
 */
export const applySharedElementTag = (tag: SharedElementTag) => ({
  sharedTransitionTag: tag,
});
