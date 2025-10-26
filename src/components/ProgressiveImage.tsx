/**
 * ProgressiveImage - Image component with progressive loading states
 *
 * Features:
 * - Blur placeholder while loading (Medium.com style)
 * - Smooth fade-in animation when image loads
 * - Error state with retry button integration
 * - Optional skeleton loader fallback
 * - Aspect ratio preservation
 * - Accessibility support
 *
 * Uses Reanimated 4 for smooth transitions
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { tokens } from '../theme/tokens';
import { Skeleton } from './SkeletonLoader';
import { RetryButton } from './RetryButton';

interface ProgressiveImageProps {
  /** Image source */
  source: ImageSourcePropType;
  /** Optional blur placeholder source (low-res version) */
  placeholderSource?: ImageSourcePropType;
  /** Image style */
  style?: ImageStyle;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
  /** Border radius */
  borderRadius?: number;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Whether to show skeleton while loading */
  showSkeleton?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  placeholderSource,
  style,
  containerStyle,
  aspectRatio = 16 / 9,
  borderRadius = tokens.radius.md,
  onLoad,
  onError,
  showSkeleton = true,
  accessibilityLabel,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const imageOpacity = useSharedValue(0);
  const placeholderOpacity = useSharedValue(placeholderSource ? 1 : 0);

  const handleLoad = () => {
    setLoading(false);
    setError(false);

    // Fade in main image
    imageOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    // Fade out placeholder
    if (placeholderSource) {
      placeholderOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
    }

    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const handleRetry = () => {
    setRetrying(true);
    setError(false);
    setLoading(true);
    imageOpacity.value = 0;

    // Force re-render to retry image load
    setTimeout(() => {
      setRetrying(false);
    }, 100);
  };

  const imageAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: imageOpacity.value,
    };
  });

  const placeholderAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: placeholderOpacity.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { aspectRatio, borderRadius },
        containerStyle,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {/* Skeleton Loader */}
      {loading && showSkeleton && !placeholderSource && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton
            width="100%"
            height={200}
            borderRadius={borderRadius}
          />
        </View>
      )}

      {/* Blur Placeholder (if provided) */}
      {placeholderSource && (
        <Animated.Image
          source={placeholderSource}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius },
            style,
            placeholderAnimatedStyle,
          ]}
          blurRadius={10}
          resizeMode="cover"
        />
      )}

      {/* Main Image */}
      {!retrying && (
        <Animated.Image
          source={source}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius },
            style,
            imageAnimatedStyle,
          ]}
          onLoad={handleLoad}
          onError={handleError}
          resizeMode="cover"
        />
      )}

      {/* Error State */}
      {error && (
        <View style={[styles.errorContainer, { borderRadius }]}>
          <RetryButton
            onRetry={handleRetry}
            message="Failed to load image"
            size="small"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colors.background.subtle,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.subtle,
    padding: tokens.spacing.md,
  },
});
