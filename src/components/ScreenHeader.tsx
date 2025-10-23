/**
 * Screen Header Component
 *
 * Reusable header component for consistent screen headers across the app.
 * Provides standardized styling for title, optional subtitle, and optional right-side actions.
 *
 * Features:
 * - Consistent h2 title typography
 * - Optional subtitle support
 * - Optional right-side action buttons
 * - Standard padding and divider styling
 * - Accessible and keyboard-navigation friendly
 *
 * @example
 * ```tsx
 * // Simple header
 * <ScreenHeader title="Profile" />
 *
 * // With subtitle
 * <ScreenHeader title="Activity" subtitle="12 activities" />
 *
 * // With actions
 * <ScreenHeader
 *   title="Friends"
 *   rightActions={
 *     <Pressable onPress={handleAdd}>
 *       <UserPlus size={24} color={tokens.colors.brand.primary} />
 *     </Pressable>
 *   }
 * />
 * ```
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/ThemeProvider';

interface ScreenHeaderProps {
  /**
   * Main header title (always h2 typography)
   */
  title: string;

  /**
   * Optional subtitle text (displayed below title)
   */
  subtitle?: string;

  /**
   * Optional right-side action elements (e.g., IconButton, Pressable)
   */
  rightActions?: React.ReactNode;

  /**
   * Optional accessible label for the header
   */
  accessibilityLabel?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  rightActions,
  accessibilityLabel,
}) => {
  return (
    <View
      style={styles.header}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.headerContent}>
        {/* Title and subtitle container */}
        <View style={styles.textContainer}>
          <Text style={styles.title} accessibilityRole="text">
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} accessibilityRole="text">
              {subtitle}
            </Text>
          )}
        </View>

        {/* Optional right-side actions */}
        {rightActions && <View style={styles.actions}>{rightActions}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 52,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  subtitle: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
  },
});
