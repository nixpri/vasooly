# Vasooly Design Guide

**Purpose**: Single source of truth for design system, color palette, and component styling
**Last Updated**: 2025-10-20

---

## Color Palette

### Earthen Color System

Vasooly uses an earthen color palette with Material Design 10-shade scales, creating warmth, trust, and natural appeal.

#### Primary: Terracotta
Warmth, trust, stability, grounded

```
50:  #FDF5F2  // Lightest tint
100: #F9E5DC
200: #F4C9B4
300: #EEAC8C
400: #DC8563
500: #CB6843  // PRIMARY BRAND COLOR
600: #B85A3B
700: #9A4C32
800: #7D3E28
900: #62311F
950: #3E1F13  // Darkest shade
```

#### Accent: Sage/Olive Green
Natural growth, balance, prosperity

```
50:  #F7F8F5
100: #EEF0E9
200: #DCE1D3
300: #C5CDBA
400: #A3AF92
500: #6B7C4A  // PRIMARY ACCENT (Financial Positive)
600: #5A6A3F
700: #4A5633
800: #3C452A
900: #2F3721
950: #1F2416
```

#### Warm Neutrals
```
50:  #FAF9F7  // Base background (warm cream)
100: #F5F3F0
200: #E8E4DF
300: #D0C8BF
400: #B3A79A
500: #8E7F70
600: #6F5F51
700: #564840
800: #4E342E  // Primary text (warm brown)
900: #3E2B26
950: #2B1D18
```

### Semantic Colors

```typescript
brand: {
  primary: '#CB6843',      // Terracotta 500
  primaryLight: '#F4C9B4', // Terracotta 200
  primaryDark: '#9A4C32',  // Terracotta 700
}

financial: {
  positive: '#6B7C4A',       // Sage 500 (paid, settled)
  positiveLight: '#EEF0E9',  // Sage 100 (backgrounds)
  pending: '#E8A637',        // Amber (pending payments)
  negative: '#C74A45',       // Red (errors, debts)
  negativeLight: '#FCECEA',  // Red tint (error backgrounds)
  settled: '#6B7C4A',        // Same as positive (fully settled bills)
}

text: {
  primary: '#4E342E',    // Neutral 800 (warm brown)
  secondary: '#6F5F51',  // Neutral 600
  tertiary: '#8E7F70',   // Neutral 500
  inverse: '#FAF9F7',    // Neutral 50 (on dark backgrounds)
}

background: {
  base: '#FAF9F7',       // Neutral 50 (main bg)
  elevated: '#F5F3F0',   // Neutral 100 (cards, headers)
  subtle: '#E8E4DF',     // Neutral 200 (hover states)
  input: '#F5F3F0',      // Neutral 100 (form inputs)
}

border: {
  light: '#E8E4DF',      // Neutral 200
  default: '#D0C8BF',    // Neutral 300
  medium: '#B3A79A',     // Neutral 400
  subtle: '#E8E4DF',     // Neutral 200
}

error: {
  main: '#C74A45',
  light: '#FCECEA',
}
```

---

## Typography

### Font Family
**Primary**: Inter (via expo-font / @expo-google-fonts/inter)
**Fallback**: System default

### Type Scale
```typescript
display: {
  fontSize: 48,
  lineHeight: 56,
  fontWeight: '700', // Bold
}

h1: {
  fontSize: 32,
  lineHeight: 40,
  fontWeight: '700', // Bold
}

h2: {
  fontSize: 24,
  lineHeight: 32,
  fontWeight: '700', // Bold
}

h3: {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '600', // Semibold
}

bodyLarge: {
  fontSize: 16,
  lineHeight: 24,
  fontWeight: '400', // Regular
}

body: {
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '400', // Regular
}

caption: {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '400', // Regular
}
```

### Font Weights
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

## Spacing System

4px base unit with 8-point grid

```typescript
spacing: {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 12,   // 0.75rem
  lg: 16,   // 1rem
  xl: 20,   // 1.25rem
  '2xl': 24, // 1.5rem
  '3xl': 32, // 2rem
  '4xl': 48, // 3rem
}
```

---

## Border Radius

```typescript
radius: {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
}
```

---

## Component Patterns

### Glass Card (GlassCard.tsx)
- Uses Skia for glass-morphism effects
- Background: Warm cream with 98% opacity
- Border: Subtle earthen border
- Shadow: Soft shadow for depth
- Blur: 8px blur effect

```typescript
<GlassCard style={styles.card} borderRadius={16}>
  <View style={styles.content}>
    {/* Content */}
  </View>
</GlassCard>
```

### Buttons

**Primary Button**:
```typescript
backgroundColor: tokens.colors.brand.primary,
color: tokens.colors.text.inverse,
borderRadius: tokens.radius.md,
padding: { horizontal: 16, vertical: 10 },
```

**Secondary Button**:
```typescript
backgroundColor: tokens.colors.background.subtle,
color: tokens.colors.text.primary,
borderWidth: 1,
borderColor: tokens.colors.border.default,
borderRadius: tokens.radius.md,
```

**Animated Button**: Use `<AnimatedButton>` for press animations and haptics

### Form Inputs
```typescript
backgroundColor: tokens.colors.background.input,
borderWidth: 1,
borderColor: tokens.colors.border.default,
borderRadius: tokens.radius.sm,
color: tokens.colors.text.primary,
placeholderTextColor: tokens.colors.text.tertiary,
padding: { horizontal: 12, vertical: 10 },
```

### Badges

**Settled Badge**:
```typescript
backgroundColor: tokens.colors.financial.positiveLight,
borderWidth: 1,
borderColor: tokens.colors.financial.positive,
color: tokens.colors.financial.positive,
borderRadius: tokens.components.badge.borderRadius, // 12
padding: { horizontal: 8, vertical: 4 },
```

**Status Badge**:
```typescript
// Paid
backgroundColor: tokens.colors.financial.positiveLight,
color: tokens.colors.financial.positive,

// Pending
backgroundColor: tokens.colors.financial.negativeLight,
color: tokens.colors.financial.pending,
```

### Progress Bars
```typescript
progressBackground: {
  height: 4,
  backgroundColor: tokens.colors.border.default,
  borderRadius: 2,
}

progressFill: {
  height: '100%',
  backgroundColor: isSettled
    ? tokens.colors.financial.settled
    : tokens.colors.brand.primary,
  borderRadius: 2,
}
```

---

## Token Usage Guidelines

### When to Use What

**Brand Primary** (`tokens.colors.brand.primary`):
- Primary action buttons
- Active states
- Progress bars (in-progress bills)
- Icons for primary actions
- Links

**Financial Positive** (`tokens.colors.financial.positive`):
- Paid amounts
- Settled bills
- Success states
- Positive financial indicators
- Fully settled progress bars

**Financial Pending** (`tokens.colors.financial.pending`):
- Pending payments
- Warning states
- Amounts due

**Text Hierarchy**:
- `text.primary`: Main content, headers, important text
- `text.secondary`: Supporting text, labels, metadata
- `text.tertiary`: Placeholder text, disabled states
- `text.inverse`: Text on dark backgrounds or primary buttons

**Background Hierarchy**:
- `background.base`: Main app background
- `background.elevated`: Cards, headers, modals
- `background.subtle`: Hover states, inactive tabs
- `background.input`: Form fields, text inputs

**Border Usage**:
- `border.subtle`: Very light borders (dividers)
- `border.light`: Default card borders
- `border.default`: Input field borders
- `border.medium`: Emphasized borders

---

## Animations

### Spring Configs
```typescript
gentle: {
  damping: 20,
  stiffness: 90,
  mass: 1,
}

bouncy: {
  damping: 10,
  stiffness: 100,
  mass: 0.8,
}

snappy: {
  damping: 30,
  stiffness: 200,
  mass: 0.5,
}

smooth: {
  damping: 25,
  stiffness: 120,
  mass: 1,
}
```

### Timing Presets
```typescript
quick: 150ms
standard: 250ms
slow: 400ms
```

### Haptic Feedback
- `light`: Subtle interactions (taps, swipes)
- `medium`: Button presses, toggles
- `heavy`: Important actions (delete, confirm)
- `success`: Successful operations
- `warning`: Warning prompts
- `error`: Error states
- `selection`: Selection changes

---

## Design Principles

1. **Warmth**: Earthen tones create approachable, trustworthy feel
2. **Clarity**: High contrast for readability (WCAG AA compliance)
3. **Consistency**: Use design tokens, never hardcode colors
4. **Performance**: Animations run at 60fps using Reanimated worklets
5. **Accessibility**: Support dynamic text sizing, screen readers, color contrast

---

## Implementation Notes

### Importing Tokens
```typescript
import { tokens } from '@/theme/ThemeProvider';
```

### Never Hardcode
❌ **Wrong**: `backgroundColor: '#CB6843'`
✅ **Right**: `backgroundColor: tokens.colors.brand.primary`

### Glass Effects
Use `<GlassCard>` component (Skia-based) instead of CSS blur for performance.

### Animations
Use `<AnimatedButton>` and Reanimated worklets for 60fps performance.

---

## Migration Checklist

When updating a component to the design system:

- [ ] Replace hardcoded colors with `tokens.colors.*`
- [ ] Update typography to use `tokens.typography.*`
- [ ] Update spacing to use `tokens.spacing.*`
- [ ] Update border radius to use `tokens.radius.*`
- [ ] Replace TouchableOpacity with AnimatedButton for buttons
- [ ] Add haptic feedback for interactive elements
- [ ] Test on both light backgrounds and glass cards
- [ ] Verify accessibility (color contrast, text sizing)

---

## Resources

- **Design Tokens**: `src/theme/tokens.ts`
- **Theme Provider**: `src/theme/ThemeProvider.tsx`
- **Components**: `src/components/`
- **Animations**: `src/utils/animations.ts`
- **Haptics**: `src/hooks/useHaptics.ts`

---

**Status**: ✅ Complete and current
**Version**: 1.0 (production ready)
**Maintained By**: Vasooly Team
