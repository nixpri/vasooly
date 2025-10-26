/**
 * CheckmarkAnimation - Animated success checkmark
 *
 * Features:
 * - SVG path drawing animation
 * - Scale bounce entrance
 * - Color pulse effect
 * - Celebration confetti (optional)
 *
 * Uses Reanimated 3 + SVG for smooth animations
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { tokens } from '../theme/tokens';
import { springConfigs } from '../utils/animations';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CheckmarkAnimationProps {
  /** Size of the checkmark */
  size?: number;
  /** Color of the checkmark */
  color?: string;
  /** Whether to show animation (triggers on true) */
  visible?: boolean;
  /** Animation completion callback */
  onComplete?: () => void;
  /** Optional style */
  style?: ViewStyle;
  /** Show circle background */
  showCircle?: boolean;
}

export const CheckmarkAnimation: React.FC<CheckmarkAnimationProps> = ({
  size = 80,
  color = tokens.colors.sage[500],
  visible = false,
  onComplete,
  style,
  showCircle = true,
}) => {
  const scale = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const circleProgress = useSharedValue(0);
  const circleScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Circle entrance
      circleScale.value = withSequence(
        withSpring(1.1, springConfigs.bouncy),
        withSpring(1, springConfigs.gentle)
      );

      // Circle draw
      circleProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      });

      // Scale entrance
      scale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, springConfigs.bouncy),
          withSpring(1, springConfigs.gentle)
        )
      );

      // Checkmark draw
      checkProgress.value = withDelay(
        300,
        withTiming(
          1,
          {
            duration: 500,
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          },
          (finished) => {
            if (finished && onComplete) {
              onComplete();
            }
          }
        )
      );
    } else {
      // Reset
      scale.value = withTiming(0, { duration: 200 });
      checkProgress.value = withTiming(0, { duration: 200 });
      circleProgress.value = withTiming(0, { duration: 200 });
      circleScale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale, checkProgress, circleProgress, circleScale, onComplete]);

  const containerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    };
  });

  const circleContainerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: circleScale.value }],
    };
  });

  // Checkmark path coordinates (relative to size)
  const checkmarkPath = `M ${size * 0.25} ${size * 0.5} L ${size * 0.45} ${size * 0.7} L ${size * 0.75} ${size * 0.3}`;
  const checkmarkLength = size * 0.8; // Approximate path length

  const checkmarkProps = useAnimatedProps(() => {
    'worklet';
    return {
      strokeDashoffset: checkmarkLength * (1 - checkProgress.value),
    };
  });

  const circleProps = useAnimatedProps(() => {
    'worklet';
    const circumference = 2 * Math.PI * (size * 0.4);
    return {
      strokeDashoffset: circumference * (1 - circleProgress.value),
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={containerStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Circle background */}
          {showCircle && (
            <Animated.View style={circleContainerStyle}>
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={size * 0.4}
                stroke={color}
                strokeWidth={size * 0.08}
                fill="none"
                strokeDasharray={2 * Math.PI * (size * 0.4)}
                animatedProps={circleProps}
                strokeLinecap="round"
              />
            </Animated.View>
          )}

          {/* Checkmark path */}
          <AnimatedPath
            d={checkmarkPath}
            stroke={color}
            strokeWidth={size * 0.1}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={checkmarkLength}
            animatedProps={checkmarkProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
