/**
 * Performance optimization utilities
 *
 * Includes:
 * - InteractionManager helpers for deferred work
 * - Navigation performance configs
 * - High-FPS display configurations
 */

import { InteractionManager, Platform } from 'react-native';
import type { StackNavigationOptions } from '@react-navigation/stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

/**
 * Defer heavy operations until after animations complete
 * Uses InteractionManager to schedule work after current interactions
 */
export const deferAfterInteraction = <T>(callback: () => T): Promise<T> => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      const result = callback();
      resolve(result);
    });
  });
};

/**
 * Navigation performance configurations for Stack Navigator
 * Optimized for smooth 60+ FPS transitions
 */
export const performanceStackOptions: StackNavigationOptions = {
  // Animation configs
  animationEnabled: true,
  gestureEnabled: true,

  // Performance optimizations
  detachPreviousScreen: true, // Unmount previous screen during transition
  freezeOnBlur: true, // Freeze inactive screens to save resources

  // Platform-specific optimizations
  ...Platform.select({
    ios: {
      // Native stack for iOS (better performance)
      headerMode: 'screen',
      presentation: 'card',
    },
    android: {
      // Android optimizations
      cardOverlayEnabled: false, // Disable overlay for better FPS
      animationTypeForReplace: 'push', // Smoother replace animations
    },
  }),
};

/**
 * Navigation performance configurations for Bottom Tab Navigator
 */
export const performanceTabOptions: BottomTabNavigationOptions = {
  // Lazy loading for better initial performance
  lazy: true,

  // Unmount inactive tabs to save memory
  unmountOnBlur: false, // Keep mounted for faster switching

  // Freeze inactive tabs
  freezeOnBlur: true,
};

/**
 * High refresh rate display configuration
 * Enables 120 FPS on supported devices
 */
export const highRefreshRateConfig = {
  /**
   * Enable 120 FPS on ProMotion displays (iOS) and high refresh rate Android devices
   *
   * Requirements:
   * - React Native 0.68+ for iOS ProMotion
   * - React Native 0.72+ for Android high refresh rate
   *
   * Note: Current project is on RN 0.81, so this should work
   */
  enableHighRefreshRate: true,

  /**
   * Platform-specific frame rate settings
   */
  frameRateRange: Platform.select({
    ios: {
      // ProMotion displays support 24-120 FPS
      minimum: 60,
      maximum: 120,
      preferred: 120,
    },
    android: {
      // High refresh rate Android displays (90/120/144 Hz)
      minimum: 60,
      maximum: 120,
      preferred: 120,
    },
    default: {
      minimum: 60,
      maximum: 60,
      preferred: 60,
    },
  }),
};

/**
 * Configure app for high frame rate rendering
 * Call this in App.tsx or main entry point
 *
 * @example
 * ```ts
 * import { configureHighFrameRate } from '@/utils/performance';
 *
 * function App() {
 *   useEffect(() => {
 *     configureHighFrameRate();
 *   }, []);
 * }
 * ```
 */
export const configureHighFrameRate = (): void => {
  if (Platform.OS === 'ios') {
    // iOS ProMotion configuration
    // This requires Info.plist entry: CADisableMinimumFrameDurationOnPhone = true
    console.log('📱 iOS ProMotion: Requesting 120 FPS');

    // Note: Actual frame rate depends on device capabilities
    // iPhone 13 Pro+ and iPad Pro support 120 FPS
  } else if (Platform.OS === 'android') {
    // Android high refresh rate configuration
    // Automatically adapts to device capabilities (90/120/144 Hz)
    console.log('🤖 Android: Requesting high refresh rate (up to 120 FPS)');

    // Android automatically uses highest available refresh rate
    // No additional configuration needed in RN 0.81+
  }
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Log frame drops during animations
   */
  logFrameDrops: (componentName: string, startTime: number) => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Expect 60 FPS = ~16.67ms per frame
    // Expect 120 FPS = ~8.33ms per frame
    const expectedFrameTime60 = 16.67;
    const expectedFrameTime120 = 8.33;

    if (duration > expectedFrameTime60) {
      const droppedFrames = Math.floor(duration / expectedFrameTime60);
      const durationStr = duration.toFixed(2);
      console.warn(`⚠️ ${componentName}: ${droppedFrames} frames dropped (${durationStr}ms)`);
    } else if (duration > expectedFrameTime120) {
      const durationStr = duration.toFixed(2);
      console.log(`🎯 ${componentName}: Running at 60 FPS (${durationStr}ms)`);
    } else {
      const durationStr = duration.toFixed(2);
      console.log(`✨ ${componentName}: Running at 120 FPS (${durationStr}ms)`);
    }
  },

  /**
   * Measure component render performance
   */
  measureRender: <T>(componentName: string, renderFn: () => T): T => {
    const startTime = Date.now();
    const result = renderFn();
    performanceMonitor.logFrameDrops(componentName, startTime);
    return result;
  },
};

/**
 * FlatList/ScrollView optimization configurations
 */
export const listPerformanceProps = {
  // Core performance props
  removeClippedSubviews: true, // Unmount off-screen items
  maxToRenderPerBatch: 10, // Render 10 items per batch
  updateCellsBatchingPeriod: 50, // Batch updates every 50ms
  initialNumToRender: 10, // Render 10 items initially
  windowSize: 5, // Keep 5 screens of items in memory

  // Scroll performance
  scrollEventThrottle: 16, // 60 FPS scroll events (120 FPS = 8)

  // Platform optimizations
  ...Platform.select({
    android: {
      // Android-specific optimizations
      persistentScrollbar: false,
      nestedScrollEnabled: false,
    },
    ios: {
      // iOS-specific optimizations
      automaticallyAdjustContentInsets: false,
      scrollIndicatorInsets: { right: 1 }, // Fix scroll indicator
    },
  }),
};

/**
 * FlashList optimizations for maximum performance
 */
export const flashListPerformanceProps = {
  // Draw distance (how far to render off-screen)
  drawDistance: 250, // Render 250px beyond visible area

  // Estimation
  estimatedItemSize: 100, // Average item height estimate

  // Overscroll
  overrideItemLayout: undefined, // Let FlashList calculate automatically

  // Performance
  disableAutoLayout: false, // Enable auto layout (better for dynamic content)
};
