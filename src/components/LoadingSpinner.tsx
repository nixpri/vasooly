/**
 * LoadingSpinner - Animated loading spinner component
 * Provides a smooth rotating spinner for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export interface LoadingSpinnerProps {
  /** Spinner size in pixels (default: 20) */
  size?: number;
  /** Spinner color (default: white) */
  color?: string;
  /** Whether spinner is animating (default: true) */
  isLoading?: boolean;
}

/**
 * Animated loading spinner
 * @example
 * <LoadingSpinner size={24} color="#C2662D" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 20,
  color = '#FFFFFF',
  isLoading = true,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1 // Infinite repeat
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }

    return () => {
      cancelAnimation(rotation);
    };
  }, [isLoading, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.spinner, animatedStyle]}>
        {/* Spinner arc created with border */}
        <View
          style={[
            styles.spinnerArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: Math.max(2, size / 10),
              borderTopColor: color,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerArc: {
    // Border styles applied dynamically
  },
});
