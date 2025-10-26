/**
 * CustomRefreshControl - Custom pull-to-refresh animation
 *
 * Branded refresh indicator matching Vasooly's design system:
 * - Earthen color palette (terracotta, sage, amber)
 * - Smooth spring animations
 * - Loading spinner with pulse effect
 *
 * Uses Reanimated 3 for 60fps animations
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '../theme/tokens';
import { springConfigs } from '../utils/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CustomRefreshControlProps {
  /** Whether refresh is active */
  refreshing: boolean;
  /** Progress value 0-1 (for pull distance) */
  progress?: number;
}

const SPINNER_SIZE = 40;
const CIRCLE_RADIUS = 16;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  progress = 0,
}) => {
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const strokeProgress = useSharedValue(0);

  // Start animations when refreshing
  React.useEffect(() => {
    if (refreshing) {
      // Rotation animation (continuous)
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      // Pulse animation (continuous)
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.1, springConfigs.gentle),
          withSpring(1, springConfigs.gentle)
        ),
        -1,
        true
      );

      // Stroke dash animation (continuous)
      strokeProgress.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.65, 0, 0.35, 1),
        }),
        -1,
        false
      );
    } else {
      // Reset animations
      rotation.value = withTiming(0, { duration: 200 });
      pulseScale.value = withSpring(1, springConfigs.snappy);
      strokeProgress.value = withTiming(progress, { duration: 200 });
    }
  }, [refreshing, progress, rotation, pulseScale, strokeProgress]);

  const spinnerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: pulseScale.value },
      ],
    };
  });

  const circleProps = useAnimatedProps(() => {
    'worklet';
    const dashOffset = refreshing
      ? CIRCLE_CIRCUMFERENCE * (1 - strokeProgress.value)
      : CIRCLE_CIRCUMFERENCE * (1 - progress);

    return {
      strokeDashoffset: dashOffset,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, spinnerStyle]}>
        <Svg width={SPINNER_SIZE} height={SPINNER_SIZE}>
          {/* Background circle */}
          <Circle
            cx={SPINNER_SIZE / 2}
            cy={SPINNER_SIZE / 2}
            r={CIRCLE_RADIUS}
            stroke={tokens.colors.border.subtle}
            strokeWidth={3}
            fill="none"
          />

          {/* Animated progress circle */}
          <AnimatedCircle
            cx={SPINNER_SIZE / 2}
            cy={SPINNER_SIZE / 2}
            r={CIRCLE_RADIUS}
            stroke={tokens.colors.brand.primary}
            strokeWidth={3}
            fill="none"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            animatedProps={circleProps}
            strokeLinecap="round"
          />
        </Svg>

        {/* Center dot with gradient effect */}
        <View style={styles.centerDot}>
          <View style={[styles.dotInner, { backgroundColor: tokens.colors.sage[500] }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: tokens.radius.full,
  },
});

// Platform-specific refresh control wrapper
export const createRefreshControl = (
  refreshing: boolean,
  onRefresh: () => void,
  enabled: boolean = true
) => {
  if (!enabled) {
    return undefined;
  }

  if (Platform.OS === 'ios') {
    // iOS uses native RefreshControl with custom colors
    const RefreshControl = require('react-native').RefreshControl;
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={tokens.colors.brand.primary}
        colors={[tokens.colors.brand.primary, tokens.colors.sage[500], tokens.colors.amber[500]]}
        progressBackgroundColor={tokens.colors.background.card}
      />
    );
  }

  // Android uses native RefreshControl with custom colors
  const RefreshControl = require('react-native').RefreshControl;
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[tokens.colors.brand.primary, tokens.colors.sage[500], tokens.colors.amber[500]]}
      progressBackgroundColor={tokens.colors.background.card}
      tintColor={tokens.colors.brand.primary}
    />
  );
};
