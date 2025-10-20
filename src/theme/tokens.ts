/**
 * Vasooly Design System - Design Tokens
 *
 * Comprehensive design token system for consistent styling across the app.
 * Based on VASOOLY_DESIGN_SYSTEM.md specifications.
 *
 * **Theme**: Light Mode (White UI)
 * **Color Scheme**: Earthen Terracotta + Sage Green + Warm Amber
 *
 * @version 3.1
 * @date 2025-10-21
 */

/**
 * =============================================================================
 * COLOR SYSTEM
 * =============================================================================
 */

export const colors = {
  // Terracotta Primary Scale (Main Brand Color)
  terracotta: {
    50: '#FDF5F0',   // Lightest - Backgrounds, hover states
    100: '#F9E6D8',  // Very light - Subtle backgrounds
    200: '#F0CDB3',  // Light - Cards, containers
    300: '#E5A67D',  // Medium light - Secondary buttons
    400: '#D87B4A',  // Medium - Accents
    500: '#CB6843',  // Base terracotta - PRIMARY COLOR
    600: '#B65538',  // Medium dark - Hover states
    700: '#8F422B',  // Dark - Pressed states
    800: '#6D321F',  // Darker - Text on light backgrounds
    900: '#4D2315',  // Darkest - Emphasis
  },

  // Sage/Olive Secondary Scale (Complementary Brand Color)
  sage: {
    50: '#F5F7F4',   // Lightest - Backgrounds
    100: '#E8EDE5',  // Very light - Subtle backgrounds
    200: '#CED9C7',  // Light - Cards
    300: '#A8BB9A',  // Medium light - Accents
    400: '#8CA479',  // Medium - Secondary elements
    500: '#6B7C4A',  // Base sage/olive - SECONDARY COLOR
    600: '#586539',  // Medium dark - Hover states
    700: '#475029',  // Dark - Pressed states
    800: '#353D1E',  // Darker - Text
    900: '#252A15',  // Darkest - Emphasis
  },

  // Amber Accent Scale (Warm Gold/Honey - Third Brand Color)
  amber: {
    50: '#FFF9E6',   // Lightest - Backgrounds
    100: '#FFF0C2',  // Very light - Hover states, pending backgrounds
    200: '#FFE699',  // Light - Subtle highlights
    300: '#FFD966',  // Medium light - Secondary buttons
    400: '#F4C230',  // Medium - Accents, glow effects
    500: '#E8A637',  // Base amber - ACCENT COLOR (CTAs, pending, warnings)
    600: '#D89020',  // Medium dark - Hover states
    700: '#B87717',  // Dark - Pressed states
    800: '#8F5E12',  // Darker - Text on light
    900: '#66450D',  // Darkest - Emphasis
  },

  // Warm Neutrals (Earthen Grays - NOT cool blue-grays!)
  neutral: {
    50: '#FAF9F7',   // Lightest cream - Page background
    100: '#F5F3F0',  // Very light warm gray - Elevated surfaces
    200: '#E8E4DF',  // Light warm gray - Borders, dividers
    300: '#D7CCC8',  // Medium light - Disabled backgrounds
    400: '#A1887F',  // Medium warm gray - Placeholder text
    500: '#8D6E63',  // Medium dark - Secondary text
    600: '#6D4C41',  // Dark - Primary text
    700: '#5D4037',  // Darker - Headings
    800: '#4E342E',  // Very dark - Emphasis text
    900: '#3E2723',  // Darkest - Maximum contrast
  },

  // Financial Semantics (Earthen-themed)
  financial: {
    positive: '#6B7C4A',      // Sage 500 - Money you receive
    positiveLight: '#E8EDE5', // Sage 100 - Positive backgrounds
    negative: '#D87B4A',      // Terracotta 400 - Money you owe
    negativeLight: '#F9E6D8', // Terracotta 100 - Negative backgrounds
    settled: '#6B7C4A',       // Sage 500 - Fully paid
    pending: '#E8A637',       // Amber 500 - Awaiting payment (NEW: clearer than terracotta)
    pendingLight: '#FFF0C2',  // Amber 100 - Pending backgrounds
  },

  // Feedback Colors (Earthen-adjusted)
  success: {
    light: '#E8EDE5',  // Sage 100 - Earthen green tint
    main: '#6B7C4A',   // Sage 500 - Earthen green (matches settled state)
    dark: '#475029',   // Sage 700 - Darker earthen green
  },

  warning: {
    light: '#FFF0C2',  // Amber 100 - Warm warning background
    main: '#E8A637',   // Amber 500 - Clear warning (distinct from brand)
    dark: '#B87717',   // Amber 700 - Dark warning text
  },

  error: {
    light: '#F8D7DA',  // Light rose background
    main: '#C1554D',   // Earthen red (not bright red)
    dark: '#8B3A34',   // Dark red for text
  },

  info: {
    light: '#E8EDE5',  // Sage 100
    main: '#6B7C4A',   // Sage 500
    dark: '#475029',   // Sage 700
  },

  // Celebration Colors (for success animations, confetti)
  celebration: {
    light: '#FFF0C2',  // Amber 100 - Warm celebratory glow
    main: '#E8A637',   // Amber 500 - Golden celebration
    glow: '#F4C230',   // Amber 400 - Brighter glow for effects
  },

  // Backgrounds (Warm Sand/Cream - NOT pure white)
  background: {
    base: '#FAF9F7',       // Lightest cream (neutral 50) - Main app background
    elevated: '#F5F3F0',   // Very light warm gray (neutral 100) - Cards, modals
    card: '#FFFFFF',       // Pure white - Contrast cards
    input: '#F5F3F0',      // Same as elevated - Input fields
    subtle: '#E8E4DF',     // Light warm gray (neutral 200) - Hover states
  },

  // Text (Warm browns - NOT pure black)
  text: {
    primary: '#4E342E',    // neutral 800 - Main text (warm dark brown)
    secondary: '#8D6E63',  // neutral 500 - Secondary text (medium brown)
    tertiary: '#A1887F',   // neutral 400 - Tertiary text (light brown)
    disabled: '#D7CCC8',   // neutral 300 - Disabled text
    inverse: '#FFFFFF',    // White text on dark backgrounds
  },

  // Borders (Warm tones)
  border: {
    default: '#E8E4DF',    // neutral 200 - Default borders
    light: '#F5F3F0',      // neutral 100 - Very subtle borders
    subtle: '#E8E4DF',     // neutral 200 - Subtle borders (alias for default)
    medium: '#D7CCC8',     // neutral 300 - Medium borders
    dark: '#A1887F',       // neutral 400 - Dark borders
    focus: '#CB6843',      // terracotta 500 - Focus rings
    error: '#C1554D',      // error.main - Error borders
  },

  // Brand shortcuts (for backward compatibility)
  brand: {
    primary: '#CB6843',      // terracotta 500
    primaryLight: '#F0CDB3', // terracotta 200
    primaryDark: '#8F422B',  // terracotta 700
    accent: '#E8A637',       // amber 500 - NEW accent color
    accentLight: '#FFF0C2',  // amber 100 - NEW accent light
    accentDark: '#B87717',   // amber 700 - NEW accent dark
    secondary: '#6B7C4A',    // sage 500
    secondaryLight: '#CED9C7', // sage 200
    secondaryDark: '#475029',  // sage 700
  },

  // Overlay
  overlay: 'rgba(62, 39, 35, 0.5)',  // Warm dark brown overlay (neutral 900 with alpha)
} as const;

/**
 * =============================================================================
 * TYPOGRAPHY SYSTEM
 * =============================================================================
 */

export const typography = {
  // Font Family
  fontFamily: {
    primary: 'Inter',
    fallback: '-apple-system, BlinkMacSystemFont, SF Pro, Roboto, sans-serif',
    full: 'Inter, -apple-system, BlinkMacSystemFont, SF Pro, Roboto, sans-serif',
  },

  // Type Scale
  display: {
    fontSize: 48,
    fontWeight: '700' as const,  // Bold
    lineHeight: 56,
    letterSpacing: -1,           // -1% for optical adjustment
    // Usage: Dashboard balance, major numbers
  },

  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    // Usage: Screen titles, page headers
  },

  h2: {
    fontSize: 24,
    fontWeight: '600' as const,  // Semibold
    lineHeight: 32,
    letterSpacing: 0,
    // Usage: Section headers, card titles
  },

  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
    // Usage: Subsection headers, expense titles
  },

  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,  // Regular
    lineHeight: 24,              // 150% line height
    letterSpacing: 0,
    // Usage: Primary content, descriptions
  },

  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,              // 150%
    letterSpacing: 0,
    // Usage: Secondary content, list items
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,              // 133%
    letterSpacing: 0,
    // Usage: Labels, timestamps, hints
  },

  // Special: Currency/Numbers
  currency: {
    fontSize: 18,
    fontWeight: '500' as const,  // Medium
    lineHeight: 24,
    letterSpacing: 0,
    fontVariant: 'tabular-nums', // Aligned numbers
    // Usage: Transaction amounts
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

/**
 * =============================================================================
 * SPACING SYSTEM (8px Grid)
 * =============================================================================
 */

export const spacing = {
  xs: 4,    // Tight spacing, icon padding
  sm: 8,    // Small gaps, button padding
  md: 12,   // Medium spacing, card padding
  lg: 16,   // Large spacing, section gaps
  xl: 20,   // Extra large, screen padding
  '2xl': 24,  // Major sections
  '3xl': 32,  // Screen-level spacing
  '4xl': 48,  // Hero sections
} as const;

/**
 * Usage Guidelines:
 * - Always use multiples of 4px
 * - Screen padding: 20px (xl)
 * - Card padding: 16px (lg)
 * - Element gaps: 12px (md)
 * - Icon padding: 4px (xs)
 */

/**
 * =============================================================================
 * BORDER RADIUS SYSTEM
 * =============================================================================
 */

export const radius = {
  sm: 8,    // Inputs, small cards
  md: 12,   // Buttons, medium cards
  lg: 16,   // Large cards, modals
  xl: 24,   // Hero cards, special elements
  full: 9999, // Pills, avatars, badges
} as const;

/**
 * =============================================================================
 * SHADOW / ELEVATION SYSTEM
 * =============================================================================
 */

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  // Special: Glow for brand elements
  glow: {
    shadowColor: '#C2662D', // Terracotta
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

/**
 * =============================================================================
 * ICON SYSTEM
 * =============================================================================
 */

export const iconSystem = {
  // Icon Sizes
  sizes: {
    xs: 16,
    sm: 20,
    md: 24,   // Base size
    lg: 32,
    xl: 48,
  },

  // Icon Specifications
  strokeWeight: 2,           // Default stroke width
  cornerRadius: 2,           // Friendly, not harsh
  touchTarget: 44,           // Minimum touch target size (44x44px)

  // Special: Add Button
  addButton: {
    size: 56,                // 56x56px circle
    iconSize: 28,            // Plus icon size
    strokeWeight: 3,         // Thicker stroke for plus
    gradient: {
      start: '#D8814A',      // Lightened Terracotta
      end: '#C2662D',        // Primary Terracotta
    },
    shadow: {
      shadowColor: '#C2662D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
    },
  },
} as const;

/**
 * =============================================================================
 * AVATAR SYSTEM
 * =============================================================================
 */

export const avatarSystem = {
  sizes: {
    small: 24,      // Lists, mentions
    medium: 40,     // Cards, friends
    large: 64,      // Profile, detail screens
    xlarge: 96,     // Profile edit
  },

  border: {
    width: 2,
    color: 'rgba(255, 255, 255, 0.2)',
  },

  // Group Avatar Overlap
  groupOverlap: -8,  // Negative margin for overlapping avatars
} as const;

/**
 * =============================================================================
 * ANIMATION TIMING
 * =============================================================================
 */

export const animation = {
  // Durations (milliseconds)
  duration: {
    instant: 0,       // No animation
    fast: 200,        // Button presses, toggles
    normal: 300,      // Modals, transitions
    slow: 400,        // Page transitions, heavy animations
    counting: 800,    // Number counting animations
    confetti: 600,    // Celebration confetti
  },

  // Spring Configurations (for Reanimated)
  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
    smooth: {
      damping: 30,
      stiffness: 80,
      mass: 1,
    },
  },

  // Animation Values
  values: {
    buttonPress: {
      scale: 0.95,
      opacity: 0.8,
    },
    cardHover: {
      scale: 0.98,
    },
    modalBackdrop: {
      opacity: 0.5,
    },
  },
} as const;

/**
 * =============================================================================
 * COMPONENT TOKENS
 * =============================================================================
 */

export const components = {
  // Button Dimensions
  button: {
    height: {
      sm: 36,
      md: 48,
      lg: 56,
    },
    padding: {
      horizontal: 24,
      vertical: 12,
    },
    borderRadius: radius.md,
  },

  // Input Dimensions
  input: {
    height: 52,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
  },

  // Card Dimensions
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },

  // Modal/Bottom Sheet
  modal: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    handleWidth: 32,
    handleHeight: 4,
  },

  // Status Badge
  badge: {
    padding: {
      horizontal: 8,
      vertical: 4,
    },
    borderRadius: radius.sm,
    height: 24,
  },

  // Transaction Card Dimensions
  transactionCard: {
    height: 72,
    gap: spacing.md,
    borderRadius: radius.lg,
  },
} as const;

/**
 * =============================================================================
 * GRADIENTS
 * =============================================================================
 */

export const gradients = {
  // Balance Card Gradient (Terracotta → Olive)
  balance: {
    colors: [colors.brand.primary, colors.brand.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Add Button Gradient (Legacy - kept for compatibility)
  addButton: {
    colors: ['#D8814A', '#C2662D'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Primary CTA Gradient (Amber → Terracotta) - NEW
  primaryCTA: {
    colors: [colors.amber[500], colors.brand.primary],  // Amber to Terracotta
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    angle: 135,  // Diagonal gradient
  },

  // Celebration Gradient (for success states) - NEW
  celebration: {
    colors: [colors.amber[400], colors.amber[500]],  // Light amber to base
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Tab Bar Glass Background - NEW
  tabBarGlass: {
    colors: ['rgba(232, 166, 55, 0.03)', 'rgba(107, 124, 74, 0.03)'],  // Subtle amber → sage
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Subtle Card Gradient
  subtleCard: {
    colors: ['rgba(194, 102, 45, 0.1)', 'rgba(107, 124, 74, 0.1)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

/**
 * =============================================================================
 * ACCESSIBILITY
 * =============================================================================
 */

export const accessibility = {
  // Minimum Touch Target Size
  minTouchTarget: 44,

  // Minimum Color Contrast (WCAG AA)
  minContrast: 4.5,

  // Reduced Motion
  reducedMotion: {
    duration: 0,  // Disable animations
    enabled: false,
  },
} as const;

/**
 * =============================================================================
 * EXPORTS
 * =============================================================================
 */

/**
 * Complete design token system
 */
export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  iconSystem,
  avatarSystem,
  animation,
  components,
  gradients,
  accessibility,
} as const;

/**
 * Type exports for TypeScript intellisense
 */
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type IconSystem = typeof iconSystem;
export type AvatarSystem = typeof avatarSystem;
export type Animation = typeof animation;
export type Components = typeof components;
export type Gradients = typeof gradients;
export type Tokens = typeof tokens;

export default tokens;
