# Design System Decisions & Patterns

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
2. Onboarding (6): Welcome, Bill splitting, Friend groups, Settlement, Privacy, Ready
3. Error States (4): General, Network, Permission denied, Payment failed
4. Celebration (4): First bill, All settled, Friend added, Large settlement

**File**: `claudedocs/ILLUSTRATION_SPECS.md`

## Component Architecture

**Pattern**: Token-driven components with design system consistency

**Migration Strategy**:
1. **Existing Components** (7): Audit and migrate to design tokens
   - GlassCard: ⚠️ Hardcoded rgba colors → tokens.colors.*
   - AnimatedButton: ✅ Already design system ready
2. **New Components** (13): Build with tokens from start
   - Core: BalanceCard, TransactionCard, FriendCard, StatusBadge, ProgressBar, Avatar, EmptyState
   - Forms/Nav: SearchInput, RadioGroup, Checkbox, BottomSheet, TabBar, QuickAmountButtons

**Key Patterns**:
- All colors via `tokens.colors.*`
- All spacing via `tokens.spacing.*`
- All typography via `tokens.typography.*`
- All animations via `tokens.animations.*`
- Haptic feedback integrated via `useHaptics` hook

**File**: `claudedocs/COMPONENT_AUDIT.md`

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

**File to Create**: `src/utils/colorUtils.ts` (Week 12 Day 1)

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
