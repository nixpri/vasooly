# Vasooly Wireframe Specifications

**Purpose**: Text-based wireframe specs for all 12 screens (efficient approach)
**Date**: October 20, 2025
**Status**: Complete wireframe specifications with component composition

---

## Overview

This document provides detailed wireframe specifications for all 12 screens in Vasooly app, leveraging the existing design system (DESIGN_GUIDE.md) and avoiding high-fidelity Figma mockups. Each screen includes:

1. **Screen Purpose** - What problem it solves
2. **Layout Structure** - ASCII wireframe showing component placement
3. **Component Composition** - Which existing components to use
4. **Design Token Mapping** - Colors, typography, spacing from tokens
5. **User Interactions** - Taps, gestures, navigation flows
6. **Empty States** - What to show when no data

---

## Screen 1: Welcome Splash (Onboarding)

### Purpose
First impression establishing Vasooly's value proposition for new users.

### Layout Structure
```
┌───────────────────────────────────┐
│                                   │
│          [LOGO]                   │  ← Vasooly logo (terracotta)
│                                   │
│      [Illustration]               │  ← Friends splitting bill
│    (Warm earthen tones)           │     320px x 240px
│                                   │
│                                   │
│   Split bills, not friendships    │  ← H1, tokens.typography.h1
│                                   │
│  Fair, fast, and drama-free       │  ← Body, tokens.typography.body
│       expense splitting           │
│                                   │
│                                   │
│      [Get Started Button]         │  ← AnimatedButton (primary)
│                                   │
│   Already have account? Log in    │  ← Text button
│                                   │
└───────────────────────────────────┘
```

### Component Composition
- **Container**: GlassCard (full screen, no blur for splash)
- **Logo**: SVG component (24px height)
- **Illustration**: Static SVG/Image (earthen colors)
- **Title**: Text with h1 typography
- **Subtitle**: Text with body typography
- **Primary Button**: AnimatedButton
  - Label: "Get Started"
  - onPress: Navigate to value prop screens
  - Haptic: light
- **Secondary Action**: Pressable text
  - Label: "Already have account? Log in"
  - Style: terracotta color, underline on press

### Design Token Mapping
```typescript
// Colors
backgroundColor: tokens.colors.background.base,       // #FAF9F7 (warm cream)
logoColor: tokens.colors.brand.primary,               // #CB6843 (terracotta)
titleColor: tokens.colors.text.primary,               // #4E342E (warm brown)
subtitleColor: tokens.colors.text.secondary,          // #6F5F51

// Typography
title: tokens.typography.h1,          // 32px, bold, line 40
subtitle: tokens.typography.body,     // 14px, regular, line 20
linkText: tokens.typography.body,     // 14px, medium

// Spacing
screenPadding: tokens.spacing.xl,     // 20px
elementGap: tokens.spacing['2xl'],    // 24px
buttonMarginTop: tokens.spacing['3xl'], // 32px

// Border Radius
illustration: tokens.radius.lg,       // 16px
button: tokens.radius.md,             // 12px
```

### User Interactions
- Tap "Get Started": Slide to Value Prop Screen 1
- Tap "Log in": Modal slide up (future feature)
- Auto-navigation: If returning user → skip to Dashboard

---

## Screen 2-4: Value Proposition Screens (Swipeable)

### Purpose
Educate users on 3 core value props: Fair math, Instant payment, Transparency.

### Layout Structure (All 3 screens)
```
┌───────────────────────────────────┐
│                              [Skip]│ ← Text button (terracotta)
│                                   │
│                                   │
│      [Illustration]               │  ← Unique per screen
│    (Calculator/UPI/Ledger)        │     240px x 240px
│                                   │
│                                   │
│      [Headline]                   │  ← H1, unique per screen
│                                   │
│  [Description text spanning]      │  ← Body, 2-3 lines
│  [multiple lines explaining]      │
│  [the value proposition]          │
│                                   │
│         ● ○ ○                     │  ← Progress dots (1 of 3)
│                                   │
│      [Next Button]                │  ← AnimatedButton
│                                   │
└───────────────────────────────────┘
```

### Screen-Specific Content

**Screen 2: We Handle the Math**
- Illustration: Calculator with checkmarks
- Headline: "We handle the math"
- Description: "Split equally, by percentage, or custom amounts. We'll make sure it's fair."
- Progress: ● ○ ○
- Button: "Next"

**Screen 3: Get Paid Instantly**
- Illustration: Phone with UPI symbol
- Headline: "Get paid instantly"
- Description: "Send payment links via WhatsApp, UPI apps, or any messenger."
- Progress: ○ ● ○
- Button: "Next"

**Screen 4: Everyone Sees Everything**
- Illustration: Transparent ledger
- Headline: "Everyone sees everything"
- Description: "Complete transparency. No confusion, no arguments."
- Progress: ○ ○ ●
- Button: "Start Splitting"

### Component Composition
- **Container**: GlassCard (full screen)
- **Skip Button**: Pressable text
  - Position: Absolute top-right
  - onPress: Navigate to Quick Signup
- **Illustration**: Static SVG/Image
- **Headline**: Text with h1 typography
- **Description**: Text with body typography, centered
- **Progress Dots**: Custom component
  - Active dot: terracotta circle (8px)
  - Inactive: gray circle with 50% opacity
  - Gap: 8px between dots
- **Primary Button**: AnimatedButton
  - Screen 2-3: "Next"
  - Screen 4: "Start Splitting"
  - onPress: Next screen or Quick Signup
  - Haptic: light

### Design Token Mapping
```typescript
// Same as Screen 1, plus:
dotActive: tokens.colors.brand.primary,     // #CB6843
dotInactive: tokens.colors.border.default,  // #D0C8BF
dotSize: 8,
dotGap: tokens.spacing.sm,                  // 8px
```

### User Interactions
- Swipe left: Next screen (gesture + animation)
- Swipe right: Previous screen
- Tap "Skip": Navigate to Quick Signup
- Tap "Next"/"Start Splitting": Navigate forward
- Auto-advance: Optional after 5 seconds

---

## Screen 5: Quick Signup

### Purpose
Fast user onboarding with minimal friction.

### Layout Structure
```
┌───────────────────────────────────┐
│ [←Back]                           │
│                                   │
│   Let's get you started           │  ← H1
│                                   │
│   What should we call you?        │  ← Label (caption)
│   [Name Input____________]        │  ← TextInput
│                                   │
│   Your phone number               │  ← Label
│   [+91 |____________]             │  ← TextInput (phone)
│   We'll send verification code    │  ← Caption (secondary)
│                                   │
│   ☐ Set up Face ID                │  ← Checkbox (optional)
│   (70% faster login)              │  ← Caption
│                                   │
│   🔒 Your data is encrypted       │  ← Trust badge
│       and private                 │     (icon + caption)
│                                   │
│      [Create Account]             │  ← AnimatedButton (primary)
│                                   │
└───────────────────────────────────┘
```

### Component Composition
- **Container**: GlassCard (full screen)
- **Back Button**: Icon button
  - Icon: Arrow left (24px)
  - onPress: Navigate back
  - Haptic: light
- **Title**: Text with h1 typography
- **Labels**: Text with caption typography
- **Name Input**: TextInput
  - Placeholder: "Enter your name"
  - autoFocus: true
  - Validation: 2-50 characters required
- **Phone Input**: TextInput
  - Prefix: "+91" (India default)
  - Placeholder: "Enter phone number"
  - keyboardType: "phone-pad"
  - Validation: 10 digits required
- **Helper Text**: Text with caption (secondary color)
- **Checkbox**: Custom checkbox component
  - Optional (can skip)
  - Saves to settings
- **Trust Badge**: View with icon + text
  - Lock icon: 16px
  - Centered, secondary color
- **Submit Button**: AnimatedButton
  - Label: "Create Account"
  - Disabled until: name valid AND phone valid
  - onPress: Navigate to Dashboard
  - Haptic: medium

### Design Token Mapping
```typescript
// Colors
inputBackground: tokens.colors.background.input,  // #F5F3F0
inputBorder: tokens.colors.border.default,        // #D0C8BF
inputBorderFocus: tokens.colors.brand.primary,    // #CB6843
labelColor: tokens.colors.text.secondary,         // #6F5F51
helperColor: tokens.colors.text.tertiary,         // #8E7F70
trustBadgeIcon: tokens.colors.financial.positive, // #6B7C4A

// Typography
title: tokens.typography.h1,          // 32px, bold
label: tokens.typography.caption,     // 12px, regular
input: tokens.typography.bodyLarge,   // 16px, regular
helper: tokens.typography.caption,    // 12px, regular

// Spacing
screenPadding: tokens.spacing.xl,     // 20px
labelGap: tokens.spacing.xs,          // 4px (label to input)
inputGap: tokens.spacing.lg,          // 16px (between inputs)
sectionGap: tokens.spacing['2xl'],    // 24px

// Border
inputBorderWidth: 1,
inputBorderRadius: tokens.radius.sm,  // 8px
inputPadding: tokens.spacing.md,      // 12px
inputHeight: 52,
```

### User Interactions
- Tap input: Focus + show keyboard
- Type name: Real-time validation (2-50 chars)
- Type phone: Real-time formatting (10 digits)
- Tap checkbox: Toggle biometric setup
- Tap "Create Account":
  - Validate all inputs
  - Show loading spinner
  - Create user account
  - Navigate to Dashboard
  - Haptic: success on completion

### Validation Rules
- **Name**: Required, 2-50 characters, no special chars
- **Phone**: Required, exactly 10 digits
- **Button State**: Disabled if validation fails

---

## Screen 6: Dashboard/Home

### Purpose
Balance overview, quick actions, and recent activity hub.

### Layout Structure
```
┌───────────────────────────────────┐
│ Welcome back, Nikunj         [⚙️] │ ← Header + settings
│ October 20, 2025                  │ ← Date (caption)
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Your Balance (gradient bg)  │   │ ← GlassCard (gradient)
│ │                             │   │
│ │ You're owed    ₹2,450 ↗    │   │ ← Financial positive (green)
│ │ You owe          ₹890 ↘    │   │ ← Financial pending (amber)
│ │                             │   │
│ │ Net Balance                 │   │ ← Caption
│ │ ₹1,560 to collect           │   │ ← Display (animated count)
│ └─────────────────────────────┘   │
│                                   │
│ Recent Activity                   │ ← H3 section header
│                                   │
│ ┌─────────────────────────────┐   │
│ │ [S] Sarah    ₹450 │ Pending │   │ ← Transaction card
│ │     Dinner   2 hours ago    │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul    ₹800 │ Settled │   │
│ │     Movie    Yesterday      │   │
│ └─────────────────────────────┘   │
│                                   │
│ View All →                        │ ← Text button
│                                   │
│ [Home] [Friends] [+] [Activity] […]│ ← Tab Bar
└───────────────────────────────────┘
```

### Component Composition

**Balance Card (Custom component)**:
- Base: GlassCard with gradient background
- Gradient: Terracotta → Sage (45deg)
- Padding: 24px
- Border radius: 24px
- Shadow: lg + glow effect
- Content:
  - Title: "Your Balance" (caption, 60% opacity)
  - Positive amount: Text with currency style
    - Label: "You're owed"
    - Amount: ₹2,450 (green)
    - Icon: Arrow up-right
  - Negative amount: Text with currency style
    - Label: "You owe"
    - Amount: ₹890 (amber)
    - Icon: Arrow down-right
  - Net balance: Text with display typography
    - Label: "Net Balance"
    - Amount: ₹1,560 (animated counting)
    - Secondary text: "to collect" or "to pay"

**Transaction Cards** (Use existing components):
- Map over recent bills (last 5)
- Each card: GlassCard with:
  - Avatar: Circle (40px) with initials or image
  - Name: H3 typography
  - Amount: Currency style, color-coded
  - Title: Body typography, secondary color
  - Status: Badge component (Pending/Settled)
  - Timestamp: Caption, tertiary color
  - Gap: 12px between elements
  - Touch: Scale animation + navigate to detail
  - Swipe left: Reveal "Settle Up" action

**Section Header**:
- Text: "Recent Activity"
- Typography: h3
- Margin: 24px top, 12px bottom

**View All Link**:
- Pressable text
- Label: "View All →"
- Color: Terracotta
- onPress: Navigate to Activity screen
- Haptic: light

### Design Token Mapping
```typescript
// Balance Card
cardGradient: {
  colors: [
    tokens.colors.brand.primary,      // #CB6843 (terracotta)
    tokens.colors.financial.positive, // #6B7C4A (sage)
  ],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
},
cardPadding: tokens.spacing['2xl'],   // 24px
cardBorderRadius: tokens.radius.xl,    // 24px

// Amount colors
positiveAmount: tokens.colors.financial.positive,  // #6B7C4A (green)
negativeAmount: tokens.colors.financial.pending,   // #E8A637 (amber)
netBalance: tokens.colors.text.inverse,            // #FAF9F7 (white)

// Typography
header: tokens.typography.h1,         // 32px, bold
date: tokens.colors.caption,          // 12px, regular
balanceTitle: tokens.typography.caption,    // 12px
amountLabel: tokens.typography.body,        // 14px
amount: tokens.typography.display,          // 48px, bold
netLabel: tokens.typography.caption,        // 12px
netAmount: tokens.typography.display,       // 48px, bold
sectionHeader: tokens.typography.h3,        // 20px, semibold

// Transaction Card
cardBackground: tokens.colors.background.elevated, // #F5F3F0
cardPadding: tokens.spacing.lg,       // 16px
cardBorderRadius: tokens.radius.lg,   // 16px
cardGap: tokens.spacing.md,           // 12px

avatarSize: 40,
avatarBorderRadius: tokens.radius.full,   // 9999
avatarBorder: tokens.colors.border.light, // #E8E4DF

nameColor: tokens.colors.text.primary,    // #4E342E
titleColor: tokens.colors.text.secondary, // #6F5F51
timeColor: tokens.colors.text.tertiary,   // #8E7F70
amountSize: 16,                           // Medium weight

// Badge
badgePendingBg: tokens.colors.financial.negativeLight,  // #FCECEA
badgePendingText: tokens.colors.financial.pending,      // #E8A637
badgeSettledBg: tokens.colors.financial.positiveLight,  // #EEF0E9
badgeSettledText: tokens.colors.financial.positive,     // #6B7C4A
badgePadding: { horizontal: 8, vertical: 4 },
badgeBorderRadius: tokens.radius.full,    // 9999

// Spacing
screenPadding: tokens.spacing.xl,     // 20px
headerMargin: tokens.spacing.lg,      // 16px bottom
balanceMargin: tokens.spacing['2xl'], // 24px bottom
sectionMargin: tokens.spacing['2xl'], // 24px top
cardMargin: tokens.spacing.md,        // 12px between cards
viewAllMargin: tokens.spacing.lg,     // 16px top
```

### User Interactions
- **Balance Card**:
  - Tap: Navigate to detailed balance breakdown
  - Numbers animate: Counting from 0 to actual value (800ms)
- **Transaction Card**:
  - Tap: Navigate to Expense Detail screen
  - Swipe left: Reveal "Settle Up" action
  - Press action: Open settle up modal
  - Haptic: light on tap, medium on swipe action
- **View All**:
  - Tap: Navigate to Activity screen
  - Haptic: light
- **Settings Icon**:
  - Tap: Navigate to Settings screen
  - Haptic: light
- **Pull to Refresh**:
  - Gesture: Pull down from top
  - Animation: Loading spinner
  - Action: Refresh balance + recent activity
  - Haptic: success on complete

### Empty State
```
┌───────────────────────────────────┐
│                                   │
│      [Empty Wallet SVG]           │  ← 120px x 120px
│    (Terracotta outline)           │
│                                   │
│      No expenses yet              │  ← H2, centered
│   Tap + to add your first one     │  ← Body, secondary
│                                   │
│      [Add Expense]                │  ← Primary button
│                                   │
└───────────────────────────────────┘
```

---

## Screen 7: Add Expense Modal

### Purpose
Primary action for creating and splitting new expenses.

### Layout Structure
```
┌───────────────────────────────────┐
│ [Handle]                    [✕]   │ ← Swipe handle + close
│                                   │
│ Add Expense                       │ ← H2
│                                   │
│ Amount                            │ ← Label (caption)
│ ₹ [_________]                     │ ← BillAmountInput (large)
│                                   │
│ [₹100] [₹500] [₹1K] [₹2K]         │ ← Quick amount buttons
│                                   │
│ What's this for?                  │ ← Label
│ [Dinner at Taj______]             │ ← TextInput (title)
│                                   │
│ Category (optional)               │ ← Label
│ 🍽️ 🚗 🏠 🎬 🛒 📱               │ ← Icon grid (6x2)
│ 💼 🎓 💊 🎁 ❓ ➕              │
│                                   │
│ Split with                        │ ← Label
│ ┌──────────────────────────────┐  │
│ │ [+] Add participants         │  │ ← ParticipantList
│ │ [S] Sarah     [R] Rahul      │  │    (shows added)
│ └──────────────────────────────┘  │
│                                   │
│ Split Method                      │ ← Label
│ ⚫ Split Equally (₹500 each)      │ ← Radio (selected)
│ ⚪ Custom Split                   │ ← Radio
│                                   │
│ [Add Expense]                     │ ← AnimatedButton (bottom)
│                                   │
└───────────────────────────────────┘
```

### Component Composition

**Modal Container**:
- BottomSheet component (slides from bottom)
- Background: GlassCard
- Border radius: 24px (top corners only)
- Padding: 20px
- Handle: 32px x 4px gray pill at top

**Amount Section**:
- Label: "Amount" (caption)
- Input: BillAmountInput (existing component)
  - Font size: 24px, bold
  - Prefix: ₹ symbol (non-editable)
  - Keyboard: numeric
  - Auto-format: Add commas (₹1,00,000)
  - Max: ₹1 crore
- Quick buttons: AnimatedButton array
  - Values: ₹100, ₹500, ₹1,000, ₹2,000
  - Tap: Fill amount instantly
  - Layout: Horizontal scroll or wrap
  - Style: Secondary button, small size

**Title Section**:
- Label: "What's this for?" (caption)
- Input: TextInput
  - Placeholder: "e.g., Dinner, Movie tickets"
  - maxLength: 100
  - Style: Body typography

**Category Section**:
- Label: "Category (optional)" (caption)
- Grid: 6 columns x 2 rows
- Each item:
  - Icon + label (emoji + text)
  - Size: 48px x 48px
  - Tap: Select (terracotta border)
  - Single selection
  - Categories:
    1. 🍽️ Food
    2. 🚗 Transport
    3. 🏠 Housing
    4. 🎬 Entertainment
    5. 🛒 Shopping
    6. 📱 Bills
    7. 💼 Work
    8. 🎓 Education
    9. 💊 Health
    10. 🎁 Gifts
    11. ❓ Other
    12. ➕ Add New

**Participants Section**:
- Label: "Split with" (caption)
- Component: ParticipantList (existing)
  - Shows added participants as chips
  - Each chip: Avatar + name + remove button
  - "+ Add" button to open contact picker
  - Minimum: 2 participants (including self)
  - Validation: Show error if < 2

**Split Method Section**:
- Label: "Split Method" (caption)
- Options: Radio group
  - Option 1: "Split Equally (₹X each)" - default
    - Calculates: total / participant count
    - Updates live as participants change
  - Option 2: "Custom Split"
    - Expands to show input per participant
    - Real-time validation: sum must equal total

**Submit Button**:
- AnimatedButton (primary, full width)
- Label: "Add Expense"
- Disabled until: amount > 0 AND title exists AND participants >= 2
- onPress:
  - Validate all fields
  - Create bill in database
  - Dismiss modal
  - Show success toast
  - Navigate to bill detail OR dashboard
  - Haptic: success

### Design Token Mapping
```typescript
// Modal
modalBackground: tokens.colors.background.elevated, // #F5F3F0
modalBorderRadius: tokens.radius.xl,     // 24px (top only)
modalPadding: tokens.spacing.xl,         // 20px
handleWidth: 32,
handleHeight: 4,
handleColor: tokens.colors.border.default, // #D0C8BF

// Amount input
amountFontSize: 24,
amountFontWeight: '700',
amountColor: tokens.colors.text.primary,
prefixColor: tokens.colors.text.secondary,

// Quick buttons
quickButtonHeight: 36,
quickButtonPadding: { horizontal: 12, vertical: 8 },
quickButtonBorderRadius: tokens.radius.sm,   // 8px
quickButtonBackground: tokens.colors.background.subtle, // #E8E4DF
quickButtonTextColor: tokens.colors.text.primary,
quickButtonGap: tokens.spacing.sm,           // 8px

// Category grid
categorySize: 48,
categoryGap: tokens.spacing.sm,              // 8px
categoryBorderRadius: tokens.radius.sm,      // 8px
categoryBackground: tokens.colors.background.subtle,
categorySelectedBorder: tokens.colors.brand.primary, // #CB6843
categoryBorderWidth: 2,

// Sections
labelMarginBottom: tokens.spacing.xs,        // 4px
sectionGap: tokens.spacing.lg,               // 16px

// Radio buttons
radioSize: 20,
radioSelectedColor: tokens.colors.brand.primary,
radioUnselectedColor: tokens.colors.border.default,
radioLabelColor: tokens.colors.text.primary,
radioGap: tokens.spacing.md,                 // 12px

// Submit button
buttonHeight: 48,
buttonBorderRadius: tokens.radius.md,        // 12px
buttonMarginTop: tokens.spacing['2xl'],      // 24px
```

### User Interactions

**Amount Input**:
- Auto-focus on modal open
- Numeric keyboard
- Quick buttons: Tap to fill instantly
- Live formatting: Add commas as user types
- Validation: Must be > 0 and <= ₹1 crore

**Title Input**:
- Tap to focus
- Character limit: 100
- No special validation (freeform text)

**Category Selection**:
- Tap icon: Select (show terracotta border)
- Tap again: Deselect
- Single selection only
- Optional field

**Participants**:
- Tap "+ Add": Open contact picker modal
- Tap chip: Remove participant (with confirmation)
- Minimum validation: Must have >= 2 total
- Self is always included

**Split Method**:
- Tap radio: Switch method
- If "Equal": Auto-calculate and show per-person amount
- If "Custom": Expand inline inputs
  - Show input for each participant
  - Real-time validation: Sum must equal total
  - Show remaining amount
  - Highlight error if mismatch

**Submit**:
- Disabled state: Gray, 50% opacity, no haptic
- Enabled: Full color, press animation
- On submit:
  1. Validate all fields
  2. Show loading spinner on button
  3. Create bill in database
  4. Celebration animation (brief scale + rotate)
  5. Dismiss modal (slide down)
  6. Show toast: "Expense added! Time to get paid 💸"
  7. Navigate to dashboard OR bill detail
  8. Haptic: success

### Validation Rules
- **Amount**: Required, > 0, <= ₹1 crore
- **Title**: Required, 1-100 characters
- **Category**: Optional
- **Participants**: Required, >= 2 total (including self)
- **Split**: Must sum to total amount if custom

### Empty State
Not applicable (modal always has controls).

---

## Screen 8: Friends List

### Purpose
Manage people you split expenses with, view balances.

### Layout Structure
```
┌───────────────────────────────────┐
│ Friends                      [+]  │ ← Header + add button
│                                   │
│ [Search friends...]               │ ← Search input
│                                   │
│ You're Owed (3)                   │ ← Section header
│ ┌─────────────────────────────┐   │
│ │ [S] Sarah        ₹450 →     │   │ ← Friend card (green)
│ │     3 expenses              │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [A] Amit        ₹1,200 →    │   │
│ │     5 expenses              │   │
│ └─────────────────────────────┘   │
│                                   │
│ You Owe (2)                       │ ← Section header
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul        ₹890 →     │   │ ← Friend card (amber)
│ │     2 expenses              │   │
│ └─────────────────────────────┘   │
│                                   │
│ Settled (8) ▼                     │ ← Collapsible section
│                                   │
│ [Home] [Friends] [+] [Activity] […]│ ← Tab Bar
└───────────────────────────────────┘
```

### Component Composition

**Search Input**:
- TextInput with search icon (left)
- Placeholder: "Search friends..."
- Border radius: full (pill shape)
- Background: Subtle gray
- Clear button (X) when text entered
- Debounced search: 300ms delay
- Filters friend list live

**Section Headers**:
- Text: "You're Owed (3)" / "You Owe (2)" / "Settled (8)"
- Count in parentheses
- Typography: H3, semibold
- Color: Primary text
- Margin: 24px top, 12px bottom

**Friend Cards** (Custom component based on GlassCard):
- Container: GlassCard
- Layout: Horizontal
  - Avatar (left): 48px circle
  - Content (center): Name + expense count
  - Amount (right): Balance + arrow
- Avatar:
  - Size: 48px
  - Border radius: full
  - Fallback: Initials on colored background
- Name:
  - Typography: Body large, semibold
  - Color: Primary text
- Expense Count:
  - Typography: Caption
  - Color: Secondary text
  - Format: "X expenses" or "X expense"
- Balance:
  - Typography: Body large, medium
  - Color: Positive (green) OR Pending (amber) OR gray (settled)
  - Format: ₹X,XXX
- Arrow:
  - Icon: Arrow right (16px)
  - Color: Secondary text

**Settled Section**:
- Collapsible (starts collapsed)
- Tap header: Expand/collapse
- Indicator: ▼ (down) or ▶ (right)
- Content: Same friend cards but gray amounts

### Design Token Mapping
```typescript
// Search Input
searchBackground: tokens.colors.background.subtle, // #E8E4DF
searchBorder: tokens.colors.border.light,         // #E8E4DF
searchBorderRadius: tokens.radius.full,           // 9999
searchPadding: { horizontal: 16, vertical: 10 },
searchIconSize: 20,
searchIconColor: tokens.colors.text.tertiary,

// Section Headers
sectionColor: tokens.colors.text.primary,
sectionTypography: tokens.typography.h3,          // 20px, semibold
sectionMargin: { top: 24, bottom: 12 },

// Friend Card
cardBackground: tokens.colors.background.elevated, // #F5F3F0
cardPadding: tokens.spacing.lg,                   // 16px
cardBorderRadius: tokens.radius.lg,               // 16px
cardMargin: tokens.spacing.md,                    // 12px between cards
cardGap: tokens.spacing.md,                       // 12px internal gap

avatarSize: 48,
avatarBorderRadius: tokens.radius.full,
avatarBorder: tokens.colors.border.light,

nameTypography: tokens.typography.bodyLarge,      // 16px, regular
nameColor: tokens.colors.text.primary,
countTypography: tokens.typography.caption,       // 12px
countColor: tokens.colors.text.secondary,

balanceTypography: tokens.typography.bodyLarge,   // 16px, medium
balancePositive: tokens.colors.financial.positive, // #6B7C4A (green)
balanceNegative: tokens.colors.financial.pending,  // #E8A637 (amber)
balanceSettled: tokens.colors.text.tertiary,       // #8E7F70 (gray)

arrowSize: 16,
arrowColor: tokens.colors.text.secondary,

// Add Button (Header)
addButtonSize: 44,
addButtonColor: tokens.colors.brand.primary,
```

### User Interactions

**Search**:
- Tap: Focus input + show keyboard
- Type: Live filter (debounced 300ms)
- Clear (X): Reset filter + hide keyboard
- No results: Show "No matches. Try different keywords?"

**Friend Card**:
- Tap: Navigate to Friend Detail screen
- Press animation: Scale 0.98
- Haptic: light

**Section Header** (Settled):
- Tap: Toggle expand/collapse
- Animation: Smooth slide down/up
- Icon rotates: ▼ ↔ ▶
- Haptic: light

**Add Button** (+):
- Tap: Open Add Friend modal
- Haptic: medium

**Pull to Refresh**:
- Gesture: Pull down
- Action: Refresh friend balances
- Animation: Loading spinner
- Haptic: success on complete

### Empty State
```
┌───────────────────────────────────┐
│                                   │
│   [People Connecting SVG]         │  ← 120px x 120px
│   (Terracotta + sage)             │
│                                   │
│      No friends added             │  ← H2, centered
│   Add friends to start splitting  │  ← Body, secondary
│                                   │
│      [Add Friend]                 │  ← Primary button
│                                   │
└───────────────────────────────────┘
```

**Component**: Empty state container with:
- Illustration (SVG)
- Headline (H2)
- Description (Body)
- CTA button (AnimatedButton)

---

## Screen 9: Activity Feed

### Purpose
Complete transaction history with search, filter, and navigation.

### Layout Structure
```
┌───────────────────────────────────┐
│ Activity                    [🔍]  │ ← Header + search icon
│                                   │
│ [All] [Pending] [Settled]         │ ← Filter tabs
│                                   │
│ Today                             │ ← Date section
│ ┌─────────────────────────────┐   │
│ │ [S] Sarah    ₹450 │ Pending  │   │ ← Transaction card
│ │     Dinner   2 hours ago     │   │
│ └─────────────────────────────┘   │
│                                   │
│ Yesterday                         │
│ ┌─────────────────────────────┐   │
│ │ [R] Rahul    ₹800 │ Settled  │   │
│ │     Movie    Yesterday       │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [A] Amit     ₹600 │ Pending  │   │
│ │     Lunch    Yesterday       │   │
│ └─────────────────────────────┘   │
│                                   │
│ This Week                         │
│ [Load more...]                    │ ← Load more button
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

### Component Composition

**Filter Tabs**:
- Horizontal scroll view (3 tabs)
- Tabs: "All", "Pending", "Settled"
- Active tab:
  - Background: Terracotta
  - Text: White
  - Border radius: 20px (pill)
- Inactive tab:
  - Background: Subtle gray
  - Text: Primary
  - Border radius: 20px
- Padding: Horizontal 16px, Vertical 8px
- Gap: 8px between tabs
- Tap: Filter list, animate tab indicator
- Haptic: selection

**Date Sections**:
- Group transactions by date
- Headers: "Today", "Yesterday", "This Week", "This Month", "Earlier"
- Typography: H3, semibold
- Color: Primary text
- Sticky headers: Remain visible while scrolling

**Transaction Cards**:
- Same as Dashboard (reuse component)
- GlassCard base
- Avatar + Name + Amount + Title + Status + Time
- Tap: Navigate to Expense Detail
- Swipe left: Reveal "Settle Up" action (if pending)
- Haptic: light on tap, medium on swipe

**Load More**:
- Button at bottom of list
- Loads next 20 transactions
- Shows loading spinner while fetching
- Hides when all loaded

**Search Icon** (Header):
- Icon button (24px)
- Tap: Expand to search bar
- Haptic: light

**Search Expanded**:
```
┌───────────────────────────────────┐
│ [←] [Search expenses...]    [✕]  │
│                                   │
│ Recent Searches                   │
│ • Dinner                          │
│ • Movie                           │
│                                   │
│ [Search results appear here]      │
└───────────────────────────────────┘
```

### Design Token Mapping
```typescript
// Filter Tabs
tabActiveBackground: tokens.colors.brand.primary,  // #CB6843
tabActiveText: tokens.colors.text.inverse,         // #FAF9F7
tabInactiveBackground: tokens.colors.background.subtle, // #E8E4DF
tabInactiveText: tokens.colors.text.primary,       // #4E342E
tabBorderRadius: tokens.radius.full,               // 9999
tabPadding: { horizontal: 16, vertical: 8 },
tabGap: tokens.spacing.sm,                         // 8px
tabHeight: 36,

// Date Headers
dateTypography: tokens.typography.h3,              // 20px, semibold
dateColor: tokens.colors.text.primary,
dateMargin: { top: 24, bottom: 12 },
dateStickyOffset: 0,                               // Stick to top

// Transaction Cards (same as Dashboard)
// ... (reuse Dashboard card tokens)

// Load More Button
loadMoreBackground: tokens.colors.background.subtle,
loadMoreText: tokens.colors.brand.primary,
loadMoreBorderRadius: tokens.radius.md,
loadMorePadding: { horizontal: 24, vertical: 12 },
loadMoreMargin: { top: 16, bottom: 16 },

// Search
searchIconSize: 24,
searchIconColor: tokens.colors.text.secondary,
```

### User Interactions

**Filter Tabs**:
- Tap tab: Filter list + animate active indicator
- All: Show all transactions
- Pending: Show only unsettled bills
- Settled: Show only completed payments
- Haptic: selection

**Transaction Card**:
- Tap: Navigate to Expense Detail
- Swipe left (Pending only): Reveal "Settle Up"
- Tap "Settle Up": Open settle up modal
- Haptic: light on tap, medium on swipe action

**Search Icon**:
- Tap: Expand to full search bar
- Animation: Header slides left, search expands
- Auto-focus: Input gets focus

**Search Input**:
- Type: Live search (debounced 300ms)
- Search fields: Title, participant names, category
- Show recent searches (last 5)
- Clear: Tap X or back arrow
- No results: "No matches. Try different keywords?"

**Load More**:
- Tap: Load next 20 transactions
- Loading: Show spinner in button
- Complete: Hide button if no more data

**Pull to Refresh**:
- Gesture: Pull down from top
- Action: Refresh transaction list
- Animation: Loading spinner
- Haptic: success on complete

### Empty State (All Transactions)
```
┌───────────────────────────────────┐
│                                   │
│   [Calendar + Checkmark SVG]      │  ← 120px x 120px
│                                   │
│      All caught up!               │  ← H2, centered
│   No pending expenses             │  ← Body, secondary
│                                   │
└───────────────────────────────────┘
```

### Empty State (Search)
```
┌───────────────────────────────────┐
│                                   │
│   [Magnifying Glass SVG]          │  ← 80px x 80px
│                                   │
│    No matches found               │  ← H3, centered
│   Try different keywords?         │  ← Body, secondary
│                                   │
└───────────────────────────────────┘
```

---

## Screen 10: Bill Detail (Expense Detail)

### Purpose
Full breakdown of a specific expense with payment tracking.

### Layout Structure
```
┌───────────────────────────────────┐
│ [←]                         [...] │ ← Back + actions menu
│                                   │
│ 🍽️ Dinner at Taj                 │ ← Category emoji + title (H1)
│ ₹1,500                            │ ← Total amount (Display)
│ January 20, 2025                  │ ← Date (Caption)
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Split 3 ways                 │   │ ← Split summary card
│ │ ━━━━━━━━━━━━━━━━━ 66%       │   │    (Animated progress bar)
│ │                              │   │
│ │ [S] Sarah      ₹500 Pending  │   │ ← Each participant
│ │ [R] Rahul      ₹500 Pending  │   │    with status
│ │ [Y] You        ₹500 Paid ✓   │   │    (Green checkmark)
│ └─────────────────────────────┘   │
│                                   │
│ Receipt                           │ ← Section (if uploaded)
│ [📸 Image thumbnail]              │
│                                   │
│ Notes                             │ ← Section (if added)
│ "Great food, must return!"        │
│                                   │
│ [Settle Up]                       │ ← Primary action (if pending)
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

### Component Composition

**Header Section**:
- Back button: Icon (arrow left, 24px)
- Title: Category emoji + bill title
  - Typography: H1
  - Format: "[emoji] [title]"
  - Color: Primary text
- Amount: Total amount
  - Typography: Display (48px, bold)
  - Color: Primary text
  - Format: ₹X,XXX
- Date: Creation date
  - Typography: Caption
  - Color: Secondary text
  - Format: "January 20, 2025"

**Actions Menu** (...):
- Icon button (24px, three dots)
- Tap: Show action sheet
- Options:
  - Edit expense (if creator)
  - Delete expense (if creator, with confirmation)
  - Duplicate expense
  - Share details (export as text)
- Haptic: light

**Split Summary Card**:
- Container: GlassCard
- Progress Bar:
  - Track: Gray background (4px height)
  - Fill: Gradient terracotta → green based on % settled
  - Width: % paid / total * 100
  - Animation: Smooth spring on update
  - Text: "Split X ways" + percentage
- Participant List:
  - Each row: Avatar + Name + Amount + Status
  - Avatar: 40px circle
  - Name: Body typography
  - Amount: Currency style (₹500)
  - Status: Badge (Pending/Paid)
    - Pending: Amber background, amber text
    - Paid: Green background, green text, checkmark icon
  - Gap: 12px between rows
  - Tap row: Open settle up for that participant

**Receipt Section** (Optional):
- Show if bill has receipt image
- Thumbnail: 100px x 100px
- Border radius: 8px
- Tap: Full screen image viewer
- Haptic: light

**Notes Section** (Optional):
- Show if bill has notes
- Text: Body typography
- Color: Secondary text
- Max height: 100px (scroll if longer)

**Settle Up Button**:
- AnimatedButton (primary, full width)
- Show only if: Current user has pending payments
- Label: "Settle Up"
- onPress: Open Settle Up modal
- Haptic: medium

### Design Token Mapping
```typescript
// Header
titleTypography: tokens.typography.h1,        // 32px, bold
titleColor: tokens.colors.text.primary,
amountTypography: tokens.typography.display,  // 48px, bold
amountColor: tokens.colors.text.primary,
dateTypography: tokens.typography.caption,    // 12px, regular
dateColor: tokens.colors.text.secondary,
headerGap: tokens.spacing.xs,                 // 4px

// Split Summary Card
cardBackground: tokens.colors.background.elevated,
cardPadding: tokens.spacing.lg,               // 16px
cardBorderRadius: tokens.radius.lg,           // 16px
cardMargin: { top: 24, bottom: 24 },

// Progress Bar
progressHeight: 4,
progressTrack: tokens.colors.border.default,  // #D0C8BF
progressFill: {
  colors: [
    tokens.colors.brand.primary,              // #CB6843 (terracotta)
    tokens.colors.financial.positive,         // #6B7C4A (green)
  ],
},
progressBorderRadius: 2,
progressMargin: { bottom: 16 },

// Participant Rows
participantGap: tokens.spacing.md,            // 12px
participantAvatarSize: 40,
participantNameTypography: tokens.typography.body,
participantNameColor: tokens.colors.text.primary,
participantAmountTypography: tokens.typography.bodyLarge,
participantAmountColor: tokens.colors.text.primary,

// Status Badges
badgePendingBg: tokens.colors.financial.negativeLight,
badgePendingText: tokens.colors.financial.pending,
badgePaidBg: tokens.colors.financial.positiveLight,
badgePaidText: tokens.colors.financial.positive,
badgePadding: { horizontal: 8, vertical: 4 },
badgeBorderRadius: tokens.radius.full,
badgeIconSize: 12,

// Receipt/Notes
sectionMargin: { top: 24, bottom: 12 },
sectionLabelTypography: tokens.typography.h3,
sectionLabelColor: tokens.colors.text.primary,
receiptSize: 100,
receiptBorderRadius: tokens.radius.sm,        // 8px
notesTypography: tokens.typography.body,
notesColor: tokens.colors.text.secondary,
notesMaxHeight: 100,

// Settle Button
buttonMarginTop: tokens.spacing['2xl'],       // 24px
```

### User Interactions

**Back Button**:
- Tap: Navigate back to previous screen
- Haptic: light

**Actions Menu**:
- Tap: Show action sheet
- Options:
  - **Edit**: Navigate to Add Expense modal (edit mode)
  - **Delete**: Show confirmation alert → delete bill → navigate back
  - **Duplicate**: Create new bill with same details
  - **Share**: Generate text summary → share via native share sheet
- Haptic: light on tap, medium on destructive actions

**Progress Bar**:
- Visual only (no interaction)
- Updates automatically when payment status changes
- Animation: Smooth spring (400ms)

**Participant Row**:
- Tap: Open Settle Up modal for that participant
- Highlight: Scale 0.98 on press
- Haptic: light

**Settle Up Button**:
- Tap: Open Settle Up modal
- Modal pre-fills: Amount + participant
- Haptic: medium

**Receipt Thumbnail**:
- Tap: Full screen image viewer with pinch-zoom
- Haptic: light

### Celebration Animation
When last participant marks as paid:
- Trigger: All statuses === "PAID"
- Animation sequence:
  1. Progress bar fills to 100% (spring)
  2. Confetti particles emit (25 particles)
  3. Checkmark icon scales + rotates
  4. Success haptic (double tap)
- Duration: 1000ms total
- Confetti colors: Terracotta, sage, amber, cream

---

## Screen 11: Friend Detail

### Purpose
View complete transaction history and balance with a specific friend.

### Layout Structure
```
┌───────────────────────────────────┐
│ [←]                         [...] │ ← Back + actions
│                                   │
│       [S]                         │ ← Large avatar (96px)
│      Sarah                        │ ← Name (H1)
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Balance                      │   │ ← Balance card
│ │                              │   │
│ │ Sarah owes you               │   │ ← Caption
│ │ ₹450                         │   │ ← Display (large, green)
│ │                              │   │
│ │ [Settle Up] [Remind]         │   │ ← Action buttons
│ └─────────────────────────────┘   │
│                                   │
│ History (3 expenses)              │ ← Section header
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Dinner at Taj    ₹450        │   │ ← Expense card
│ │ Jan 20, 2025     Pending     │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ Movie Tickets    ₹400        │   │
│ │ Jan 18, 2025     Settled     │   │
│ └─────────────────────────────┘   │
│                                   │
│ [Home] [Friends] [+] [Activity] […]│
└───────────────────────────────────┘
```

### Component Composition

**Header**:
- Back button: Icon (arrow left)
- Actions menu: Three dots icon
- Avatar: Large circle (96px)
  - Image or initials
  - Border: 2px, subtle
- Name: H1 typography, centered

**Balance Card**:
- Container: GlassCard with gradient background
- Gradient: Terracotta → Sage (45deg)
- Content:
  - Label: "Sarah owes you" OR "You owe Sarah"
  - Amount: Display typography (large, bold)
  - Color: Green (owed to you) OR Amber (you owe)
- Action Buttons: Horizontal row
  - "Settle Up": Primary button
    - onPress: Open Settle Up modal
    - Haptic: medium
  - "Remind": Secondary button
    - onPress: Send WhatsApp/SMS reminder
    - Haptic: light

**History Section**:
- Header: "History (X expenses)"
  - Typography: H3, semibold
  - Count: Total shared expenses
  - Margin: 24px top, 12px bottom
- Expense Cards: List of all shared bills
  - Same as transaction cards
  - Title + Amount (right)
  - Date + Status (bottom)
  - Tap: Navigate to Expense Detail
  - Swipe left: Settle Up action (if pending)
- Load more: If > 20 expenses
- Sort: Most recent first

### Design Token Mapping
```typescript
// Avatar
avatarSize: 96,
avatarBorderRadius: tokens.radius.full,
avatarBorder: tokens.colors.border.light,
avatarBorderWidth: 2,

// Name
nameTypography: tokens.typography.h1,         // 32px, bold
nameColor: tokens.colors.text.primary,
nameMargin: { top: 12, bottom: 24 },

// Balance Card
balanceCardGradient: {
  colors: [
    tokens.colors.brand.primary,              // #CB6843
    tokens.colors.financial.positive,         // #6B7C4A
  ],
},
balanceCardPadding: tokens.spacing['2xl'],    // 24px
balanceCardBorderRadius: tokens.radius.xl,     // 24px

balanceLabelTypography: tokens.typography.caption,
balanceLabelColor: tokens.colors.text.inverse, // White with opacity
balanceAmountTypography: tokens.typography.display, // 48px, bold
balanceAmountPositive: tokens.colors.financial.positive,
balanceAmountNegative: tokens.colors.financial.pending,

// Action Buttons
actionButtonsGap: tokens.spacing.md,          // 12px
actionButtonsMargin: { top: 16 },

// History Section
historyHeaderTypography: tokens.typography.h3,
historyHeaderColor: tokens.colors.text.primary,
historyMargin: { top: 24, bottom: 12 },

// Expense Cards (same as Activity)
// ... (reuse Activity card tokens)
```

### User Interactions

**Back Button**:
- Tap: Navigate back to Friends list
- Haptic: light

**Actions Menu**:
- Tap: Show action sheet
- Options:
  - Edit friend name
  - Delete friend (with confirmation) - removes from list, keeps bills
  - Export history with friend (CSV/PDF)
- Haptic: light

**Balance Card**:
- Visual only (no direct tap)
- Animates when balance updates

**Settle Up Button**:
- Tap: Open Settle Up modal
- Pre-fill: Friend name + total balance
- Haptic: medium

**Remind Button**:
- Tap: Open native share sheet
- Message: "Hey [Name], just a reminder about the ₹[amount] for [bill]!"
- Options: WhatsApp, SMS, etc.
- Haptic: light

**Expense Card**:
- Tap: Navigate to Expense Detail
- Swipe left (Pending): Reveal "Settle Up"
- Haptic: light on tap, medium on swipe

### Empty State (No Shared Expenses)
```
┌───────────────────────────────────┐
│       [S]                         │  ← Avatar
│      Sarah                        │  ← Name
│                                   │
│ ┌─────────────────────────────┐   │
│ │ Balance: ₹0                  │   │ ← Card showing zero
│ └─────────────────────────────┘   │
│                                   │
│   [Receipt Stack SVG]             │  ← 100px x 100px
│                                   │
│    No shared expenses yet         │  ← H3
│   Add an expense to get started   │  ← Body
│                                   │
│      [Add Expense]                │  ← Primary button
│                                   │
└───────────────────────────────────┘
```

---

## Screen 12: Settle Up Modal

### Purpose
Record payment or send payment link for settling bills.

### Layout Structure
```
┌───────────────────────────────────┐
│ [Handle]                    [✕]   │ ← Swipe handle + close
│                                   │
│ Settle Up with Sarah              │ ← H2 (dynamic name)
│                                   │
│ Amount to settle                  │ ← Label
│ ₹450                              │ ← Display (large, prominent)
│                                   │
│ How did you pay?                  │ ← Label
│                                   │
│ ⚪ UPI Payment                     │ ← Radio options
│ ⚪ Bank Transfer                   │
│ ⚫ Cash                            │ ← Selected
│ ⚪ Other                           │
│                                   │
│ [If UPI selected:]                │
│ ┌──────────────────────────────┐  │
│ │ 📱 GPay    📱 PhonePe         │  │ ← UPI app buttons
│ │ 📱 Paytm   📱 Other UPI       │  │
│ └──────────────────────────────┘  │
│                                   │
│ Add note (optional)               │ ← Label
│ [Paid for dinner_____]            │ ← TextInput
│                                   │
│ [Mark as Paid]                    │ ← Primary button
│                                   │
└───────────────────────────────────┘
```

### Component Composition

**Modal Container**:
- BottomSheet (slides from bottom)
- Background: GlassCard
- Border radius: 24px (top only)
- Handle: 32px x 4px pill
- Padding: 20px

**Header**:
- Title: "Settle Up with [Name]"
  - Typography: H2
  - Dynamic: Friend's name
- Close button: X icon (24px, top right)

**Amount Section**:
- Label: "Amount to settle"
- Amount: Display typography
  - Large, bold (48px)
  - Color: Positive (green) if receiving, Pending (amber) if paying
  - Format: ₹X,XXX

**Payment Method**:
- Label: "How did you pay?"
- Radio group (4 options):
  - UPI Payment
  - Bank Transfer
  - Cash
  - Other
- Selected: Terracotta filled circle
- Unselected: Gray outline circle
- Gap: 12px between options

**UPI Apps Section** (Conditional):
- Show only if "UPI Payment" selected
- Grid: 2 columns x 2 rows
- Each button:
  - Icon: App logo (48px)
  - Label: App name
  - Background: Subtle gray
  - Border radius: 12px
  - Tap: Open UPI deep link + mark as paid
  - Haptic: medium
- Apps: GPay, PhonePe, Paytm, Other

**Note Input** (Optional):
- Label: "Add note (optional)"
- TextInput:
  - Placeholder: "e.g., Paid for dinner"
  - maxLength: 100
  - multiline: false

**Submit Button**:
- AnimatedButton (primary, full width)
- Label: "Mark as Paid"
- onPress:
  - Update payment status in database
  - Send notification to friend
  - Celebration animation if fully settled
  - Dismiss modal
  - Haptic: success
- Loading state: Spinner in button

### Design Token Mapping
```typescript
// Modal (same as Add Expense)
modalBackground: tokens.colors.background.elevated,
modalBorderRadius: tokens.radius.xl,          // 24px (top only)
modalPadding: tokens.spacing.xl,              // 20px

// Title
titleTypography: tokens.typography.h2,        // 24px, bold
titleColor: tokens.colors.text.primary,

// Amount
amountLabelTypography: tokens.typography.caption,
amountLabelColor: tokens.colors.text.secondary,
amountTypography: tokens.typography.display,  // 48px, bold
amountPositive: tokens.colors.financial.positive,
amountNegative: tokens.colors.financial.pending,

// Radio Group
radioSize: 20,
radioGap: tokens.spacing.md,                  // 12px between options
radioSelected: tokens.colors.brand.primary,
radioUnselected: tokens.colors.border.default,
radioLabelTypography: tokens.typography.body,
radioLabelColor: tokens.colors.text.primary,

// UPI Apps
upiGridGap: tokens.spacing.md,               // 12px
upiButtonSize: 80,
upiButtonBackground: tokens.colors.background.subtle,
upiButtonBorderRadius: tokens.radius.md,     // 12px
upiButtonPadding: tokens.spacing.md,         // 12px
upiIconSize: 48,
upiLabelTypography: tokens.typography.caption,
upiLabelColor: tokens.colors.text.secondary,

// Note Input
noteInputBackground: tokens.colors.background.input,
noteInputBorder: tokens.colors.border.default,
noteInputBorderRadius: tokens.radius.sm,     // 8px
noteInputPadding: tokens.spacing.md,         // 12px
noteInputTypography: tokens.typography.body,

// Submit Button
buttonMarginTop: tokens.spacing['2xl'],      // 24px
```

### User Interactions

**Close Button**:
- Tap: Dismiss modal (slide down)
- Haptic: light

**Payment Method**:
- Tap radio: Select method
- If UPI selected: Show UPI apps section
- If others: Hide UPI apps
- Haptic: selection

**UPI App Button**:
- Tap: Generate UPI deep link + open app
- Deep link format: `upi://pay?pa=[VPA]&pn=[Name]&am=[Amount]&cu=INR&tn=[Note]`
- App opens → User completes payment → Returns to Vasooly
- Auto-mark as paid: When returns from UPI app
- Haptic: medium

**Note Input**:
- Tap: Focus + show keyboard
- Optional field

**Mark as Paid**:
- Disabled: If no payment method selected
- Enabled: After method selected
- On submit:
  1. Validate: Method selected
  2. Update: Payment status to "PAID"
  3. Notify: Send push notification to friend
  4. Check: If bill fully settled → trigger celebration
  5. Dismiss: Modal slides down
  6. Toast: "Payment recorded! ₹[amount] settled with [name]"
  7. Navigate: Back to previous screen (refresh balance)
  8. Haptic: success

### Celebration (If Fully Settled)
Same as Bill Detail celebration:
- Confetti animation (25 particles)
- Checkmark scale + rotate
- Success haptic (double tap)
- Toast: "All settled! 🎉"

---

## Additional Screens (Settings, Insights, Notifications)

Due to space constraints, here are brief wireframe outlines for the remaining screens:

### Screen 13: Settings

**Layout**:
- Profile section (avatar + name + email)
- Settings groups:
  - Account (VPA, phone, biometric)
  - Preferences (haptics, reminders, auto-delete)
  - Notifications (payment alerts, reminders)
  - Privacy (data, permissions)
  - About (version, help, support)
- Sign out button (destructive)

**Components**:
- GlassCard for each setting group
- Toggle switches for boolean settings
- Navigation arrows for sub-screens
- AnimatedButton for sign out

### Screen 14: Spending Insights (NEW)

**Layout**:
- Month selector (dropdown)
- Total expenses card (gradient)
- Category breakdown (pie chart)
- Top categories list
- Spending trend (line chart, last 6 months)
- Frequent friends section
- Export/Share buttons

**Components**:
- Chart components (react-native-chart-kit)
- GlassCard for sections
- Filter tabs for timeframes
- AnimatedButton for actions

**Design Tokens**:
- Chart colors: Earthen palette (terracotta, sage, amber, cream)
- Same spacing, typography as other screens

### Screen 15: Notifications

**Layout**:
- Notification list (grouped by date)
- Each notification:
  - Icon (category-specific)
  - Title + description
  - Timestamp
  - Action button (if applicable)
- Mark all as read button

**Components**:
- GlassCard for each notification
- Badge for unread count
- Swipe to dismiss
- AnimatedButton for actions

---

## Global Design Patterns

### Navigation Patterns

**Tab Navigation** (Bottom bar):
```
[Home] [Friends] [+] [Activity] [Profile]
  🏠     👥      ➕     📊        ⚙️
```

- Active tab: Terracotta fill + white text
- Inactive: Gray outline + secondary text
- Center tab (+): Elevated, larger (56px), terracotta gradient
- Press animations: Scale 0.95
- Haptic: selection on tab change

**Screen Transitions**:
- Tab switch: Crossfade (300ms)
- Push: Slide from right (iOS standard)
- Modal: Slide from bottom (300ms)
- Dismiss: Swipe down or slide down

**Navigation Gestures**:
- Swipe right: Go back (iOS standard)
- Swipe down on modal: Dismiss
- Pull down on screen: Refresh

### Animation Standards

**Button Press**:
- Scale: 1.0 → 0.95
- Opacity: 1.0 → 0.7
- Duration: 150ms
- Spring: gentle config
- Haptic: light

**Loading States**:
- Spinner: Rotating terracotta circle
- Skeleton: Shimmer effect (gray → light gray)
- Progress: Smooth spring animation
- Duration: 250ms standard

**Success Celebrations**:
- Confetti: 25 particles, earthen colors
- Scale: 1.0 → 1.15 → 1.0
- Rotation: 0° → 360°
- Duration: 600ms
- Haptic: success (double tap)

**Number Counting** (Odometer):
- Start: 0
- End: Actual value
- Duration: 800ms
- Easing: easeOut
- Format: Add commas dynamically

### Typography Hierarchy

**Headers**:
1. H1 (Screen titles): 32px, bold, primary color
2. H2 (Modal titles): 24px, bold, primary color
3. H3 (Section headers): 20px, semibold, primary color

**Body Text**:
1. Body Large: 16px, regular, primary color
2. Body: 14px, regular, primary color
3. Caption: 12px, regular, secondary color

**Special**:
1. Display: 48px, bold (balances, large numbers)
2. Currency: 16-18px, medium, tabular numbers

### Color Usage

**Semantic Colors**:
- Primary actions: Terracotta (#CB6843)
- Success/Positive: Sage green (#6B7C4A)
- Pending/Warning: Amber (#E8A637)
- Error: Rose (#C74A45)
- Neutral: Warm grays (#4E342E → #FAF9F7)

**Backgrounds**:
- Base: Warm cream (#FAF9F7)
- Elevated: Lighter cream (#F5F3F0)
- Subtle: Light gray (#E8E4DF)
- Input: Cream (#F5F3F0)

**Borders**:
- Light: #E8E4DF
- Default: #D0C8BF
- Medium: #B3A79A
- Focus: Terracotta (#CB6843)

### Spacing System

**Screen Layout**:
- Screen padding: 20px (xl)
- Section gap: 24px (2xl)
- Card padding: 16px (lg)
- Element gap: 12px (md)

**Component Spacing**:
- Label to input: 4px (xs)
- Input to input: 16px (lg)
- Button to content: 24px (2xl)
- Icon to text: 8px (sm)

### Accessibility

**Touch Targets**:
- Minimum: 44x44px
- Buttons: 48px height
- Icons: 44x44px tap area (even if icon is 24px)

**Color Contrast**:
- Primary text: 4.5:1 ratio (WCAG AA)
- Secondary text: 4.5:1 ratio
- Tertiary text: 3:1 ratio minimum

**Screen Readers**:
- All interactive elements have labels
- Semantic markup (heading, button, link)
- Dynamic content announces changes
- Loading states announce

---

## User Flow Diagrams (Text-Based)

### Flow 1: First-Time User Onboarding
```
App Launch
    ↓
Welcome Splash
    ↓ (Tap "Get Started")
Value Prop Screen 1
    ↓ (Swipe left / Tap "Next")
Value Prop Screen 2
    ↓ (Swipe left / Tap "Next")
Value Prop Screen 3
    ↓ (Tap "Start Splitting")
Quick Signup
    ↓ (Enter name + phone + Create Account)
Dashboard (Empty State)
    ↓
[User Journey Begins]
```

### Flow 2: Add Expense (Core Action)
```
Any Screen
    ↓ (Tap [+] button)
Add Expense Modal (slides up)
    ↓ (Enter amount, title, participants)
Validation Check
    ↓ (If valid)
[Add Expense] Button Enabled
    ↓ (Tap button)
Create Bill in Database
    ↓
Celebration Animation
    ↓
Modal Dismisses
    ↓
Dashboard Refreshes
    ↓
Toast: "Expense added! 💸"
```

### Flow 3: Settle Up
```
Dashboard OR Friend Detail
    ↓ (Tap "Settle Up" OR Swipe transaction card)
Settle Up Modal
    ↓ (Select payment method: UPI/Cash/Bank/Other)
[If UPI]:
    ↓ (Tap UPI app)
    Open UPI App (deep link)
        ↓ (User completes payment)
    Return to Vasooly
        ↓
    Auto-mark as Paid
[If Manual]:
    ↓ (Tap "Mark as Paid")
    Update Payment Status
    ↓
[If Bill Fully Settled]:
    Celebration Animation (confetti)
    ↓
Modal Dismisses
    ↓
Balance Updates
    ↓
Toast: "Payment recorded! ₹[X] settled"
```

### Flow 4: Search Expenses
```
Activity Screen
    ↓ (Tap search icon)
Search Bar Expands
    ↓ (Type query)
Live Filter (debounced 300ms)
    ↓
Results Update Dynamically
    ↓ (Tap result)
Navigate to Expense Detail
    ↓
[User views details]
```

### Flow 5: View Friend History
```
Friends Screen
    ↓ (Tap friend card)
Friend Detail Screen
    ↓
Shows Balance + Transaction History
    ↓ (Tap transaction)
Navigate to Expense Detail
    OR
    ↓ (Tap "Settle Up")
Settle Up Modal
    ↓
[Settle flow begins]
```

---

## Summary & Next Steps

### Wireframe Specs Complete ✅

All 12 screens documented with:
- ✅ Layout structures (ASCII wireframes)
- ✅ Component composition (which components to use)
- ✅ Design token mapping (colors, typography, spacing)
- ✅ User interactions (taps, gestures, animations)
- ✅ Empty states (no data scenarios)
- ✅ User flows (step-by-step navigation)

### Component Reuse Strategy

**Existing Components** (from src/components/):
1. **GlassCard** - All card containers
2. **AnimatedButton** - All buttons (primary, secondary, text, icon)
3. **BillAmountInput** - Amount input in Add Expense
4. **ParticipantList** - Participant management in Add Expense
5. **SplitResultDisplay** - Split calculations display
6. **LoadingSpinner** - All loading states

**New Components Needed**:
1. **BalanceCard** - Gradient card for dashboard balance
2. **TransactionCard** - Reusable card for bills (list item)
3. **FriendCard** - Friend list item with balance
4. **StatusBadge** - Pending/Settled/Paid badges
5. **ProgressBar** - Animated progress indicator
6. **Avatar** - User avatar with fallback initials
7. **EmptyState** - Empty state template (illustration + text + CTA)
8. **SearchInput** - Search bar with clear button
9. **RadioGroup** - Radio button selection
10. **Checkbox** - Checkbox component
11. **BottomSheet** - Modal container (slide from bottom)
12. **TabBar** - Bottom tab navigation
13. **QuickAmountButtons** - Quick amount selection grid

### Implementation Priority

**Phase 1 - Foundation** (Week 1):
1. Create new components (BalanceCard, TransactionCard, StatusBadge, etc.)
2. Set up tab navigation
3. Implement empty states

**Phase 2 - Core Screens** (Week 2):
1. Dashboard/Home (highest priority)
2. Add Expense Modal (core action)
3. Activity Feed (transaction list)

**Phase 3 - Secondary Screens** (Week 3):
1. Friends List + Friend Detail
2. Bill Detail (enhance existing)
3. Settle Up Modal

**Phase 4 - Onboarding** (Week 4):
1. Welcome Splash
2. Value Prop screens (swipeable)
3. Quick Signup

**Phase 5 - Polish** (Week 5):
1. Settings (enhance existing)
2. Spending Insights (new)
3. Notifications
4. Micro-interactions and animations

### Time Saved

By skipping Figma and using this efficient approach:
- **Saved**: 1-2 days (high-fidelity mockups)
- **Gained**: Direct implementation with existing design system
- **Benefit**: Faster iteration, code-first approach

---

**Document Status**: ✅ COMPLETE
**Next Action**: Begin component development (Phase 1)
**Ready For**: Implementation kickoff

