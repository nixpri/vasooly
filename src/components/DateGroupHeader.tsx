/**
 * DateGroupHeader Component - Sticky date header for timeline grouping
 *
 * Features:
 * - Sticky positioning for scroll
 * - Date grouping labels (Today, Yesterday, This Week, etc.)
 * - Glass-morphism design
 * - Separator line
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/ThemeProvider';

interface DateGroupHeaderProps {
  label: string;
}

export const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({ label }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.background.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
  },
  label: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
