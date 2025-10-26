/**
 * ModalWithBackdrop - Animated modal with slide-up entrance and backdrop
 *
 * Features:
 * - Slide-up entrance from bottom with spring physics
 * - Backdrop with fade-in/fade-out animation
 * - Pan gesture to dismiss with velocity threshold
 * - Configurable backdrop opacity and blur
 * - Haptic feedback on dismiss
 * - Safe area handling
 *
 * Uses Reanimated 4 + Gesture Handler for smooth 60fps animations
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { springConfigs } from '../utils/animations';
import * as Haptics from 'expo-haptics';

interface ModalWithBackdropProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Optional style for modal container */
  style?: ViewStyle;
  /** Backdrop opacity (0-1) */
  backdropOpacity?: number;
  /** Whether to close on backdrop press */
  closeOnBackdropPress?: boolean;
  /** Whether haptics are enabled */
  hapticsEnabled?: boolean;
  /** Animation presentation style */
  presentationStyle?: ModalProps['presentationStyle'];
}

const DISMISS_THRESHOLD = 150; // Minimum swipe distance to dismiss
const DISMISS_VELOCITY = 500; // Minimum velocity to dismiss

export const ModalWithBackdrop: React.FC<ModalWithBackdropProps> = ({
  visible,
  onClose,
  children,
  style,
  backdropOpacity = 0.5,
  closeOnBackdropPress = true,
  hapticsEnabled = true,
  presentationStyle = 'overFullScreen',
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(1000);
  const backdropOpacityValue = useSharedValue(0);

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      backdropOpacityValue.value = withTiming(backdropOpacity, { duration: 250 });
      translateY.value = withSpring(0, springConfigs.smooth);
    } else {
      // Animate out
      backdropOpacityValue.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(1000, springConfigs.snappy);
    }
  }, [visible, backdropOpacity, backdropOpacityValue, translateY]);

  const handleClose = () => {
    triggerHaptic();
    onClose();
  };

  const gestureHandler = (event: any) => {
    'worklet';
    const { translationY, velocityY, state } = event.nativeEvent;

    if (state === 2) {
      // ACTIVE - only allow downward swipes with clamping
      if (translationY > 0) {
        // Add resistance for over-drag
        const dampening = 1 - Math.min(translationY / 800, 0.5);
        translateY.value = translationY * dampening;
      } else {
        translateY.value = 0;
      }
    } else if (state === 5) {
      // END
      const shouldDismiss =
        translationY > DISMISS_THRESHOLD || velocityY > DISMISS_VELOCITY;

      if (shouldDismiss) {
        // Dismiss
        translateY.value = withSpring(1000, {
          ...springConfigs.snappy,
          overshootClamping: true,
        });
        backdropOpacityValue.value = withTiming(0, { duration: 200 });
        runOnJS(handleClose)();
      } else {
        // Snap back with smooth spring
        translateY.value = withSpring(0, {
          ...springConfigs.smooth,
          overshootClamping: true,
        });
      }
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(
      translateY.value,
      [0, 500],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: backdropOpacityValue.value,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdropPress ? handleClose : undefined}
        >
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </Pressable>

        {/* Modal Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[
                styles.modal,
                {
                  paddingBottom: Math.max(insets.bottom, tokens.spacing.lg),
                },
                modalAnimatedStyle,
                style,
              ]}
            >
              {children}
            </Animated.View>
          </PanGestureHandler>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.text.primary,
  },
  keyboardView: {
    width: '100%',
  },
  modal: {
    backgroundColor: tokens.colors.background.card,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    minHeight: 200,
    maxHeight: '90%',
    // Shadow for elevation
    shadowColor: tokens.colors.text.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
