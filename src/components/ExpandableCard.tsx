/**
 * ExpandableCard - Card component with expand/collapse animation
 *
 * Features:
 * - Buttery smooth height animation using measured content height
 * - Chevron rotation indicator (↓ collapsed, ↑ expanded)
 * - Optional header and expandable content sections
 * - Tap to toggle with haptic feedback
 * - Spring physics for smooth 60fps transitions
 * - GlassCard styling integration
 *
 * Uses Reanimated 4 with proper height measurement
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { springConfigs } from '../utils/animations';
import * as Haptics from 'expo-haptics';

interface ExpandableCardProps {
  /** Card title/header */
  title: string;
  /** Expandable content */
  children: React.ReactNode;
  /** Initially expanded state */
  initialExpanded?: boolean;
  /** Optional style for card */
  style?: ViewStyle;
  /** Optional style for header */
  headerStyle?: ViewStyle;
  /** Optional style for title */
  titleStyle?: TextStyle;
  /** Optional style for content */
  contentStyle?: ViewStyle;
  /** Whether haptics are enabled */
  hapticsEnabled?: boolean;
  /** Callback when expansion state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Optional header right component */
  headerRight?: React.ReactNode;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  children,
  initialExpanded = false,
  style,
  headerStyle,
  titleStyle,
  contentStyle,
  hapticsEnabled = true,
  onExpandChange,
  headerRight,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [contentHeight, setContentHeight] = useState(0);

  const rotation = useSharedValue(initialExpanded ? 180 : 0);
  const progress = useSharedValue(initialExpanded ? 1 : 0);

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);

    // Trigger haptic
    triggerHaptic();

    // Animate chevron rotation
    rotation.value = withSpring(newExpanded ? 180 : 0, springConfigs.snappy);

    // Animate content expand/collapse
    progress.value = withSpring(newExpanded ? 1 : 0, {
      ...springConfigs.smooth,
      overshootClamping: true,
    });

    // Call callback
    onExpandChange?.(newExpanded);
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && contentHeight === 0) {
      setContentHeight(height);
    }
  };

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedHeight = useDerivedValue(() => {
    'worklet';
    return progress.value * contentHeight;
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      height: animatedHeight.value,
      opacity: progress.value,
    };
  });

  return (
    <GlassCard borderRadius={tokens.radius.md} style={style}>
      {/* Header (always visible) */}
      <Pressable
        onPress={handleToggle}
        style={[styles.header, headerStyle]}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${expanded ? 'expanded' : 'collapsed'}`}
        accessibilityHint="Double tap to toggle"
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {headerRight}
          <Animated.View style={chevronAnimatedStyle}>
            <ChevronDown
              size={20}
              color={tokens.colors.text.secondary}
              strokeWidth={2}
            />
          </Animated.View>
        </View>
      </Pressable>

      {/* Expandable Content */}
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <View
          onLayout={handleContentLayout}
          style={[styles.content, contentStyle]}
        >
          {children}
        </View>
      </Animated.View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  title: {
    ...tokens.typography.bodyLarge,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  contentContainer: {
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.md,
  },
});
