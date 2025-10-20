/**
 * OnboardingPagination - Dots indicator for onboarding screens
 *
 * Shows current page position with animated dots
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { tokens } from '@/theme/tokens';

interface OnboardingPaginationProps {
  /** Total number of pages */
  total: number;
  /** Current active page index (0-based) */
  currentIndex: number;
}

export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  total,
  currentIndex,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} index={index} currentIndex={currentIndex} />
      ))}
    </View>
  );
};

interface DotProps {
  index: number;
  currentIndex: number;
}

const Dot: React.FC<DotProps> = ({ index, currentIndex }) => {
  const isActive = index === currentIndex;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive ? 1.2 : 1, tokens.animation.spring.gentle);
    const opacity = withSpring(isActive ? 1 : 0.4, tokens.animation.spring.gentle);
    const width = withSpring(isActive ? 24 : 8, tokens.animation.spring.gentle);

    return {
      transform: [{ scale }],
      opacity,
      width,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        { backgroundColor: tokens.colors.brand.primary },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: tokens.radius.full,
  },
});
