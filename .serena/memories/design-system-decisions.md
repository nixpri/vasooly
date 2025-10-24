# Design System Decisions & Patterns

## Empty State Centering Pattern (NEW - Week 14)

**Problem**: Empty states appearing in lower 60% of screen instead of true center

**Root Cause**: 
- ScreenHeader consumes ~100px at top (paddingTop: 52px + content + paddingBottom: 16px)
- Search/Filters consume additional 50-210px depending on screen
- `flex: 1 + justifyContent: 'center'` centers in REMAINING space after header, not full viewport

**Solution Pattern**:
```typescript
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: tokens.spacing['3xl'],  // NOT padding (adds top/bottom)
  gap: tokens.spacing.md,  // Use gap, NOT marginTop on children
  marginTop: -80,  // Offset to account for header space (~100px)
}

emptyTitle: {
  ...tokens.typography.h2,  // NOT individual properties
  color: tokens.colors.text.primary,
  textAlign: 'center',
  // NO marginTop - gap handles spacing
}

emptyText: {
  ...tokens.typography.body,
  color: tokens.colors.text.secondary,
  textAlign: 'center',
  maxWidth: 280,
  // NO marginTop - gap handles spacing
}
```

**Why marginTop: -80 Works**:
- ScreenHeader = ~100px
- Offset of -80px shifts content up
- Visually centers in full viewport accounting for header
- Consistent across all three screens

**Applied To**:
- ActivityScreen empty state
- InsightsScreen empty state  
- KarzedaarsListScreen empty state

**Critical Rules**:
1. Use `paddingHorizontal`, NEVER `padding` (adds unwanted top/bottom)
2. Use `gap` on container, NEVER `marginTop` on children (causes double spacing)
3. Add `marginTop: -80` to offset header space
4. Children should have NO margin properties

**File**: This pattern documented after Week 14 empty state alignment fix

## Earthen Color Strategy

**Decision**: Replace generic purple theme with earthen color palette (Terracotta + Olive Green)

**Rationale**:
- Differentiate from "typical LLM purple theme"
- Financial apps benefit from warm, trustworthy colors
- Terracotta (#CB6843) conveys warmth, trust, stability
- Olive Green (#6B7C4A) represents natural growth, balance, prosperity

**Implementation**:
- Material Design 10-shade scales (50→950) for both colors
- Warm neutral scale (#FAF9F7 → #4E342E) for backgrounds/text
- All components use `tokens.colors.*` (zero hardcoded colors)
- Semantic color mapping:
  - `brand.primary`: Terracotta 500 (#CB6843)
  - `financial.positive`: Sage 500 (#6B7C4A) for paid/settled
  - `financial.pending`: Amber (#E8A637) for pending payments
  - `financial.negative`: Red (#C74A45) for errors/debts

**Files**:
- `docs/DESIGN_GUIDE.md` (lines 8-106): Complete color system reference
- `src/theme/tokens.ts`: Token implementation

## Illustration System

**Decision**: Line art style with minimal color, friendly personality

**Rationale**:
- Matches earthen color palette (Terracotta + Olive Green)
- Lightweight SVGs for performance
- Friendly, approachable tone for financial app
- Scalable with viewBox for responsive design

**Specifications**:
- **Line colors**: Terracotta 700 (#9A4C32) primary, Terracotta 600 (#B85A3B) accents
- **Fill colors**: Terracotta 200 (#F4C9B4), Olive 100 (#EEF0E9) sparingly
- **Stroke weight**: 2-2.5px with rounded caps/joins
- **Format**: SVG with viewBox (e.g., "0 0 240 240")

**Categories**:
1. Empty States (5): No bills, No friends, No activity, Search results, Offline
2. Onboarding (3 - UPDATED): Bill splitting, Settlement tracking, Friend groups
3. Error States (4): General, Network, Permission denied, Payment failed
4. Celebration (4): First bill, All settled, Friend added, Large settlement

**File**: `claudedocs/ILLUSTRATION_SPECS.md`

**Week 13 Update**: Reduced onboarding from 6 screens to 3 screens, increased size to 340px

## Component Architecture

**Pattern**: Token-driven components with design system consistency

**Migration Strategy**:
1. **Existing Components** (7): Audit and migrate to design tokens
   - GlassCard: ⚠️ Hardcoded rgba colors → tokens.colors.*
   - AnimatedButton: ✅ Already design system ready
2. **New Components** (15 - UPDATED): Build with tokens from start
   - Core: BalanceCard, TransactionCard, FriendCard, StatusBadge, ProgressBar, Avatar, EmptyState
   - Forms/Nav: SearchInput, RadioGroup, Checkbox, BottomSheet, TabBar, QuickAmountButtons
   - Layout: ScreenHeader (NEW), ActivityCard, DateGroupHeader

**Key Patterns**:
- All colors via `tokens.colors.*`
- All spacing via `tokens.spacing.*`
- All typography via `tokens.typography.*`
- All animations via `tokens.animations.*`
- Haptic feedback integrated via `useHaptics` hook

**Week 13 Addition**: ScreenHeader component for consistent headers across all screens

**File**: `claudedocs/COMPONENT_AUDIT.md`

## ScreenHeader Component Pattern (NEW - Week 13)

**Decision**: Create reusable header component for all screens

**Rationale**:
- Eliminate duplicated header code across 7+ screens
- Ensure consistent title typography (h2, not h1)
- Standardize divider positioning and spacing
- Enable optional subtitles and right actions

**Implementation**:
```typescript
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightActions?: React.ReactNode;
  accessibilityLabel?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title, subtitle, rightActions, accessibilityLabel
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightActions && <View style={styles.actions}>{rightActions}</View>}
      </View>
    </View>
  );
};
```

**Design Specs**:
- **Padding**: 52px top, xl (20px) horizontal, lg (16px) bottom
- **Background**: tokens.colors.background.elevated
- **Border**: 1px bottom, tokens.colors.border.subtle
- **Title**: ...tokens.typography.h2, text.primary
- **Subtitle**: ...tokens.typography.body, text.secondary

**Usage Pattern**:
```typescript
<View style={styles.container}>
  <ScreenHeader 
    title="Screen Name" 
    subtitle="Optional description"
    rightActions={<Button />}
  />
  <ScrollView>
    {/* Content */}
  </ScrollView>
</View>
```

**Critical**: ScreenHeader MUST be outside ScrollView to prevent visual artifacts

**File**: `src/components/ScreenHeader.tsx`

## Container Structure Pattern (NEW - Week 13)

**Decision**: Standardize container structure across all screens

**Pattern**:
```typescript
<View style={styles.container}>  {/* flex: 1, backgroundColor */}
  <ScreenHeader title="Title" />
  <ScrollView 
    style={styles.scrollView}  {/* flex: 1 */}
    contentContainerStyle={styles.contentContainer}  {/* padding, spacing */}
  >
    {/* Content */}
  </ScrollView>
</View>
```

**Why This Works**:
1. **View Root**: Establishes layout container with background
2. **ScreenHeader**: Positioned at top, outside scroll area (prevents artifacts)
3. **ScrollView**: Takes remaining flex space, contains scrollable content
4. **contentContainerStyle**: Inner padding and spacing for scroll content

**Wrong Pattern** (causes artifacts):
```typescript
<ScrollView contentContainerStyle={styles.contentContainer}>
  <ScreenHeader title="Title" />  {/* WRONG: Creates visual artifacts */}
  {/* Content */}
</ScrollView>
```

**Why It Fails**: ScreenHeader has elevated background + border. When scrolled, it creates visual artifacts and doesn't stick to top.

**Affected Screens** (all updated Week 13):
- ProfileScreen
- FriendsListScreen
- BillDetailScreen
- SettingsScreen
- ActivityScreen (already correct)
- DashboardScreen (already correct)

## Grid Width Calculation Pattern (NEW - Week 13)

**Decision**: Width calculations MUST match actual padding exactly

**Pattern**:
```typescript
// 1. Import Dimensions
import { Dimensions } from 'react-native';

// 2. Get screen width
const { width: screenWidth } = Dimensions.get('window');

// 3. Calculate card width (MUST match actual padding)
const STAT_CARD_WIDTH = (screenWidth - (actualPadding * 2) - gap) / columns;

// Example for 2-column grid with xl padding (20px):
const STAT_CARD_WIDTH = (screenWidth - (tokens.spacing.xl * 2) - tokens.spacing.md) / 2;
// = (screenWidth - 40px - 12px) / 2
```

**Common Mistake**:
```typescript
// WRONG (causes cards to wrap vertically):
const STAT_CARD_WIDTH = (screenWidth - (tokens.spacing.lg * 2) - tokens.spacing.md) / 2;
// tokens.spacing.lg = 16px, so 32px total (but actual padding is 40px!)
// 8px mismatch makes cards too wide, breaks grid layout
```

**Validation**:
1. Check contentContainer paddingHorizontal value
2. Use same spacing token in width calculation
3. Even 8px mismatch can break layout

**File**: `src/screens/ProfileScreen.tsx` (lines 198-199)

## User Share Exclusion Pattern (NEW - Week 13)

**Decision**: Standardize user context checking across all calculations

**Pattern**:
```typescript
// 1. Helper function (reusable across screens)
const isCurrentUser = (participantName: string): boolean => {
  if (!defaultUPIName) return false;
  return participantName.toLowerCase() === defaultUPIName.toLowerCase();
};

// 2. Use in calculations (exclude user's share)
let totalVasoolyPaise = 0;
bills.forEach((bill) => {
  bill.participants.forEach((participant) => {
    // CRITICAL: Skip current user's share
    if (isCurrentUser(participant.name)) return;
    
    // Add amounts from others only
    totalVasoolyPaise += participant.amountPaise;
  });
});
```

**Why This Matters**:
- **Vasooly Amount** = money owed by OTHERS, not total bill amount
- Including user's share inflates the number incorrectly
- Dashboard and Profile MUST use same logic for consistency

**Application**:
- Dashboard: Calculate pending/received amounts from others
- Profile: Calculate total Vasooly amount
- Analytics: Calculate amounts by user (exclude self)

**Files Using This Pattern**:
- `src/screens/DashboardScreen.tsx` (lines 92-124)
- `src/screens/ProfileScreen.tsx` (lines 35-66)

## Typography Token Spread Pattern (Week 13 Emphasis)

**Decision**: Always use token spreads, never individual properties

**Pattern**:
```typescript
// CORRECT (consistent, maintainable):
title: {
  ...tokens.typography.h2,  // Spreads fontSize, fontWeight, lineHeight, letterSpacing
  color: tokens.colors.text.primary,
}

subtitle: {
  ...tokens.typography.body,
  color: tokens.colors.text.secondary,
}

// WRONG (duplicated, hard to maintain, inconsistent):
title: {
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 32,
  letterSpacing: -0.5,
  color: tokens.colors.text.primary,
}
```

**Why This Works**:
1. **Consistency**: All h2 titles use exact same typography
2. **Maintainability**: Change tokens.typography.h2, updates everywhere
3. **Readability**: Clear semantic meaning (h2 > individual properties)
4. **Type Safety**: TypeScript ensures valid typography tokens

**7-Level Type Scale**:
- Display: 48px / 56 line-height / Bold 700
- H1: 32px / 40 / Bold 700
- H2: 24px / 32 / Bold 700 (screens use this for titles)
- H3: 20px / 28 / Semibold 600
- BodyLarge: 16px / 24 / Regular 400
- Body: 14px / 20 / Regular 400
- Caption: 12px / 16 / Regular 400

**Week 13**: Applied consistently across all screen headers

## Animation Patterns

**Decision**: Reanimated 3 worklets for 60fps UI thread performance

**Core Patterns**:
1. **Entry Animations**: FadeIn, FadeInDown, FadeInUp, SlideInRight, ScaleIn, Stagger
2. **Interactive States**: Button press (scale 0.95, opacity 0.8 with haptics)
3. **Progress**: ProgressBar fill with spring transitions, Number counter, Shimmer
4. **Celebrations**: Confetti, Success checkmark, Bounce

**Spring Configs**:
- `gentle`: damping 20, stiffness 90, mass 1 (smooth entries)
- `bouncy`: damping 10, stiffness 100, mass 0.8 (playful interactions)
- `snappy`: damping 30, stiffness 200, mass 0.5 (quick responses)
- `smooth`: damping 25, stiffness 120, mass 1 (balanced)

**Timing Presets**:
- `quick`: 150ms (button press)
- `standard`: 250ms (content transitions)
- `slow`: 400ms (complex animations)

**File**: `claudedocs/ANIMATION_SPECS.md`

## Efficiency Strategy: Skip Figma

**Decision**: Create specification documents instead of high-fidelity mockups

**Rationale**:
- Complete design system already exists (DESIGN_GUIDE.md)
- All design tokens implemented in codebase
- Developer-only project (no external design handoff)
- Text-based specs with code examples > visual mockups for implementation

**Approach**:
1. Text-based wireframe specs (WIREFRAME_SPECS.md - Day 3)
2. Illustration specifications with design details (ILLUSTRATION_SPECS.md - Day 4)
3. Component API specs with token mappings (COMPONENT_AUDIT.md - Day 5)
4. Animation specs with Reanimated code examples (ANIMATION_SPECS.md - Day 5)

**Time Saved**: 1-2 days per week (5-10 days total across Weeks 11-16)

## Typography Decisions

**Font**: Inter (via expo-font / @expo-google-fonts/inter)

**7-Level Type Scale**:
- Display: 48px / 56 line-height / Bold 700
- H1: 32px / 40 / Bold 700
- H2: 24px / 32 / Bold 700
- H3: 20px / 28 / Semibold 600
- BodyLarge: 16px / 24 / Regular 400
- Body: 14px / 20 / Regular 400
- Caption: 12px / 16 / Regular 400

**Hierarchy**:
- `text.primary`: #4E342E (Neutral 800) - main content
- `text.secondary`: #6F5F51 (Neutral 600) - supporting text
- `text.tertiary`: #8E7F70 (Neutral 500) - placeholder text
- `text.inverse`: #FAF9F7 (Neutral 50) - on dark backgrounds

**File**: `docs/DESIGN_GUIDE.md` (lines 110-168)

## Financial Color Semantics

**Pattern**: Color coding for financial states

**Mapping**:
- **Positive** (Sage 500 #6B7C4A): Paid amounts, Settled bills, Success states
- **Pending** (Amber #E8A637): Pending payments, Warning states, Amounts due
- **Negative** (Red #C74A45): Errors, Debts, Destructive actions
- **Settled** (Sage 500 #6B7C4A): Fully settled bills (same as positive)

**Usage Guidelines**:
- Progress bars: Use `brand.primary` (Terracotta) for in-progress, `financial.settled` (Sage) when fully paid
- Badges: Background `positiveLight`/`negativeLight`, border/text `positive`/`pending`/`negative`
- Balance cards: Green tint for "You are owed", neutral for "You owe"

**File**: `docs/DESIGN_GUIDE.md` (lines 63-106, 295-335)

## Component Migration Utilities

**Required Utility**: `hexToRgba` for Skia color conversion

**Context**: GlassCard uses Skia for glass-morphism effects, which requires rgba format for transparency. Design tokens use hex format.

**Implementation Needed**:
```typescript
// src/utils/colorUtils.ts
export const hexToRgba = (hex: string, opacity: number): string => {
  // Convert hex to rgba for Skia components
}
```

**Usage**:
```typescript
// Before (hardcoded):
color="rgba(245, 243, 240, 0.98)"

// After (with tokens):
color={hexToRgba(tokens.colors.background.elevated, 0.98)}
```

**File to Create**: `src/utils/colorUtils.ts` (Future enhancement)

## Screen Navigation Structure

**Decision**: Hybrid Navigation (Stack + Bottom Tabs)

**Structure**:
```
Bottom Tabs (5 tabs):
├─ Home (Dashboard) - house icon
├─ Friends - users icon  
├─ Add Expense (center, elevated) - plus-circle icon
├─ Activity - list icon
└─ Profile - user icon

Each tab has Stack Navigator:
├─ Home Stack: Dashboard → BillDetail
├─ Friends Stack: Friends → FriendDetail → SettleUp
├─ Add Expense: Modal overlay (not tab stack)
├─ Activity Stack: Activity → BillDetail
└─ Profile Stack: Profile → Settings
```

**Implementation**: Week 12 Day 4

**File**: `docs/IMPLEMENTATION_PLAN.md` (lines 1024-1036)

## Performance Considerations

**Animations**: All use Reanimated 3 worklets for UI thread execution (60fps target)

**Lists**: FlashList for virtualization (1000+ items)

**Images**: 
- SVG for illustrations (scalable, small file size)
- WebP for photos (Week 14+)
- Lazy loading for off-screen content

**Memory**:
- Cleanup animations on unmount
- Limit cached list items
- Progressive image loading

**Target**: 60fps on mid-range devices (tested on OnePlus 13 and similar)

## Onboarding USP Strategy (NEW - Week 13)

**Decision**: Focus onboarding on unique value propositions, not generic features

**3-Screen Structure**:
1. **Split & Send in 60 Seconds**
   - USP: Generate UPI payment links
   - USP: Send via WhatsApp/SMS without app requirement
   - Illustration: Bill splitting visualization

2. **Track & Remind Effortlessly**
   - USP: Automatic payment reminders
   - USP: Real-time payment status tracking
   - Illustration: Settlement tracking

3. **Organize & Analyze**
   - USP: Expense grouping (trips, friends)
   - USP: Spending insights and analytics
   - Illustration: Friend groups and analytics

**Key Messaging**:
- Emphasize speed ("60 seconds")
- Highlight convenience ("They don't need the app!")
- Focus on automation ("automatic reminders")
- Promise insights ("Get insights on spending patterns")

**Visual Strategy**:
- Large illustrations (340px) for visual impact
- Vasooly logo on first screen for brand recognition
- Minimal text (2-3 lines max per screen)
- Clear CTAs ("Next" → "Next" → "Get Started")

**Week 14 Update**: Mandatory UPI setup - removed skip button entirely

**File**: `src/screens/OnboardingScreen.tsx`

## UI Consistency Checklist (Week 13-14)

**Applied to All Screens**:
- ✅ All titles use h2 typography (24px, bold)
- ✅ All headers have consistent padding (52px top, 20px horizontal, 16px bottom)
- ✅ All headers have divider line (1px, border.subtle)
- ✅ All headers use elevated background
- ✅ All containers use View → ScreenHeader → ScrollView structure
- ✅ All typography uses token spreads (...tokens.typography.*)
- ✅ All colors use tokens (tokens.colors.*)
- ✅ All spacing uses tokens (tokens.spacing.*)
- ✅ All grid calculations match actual padding
- ✅ All Vasooly calculations exclude user's share
- ✅ All empty states use Lucide icons (NOT emoji)
- ✅ All empty states use gap spacing (NOT marginTop on children)
- ✅ All empty states use paddingHorizontal (NOT padding)
- ✅ All empty states use marginTop: -80 offset for visual centering

**Screens Audited**:
1. DashboardScreen ✅
2. ActivityScreen ✅ (Week 14: empty state fix)
3. ProfileScreen ✅
4. FriendsListScreen ✅
5. BillDetailScreen ✅
6. BillCreateScreen ✅
7. SettingsScreen ✅
8. OnboardingScreen ✅ (Week 14: mandatory UPI)
9. InsightsScreen ✅ (Week 14: empty state fix)
10. KarzedaarsListScreen ✅ (Week 14: empty state fix)

**Total Issues Fixed**: 35+
