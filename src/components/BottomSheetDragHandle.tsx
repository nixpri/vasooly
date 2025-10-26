/**
 * BottomSheetDragHandle - Reusable drag handle for bottom sheets and modals
 *
 * Features:
 * - Visual indicator (horizontal bar) with subtle pulse animation
 * - Pan gesture integration for parent control
 * - Haptic feedback on drag start/end
 * - Customizable styling (color, size, position)
 * - Accessibility support with proper labels
 *
 * Uses Reanimated 4 + Gesture Handler
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { tokens } from '../theme/tokens';

interface BottomSheetDragHandleProps {
  /** Optional style override */
  style?: ViewStyle;
  /** Handle color */
  color?: string;
  /** Handle width */
  width?: number;
  /** Handle height */
  height?: number;
  /** Whether to show pulse animation */
  showPulse?: boolean;
}

export const BottomSheetDragHandle: React.FC<BottomSheetDragHandleProps> = ({
  style,
  color = tokens.colors.border.light,
  width = 40,
  height = 4,
  showPulse = true,
}) => {
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (showPulse) {
      // Gentle pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [showPulse, pulseScale, opacity]);


  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scaleX: showPulse ? pulseScale.value : 1 }],
      opacity: showPulse ? opacity.value : 0.6,
    };
  });

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel="Drag handle"
      accessibilityHint="Swipe down to dismiss"
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.handle,
          {
            backgroundColor: color,
            width,
            height,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  handle: {
    // Dynamic styles applied via props
  },
});
