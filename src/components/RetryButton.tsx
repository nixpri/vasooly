/**
 * RetryButton - Animated button for error states with retry functionality
 *
 * Features:
 * - Pulse animation to draw attention
 * - Press scale feedback with haptics
 * - Optional icon (RefreshCw from lucide)
 * - Loading state with spinner animation
 * - Configurable error message display
 * - Multiple size variants
 *
 * Uses Reanimated 4 for smooth animations
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { RefreshCw } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { springConfigs } from '../utils/animations';
import * as Haptics from 'expo-haptics';

interface RetryButtonProps {
  /** Callback when retry is pressed */
  onRetry: () => void;
  /** Optional error message to display */
  message?: string;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether button is in loading state */
  loading?: boolean;
  /** Whether to show pulse animation */
  showPulse?: boolean;
  /** Whether haptics are enabled */
  hapticsEnabled?: boolean;
  /** Optional style override */
  style?: ViewStyle;
  /** Optional text style override */
  textStyle?: TextStyle;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  message = 'Something went wrong',
  size = 'medium',
  loading = false,
  showPulse = true,
  hapticsEnabled = true,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pressed = useSharedValue(false);

  useEffect(() => {
    if (showPulse && !loading) {
      // Subtle pulse to draw attention
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [showPulse, loading, pulseScale]);

  useEffect(() => {
    if (loading) {
      // Continuous rotation when loading
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [loading, rotation]);

  const handlePress = () => {
    if (loading) return;

    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onRetry();
  };

  const handlePressIn = () => {
    pressed.value = true;
    scale.value = withSpring(0.95, springConfigs.snappy);
  };

  const handlePressOut = () => {
    pressed.value = false;
    scale.value = withSpring(1, springConfigs.gentle);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { scale: scale.value * (showPulse && !loading ? pulseScale.value : 1) },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View style={[buttonAnimatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        style={[styles.button, sizeStyles.button, loading && styles.buttonLoading]}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        accessibilityHint={message}
        accessibilityState={{ disabled: loading }}
      >
        <Animated.View style={iconAnimatedStyle}>
          <RefreshCw
            size={sizeStyles.iconSize}
            color={tokens.colors.background.card}
            strokeWidth={2}
          />
        </Animated.View>
        <Text style={[styles.text, sizeStyles.text, textStyle]}>
          {loading ? 'Retrying...' : 'Retry'}
        </Text>
      </Pressable>
      {message && !loading && (
        <Text style={[styles.message, sizeStyles.message]}>{message}</Text>
      )}
    </Animated.View>
  );
};

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        button: {
          paddingVertical: tokens.spacing.xs,
          paddingHorizontal: tokens.spacing.sm,
          gap: tokens.spacing.xs,
        },
        iconSize: 16,
        text: {
          ...tokens.typography.caption,
        },
        message: {
          ...tokens.typography.caption,
          marginTop: tokens.spacing.xs,
        },
      };
    case 'large':
      return {
        button: {
          paddingVertical: tokens.spacing.lg,
          paddingHorizontal: tokens.spacing.xl,
          gap: tokens.spacing.md,
        },
        iconSize: 24,
        text: {
          ...tokens.typography.bodyLarge,
        },
        message: {
          ...tokens.typography.body,
          marginTop: tokens.spacing.md,
        },
      };
    case 'medium':
    default:
      return {
        button: {
          paddingVertical: tokens.spacing.md,
          paddingHorizontal: tokens.spacing.lg,
          gap: tokens.spacing.sm,
        },
        iconSize: 20,
        text: {
          ...tokens.typography.body,
        },
        message: {
          ...tokens.typography.body,
          marginTop: tokens.spacing.sm,
        },
      };
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    // Shadow for depth
    shadowColor: tokens.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  text: {
    color: tokens.colors.background.card,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  message: {
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
});
