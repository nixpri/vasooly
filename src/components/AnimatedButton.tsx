/**
 * AnimatedButton - TouchableOpacity with built-in press animations and haptic feedback
 * Drop-in replacement for TouchableOpacity with smooth scale/opacity animations
 *
 * Performance optimizations:
 * - Memoized animation handlers
 * - GPU-accelerated transforms
 * - Platform-specific hardware acceleration
 */

import React from 'react';
import { TouchableOpacity, type TouchableOpacityProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useButtonAnimation } from '../hooks/useButtonAnimation';
import { platformHardwareProps } from '../utils/animations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface AnimatedButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** Button style (can be animated) */
  style?: StyleProp<ViewStyle>;
  /** Enable haptic feedback on press (default: false) */
  haptic?: boolean;
  /** Haptic intensity: 'light' | 'medium' | 'heavy' (default: 'light') */
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  /** Children elements */
  children: React.ReactNode;
}

/**
 * Animated button component with press effects and optional haptics
 * @example
 * <AnimatedButton
 *   style={styles.button}
 *   onPress={handlePress}
 *   haptic
 *   hapticIntensity="medium"
 * >
 *   <Text>Press Me</Text>
 * </AnimatedButton>
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  style,
  haptic = false,
  hapticIntensity = 'light',
  onPress,
  onPressIn,
  onPressOut,
  children,
  ...rest
}) => {
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonAnimation({
    haptic,
    hapticIntensity,
  });

  const combinedPressIn = (e: Parameters<NonNullable<TouchableOpacityProps['onPressIn']>>[0]) => {
    handlePressIn();
    onPressIn?.(e);
  };

  const combinedPressOut = (e: Parameters<NonNullable<TouchableOpacityProps['onPressOut']>>[0]) => {
    handlePressOut();
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={combinedPressIn}
      onPressOut={combinedPressOut}
      activeOpacity={1} // Disable default opacity since we handle it
      {...platformHardwareProps}
      {...rest}
    >
      {children}
    </AnimatedTouchable>
  );
};
