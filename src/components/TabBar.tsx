/**
 * TabBar - Custom Bottom Tab Navigation
 *
 * Glass-morphism tab bar with animated active state indicators and haptic feedback.
 * Follows earthen design system with terracotta accent for active tabs.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, ClipboardList, TrendingUp, Users, User } from 'lucide-react-native';
import { tokens } from '@/theme/tokens';

/**
 * Tab Icon Components
 *
 * Lucide React Native icons for professional appearance
 */
const TAB_ICON_COMPONENTS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  Home: Home,
  Activity: ClipboardList,
  Insights: TrendingUp,
  Karzedaars: Users,
  Profile: User,
};

/**
 * Tab Icon Colors
 *
 * Colorful icon scheme for better visual hierarchy
 */
const TAB_ICON_COLORS: Record<string, { active: string; inactive: string }> = {
  Home: {
    active: tokens.colors.amber[600],       // Warm amber for home
    inactive: tokens.colors.amber[300],
  },
  Activity: {
    active: tokens.colors.sage[600],        // Green for activity
    inactive: tokens.colors.sage[300],
  },
  Insights: {
    active: tokens.colors.terracotta[600],  // Terracotta for insights
    inactive: tokens.colors.terracotta[300],
  },
  Karzedaars: {
    active: tokens.colors.brand.primary,    // Terracotta for karzedaars
    inactive: tokens.colors.brand.primaryLight,
  },
  Profile: {
    active: tokens.colors.amber[700],       // Deep amber for profile
    inactive: tokens.colors.amber[300],
  },
};

/**
 * Tab Labels
 */
const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Activity: 'Activity',
  Insights: 'Insights',
  Karzedaars: 'Karzedaars',
  Profile: 'Profile',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabButtonProps {
  route: { key: string; name: string };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * TabButton Component
 *
 * Individual tab button with icon, label, and active state animation.
 */
const TabButton: React.FC<TabButtonProps> = ({ route, isFocused, onPress, onLongPress }) => {
  const IconComponent = TAB_ICON_COMPONENTS[route.name];
  const label = TAB_LABELS[route.name] || route.name;
  const colors = TAB_ICON_COLORS[route.name] || {
    active: tokens.colors.amber[600],
    inactive: tokens.colors.text.tertiary
  };

  // Animated styles for press state
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isFocused ? 1 : 1, tokens.animation.spring.gentle),
      },
    ],
  }));

  // Animated styles for active indicator
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, {
      duration: tokens.animation.duration.normal,
    }),
    transform: [
      {
        scaleX: withSpring(isFocused ? 1 : 0.5, tokens.animation.spring.snappy),
      },
    ],
  }));

  const handlePress = () => {
    if (!isFocused) {
      // Haptic feedback on tab switch
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const iconColor = isFocused ? colors.active : colors.inactive;
  const labelColor = isFocused ? colors.active : tokens.colors.text.tertiary;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={[styles.tabButton, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${label} tab`}
      accessibilityHint={`Navigate to ${label} screen`}
    >
      {/* Active Indicator */}
      <Animated.View style={[styles.activeIndicator, { backgroundColor: colors.active }, indicatorStyle]} />

      {/* Icon */}
      {IconComponent && (
        <IconComponent
          size={24}
          color={iconColor}
          strokeWidth={2}
        />
      )}

      {/* Label */}
      <Text
        style={[
          styles.labelText,
          {
            color: labelColor,
            fontWeight: isFocused ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

/**
 * TabBar Component
 *
 * Custom bottom tab bar with glass-morphism and safe area handling.
 */
export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors: _descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : tokens.spacing.md,
        },
      ]}
    >
      {/* Glass Background (using standard View for now, can enhance with Skia blur) */}
      <View style={styles.glassBackground} />

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.background.elevated,
    opacity: 0.98,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    borderRadius: tokens.radius.sm,
  },
  labelText: {
    ...tokens.typography.caption,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
});
