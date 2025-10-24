/**
 * ChartCard Component
 *
 * Reusable glass-morphism card wrapper for charts in Insights screen.
 * Provides consistent styling and optional tap handling.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { tokens } from '@/theme/tokens';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  height = 280,
  onPress,
  style,
}) => {
  const Content = (
    <View style={[styles.container, { height }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Chart Content */}
      <View style={styles.chartContainer}>{children}</View>
    </View>
  );

  // If onPress provided, wrap in Pressable
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [
        pressed && styles.pressed
      ]}>
        {Content}
      </Pressable>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadows.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  header: {
    marginBottom: tokens.spacing.md,
  },
  title: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
