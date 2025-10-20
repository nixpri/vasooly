/**
 * Vasooly Design System Helpers
 *
 * Utility functions for applying design tokens to React Native components.
 *
 * @version 1.0
 * @date 2025-10-20
 */

import { TextStyle, ViewStyle } from 'react-native';
import { tokens } from './tokens';

/**
 * Typography Helper
 *
 * Returns complete typography styles for a given type scale.
 *
 * @example
 * ```tsx
 * <Text style={getTypographyStyle('h1')}>Title</Text>
 * <Text style={getTypographyStyle('body', { color: tokens.colors.text.secondary })}>
 *   Body text
 * </Text>
 * ```
 */
export const getTypographyStyle = (
  variant: keyof typeof tokens.typography,
  overrides?: Partial<TextStyle>
): TextStyle => {
  const baseStyle = tokens.typography[variant];

  // Skip fontFamily key from typography object
  if ('fontFamily' in baseStyle) {
    return overrides || {};
  }

  return {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: baseStyle.fontSize,
    fontWeight: baseStyle.fontWeight,
    lineHeight: baseStyle.lineHeight,
    letterSpacing: baseStyle.letterSpacing,
    ...(overrides || {}),
  };
};

/**
 * Shadow Helper
 *
 * Returns complete shadow/elevation styles for React Native.
 *
 * @example
 * ```tsx
 * <View style={[styles.card, getShadowStyle('md')]}>
 *   Content
 * </View>
 * ```
 */
export const getShadowStyle = (
  variant: keyof typeof tokens.shadows
): ViewStyle => {
  return tokens.shadows[variant];
};

/**
 * Spacing Helper
 *
 * Returns spacing value for consistent layout.
 *
 * @example
 * ```tsx
 * <View style={{ marginTop: getSpacing('lg'), padding: getSpacing('md') }}>
 *   Content
 * </View>
 * ```
 */
export const getSpacing = (variant: keyof typeof tokens.spacing): number => {
  return tokens.spacing[variant];
};

/**
 * Border Radius Helper
 *
 * Returns border radius value.
 *
 * @example
 * ```tsx
 * <View style={{ borderRadius: getRadius('md') }}>
 *   Content
 * </View>
 * ```
 */
export const getRadius = (variant: keyof typeof tokens.radius): number => {
  return tokens.radius[variant];
};

/**
 * Color Helper with Opacity
 *
 * Converts hex color to rgba with specified opacity.
 *
 * @example
 * ```tsx
 * backgroundColor: colorWithOpacity(tokens.colors.brand.primary, 0.5)
 * ```
 */
export const colorWithOpacity = (hexColor: string, opacity: number): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Icon Size Helper
 *
 * Returns icon size value.
 *
 * @example
 * ```tsx
 * <Icon size={getIconSize('md')} />
 * ```
 */
export const getIconSize = (
  variant: keyof typeof tokens.iconSystem.sizes
): number => {
  return tokens.iconSystem.sizes[variant];
};

/**
 * Create Component Token Helper
 *
 * Combines multiple token values into a complete style object.
 *
 * @example
 * ```tsx
 * const cardStyle = createComponentStyle({
 *   backgroundColor: tokens.colors.background.card,
 *   padding: tokens.spacing.lg,
 *   borderRadius: tokens.radius.lg,
 *   ...tokens.shadows.md,
 * });
 * ```
 */
export const createComponentStyle = <T extends ViewStyle | TextStyle>(
  styles: T
): T => {
  return styles;
};
