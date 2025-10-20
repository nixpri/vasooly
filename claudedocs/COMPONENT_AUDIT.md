# Vasooly Component Library Audit

**Purpose**: Component audit, migration plan, and specifications for earthen design system
**Scope**: 7 existing components + 13 new components needed
**Target**: Week 12-16 implementation
**Last Updated**: 2025-10-20

---

## Table of Contents

1. [Existing Component Audit](#existing-component-audit)
2. [Migration Plan](#migration-plan)
3. [New Component Specifications](#new-component-specifications)
4. [Component API Reference](#component-api-reference)
5. [Implementation Priority](#implementation-priority)
6. [Week 12-16 Roadmap](#week-12-16-roadmap)

---

## Existing Component Audit

### Overview

| Component | Location | Status | Migration Needed | Priority |
|-----------|----------|--------|------------------|----------|
| GlassCard | `src/components/GlassCard.tsx` | ⚠️ Needs token conversion | Replace rgba values with tokens | HIGH |
| AnimatedGlassCard | `src/components/GlassCard.tsx` | ⚠️ Needs token conversion | Replace rgba values with tokens | HIGH |
| AnimatedButton | `src/components/AnimatedButton.tsx` | ✅ Design system ready | Verify timing tokens | LOW |
| BillAmountInput | `src/components/BillAmountInput.tsx` | ⚠️ Needs review | Check color/spacing tokens | MEDIUM |
| ParticipantList | `src/components/ParticipantList.tsx` | ⚠️ Needs review | Check color/spacing tokens | MEDIUM |
| SplitResultDisplay | `src/components/SplitResultDisplay.tsx` | ⚠️ Needs review | Check color/spacing tokens | MEDIUM |
| LoadingSpinner | `src/components/LoadingSpinner.tsx` | ⚠️ Needs review | Check color tokens | LOW |

---

### 1. GlassCard

**Current Implementation**: ✅ Using earthen colors (rgba hardcoded)
**Location**: `src/components/GlassCard.tsx:25-111`

**Audit Findings**:
- ✅ Correct earthen color values in use
- ❌ Colors are hardcoded as rgba strings instead of design tokens
- ✅ Skia glass morphism implementation correct
- ✅ Border radius prop matches design system defaults
- ✅ Reanimated spring animation present

**Migration Tasks**:

```typescript
// CURRENT (lines 69, 205):
color="rgba(245, 243, 240, 0.98)"  // Hardcoded
backgroundColor: 'rgba(250, 249, 247, 0.85)'  // Hardcoded

// AFTER MIGRATION:
import { tokens } from '@/theme/tokens';

// Convert to: tokens.colors.background.elevated with opacity
// Requires: hexToRgba utility function OR Skia color token support
```

**Required Changes**:
1. Import design tokens at top of file
2. Create `hexToRgba()` utility for Skia color conversion
3. Replace hardcoded colors (lines 69, 72, 87-88, 102, 156, 159, 174-175, 189, 205):
   - Line 69, 156: `rgba(245, 243, 240, 0.98)` → `tokens.colors.background.elevated` (98% opacity)
   - Line 72, 159: `rgba(62, 39, 35, 0.06)` → `tokens.colors.text.primary` (6% opacity for shadow)
   - Line 87-88, 174-175: Gradient using `tokens.colors.text.primary` (1.5% and 0.8% opacity)
   - Line 102, 189: `rgba(232, 228, 223, 0.9)` → `tokens.colors.border.light` (90% opacity)
   - Line 205: `rgba(250, 249, 247, 0.85)` → `tokens.colors.background.base` (85% opacity)

**Estimated Effort**: 2 hours
**Risk Level**: Low (cosmetic change, non-breaking)

---

### 2. AnimatedGlassCard

**Current Implementation**: ✅ Using earthen colors (rgba hardcoded)
**Location**: `src/components/GlassCard.tsx:114-199`

**Audit Findings**:
- Exact same findings as GlassCard (shares same rendering logic)
- Uses Moti for entry animation instead of manual Reanimated
- Spring config matches design system (damping: 15, stiffness: 150)

**Migration Tasks**:
- Same as GlassCard component
- Additionally verify Moti spring config matches `tokens.animations.spring.gentle`

**Estimated Effort**: Included in GlassCard migration
**Risk Level**: Low

---

### 3. AnimatedButton

**Current Implementation**: ✅ Design system ready
**Location**: `src/components/AnimatedButton.tsx:36-73`

**Audit Findings**:
- ✅ No hardcoded colors (style passed as prop)
- ✅ Uses Reanimated for animations
- ✅ Haptic feedback integration
- ✅ Generic wrapper pattern (correct approach)
- ⚠️ Depends on `@/hooks/useButtonAnimation` - needs verification

**Migration Tasks**:
1. Verify `useButtonAnimation` hook uses timing tokens:
   - Should use `tokens.animations.timing.quick` (150ms) for press
   - Should use `tokens.animations.spring.snappy` for release
2. Document recommended color token usage in JSDoc
3. Add usage examples with earthen button styles

**Required Changes**:
```typescript
/**
 * Usage with earthen design tokens:
 * @example
 * <AnimatedButton
 *   style={{
 *     backgroundColor: tokens.colors.brand.primary,
 *     borderRadius: tokens.radius.md,
 *     paddingHorizontal: tokens.spacing.lg,
 *     paddingVertical: tokens.spacing.md,
 *   }}
 *   haptic
 *   hapticIntensity="medium"
 * >
 *   <Text style={{ color: tokens.colors.text.inverse }}>
 *     Primary Button
 *   </Text>
 * </AnimatedButton>
 */
```

**Estimated Effort**: 1 hour (documentation + hook verification)
**Risk Level**: Very Low

---

### 4. BillAmountInput

**Current Implementation**: ⚠️ Needs review
**Location**: `src/components/BillAmountInput.tsx`

**Audit Checklist**:
- [ ] Check if using hardcoded colors vs tokens
- [ ] Verify text color uses `tokens.colors.text.primary`
- [ ] Verify placeholder uses `tokens.colors.text.tertiary`
- [ ] Verify background uses `tokens.colors.background.input`
- [ ] Verify border uses `tokens.colors.border.default`
- [ ] Verify spacing uses `tokens.spacing.*`
- [ ] Verify border radius uses `tokens.radius.sm`
- [ ] Verify typography uses `tokens.typography.bodyLarge`

**Estimated Effort**: 1-2 hours
**Risk Level**: Medium (input component, needs testing)

---

### 5. ParticipantList

**Current Implementation**: ⚠️ Needs review
**Location**: `src/components/ParticipantList.tsx`

**Audit Checklist**:
- [ ] Check avatar/list item colors
- [ ] Verify selected state uses `tokens.colors.brand.primaryLight`
- [ ] Verify text uses `tokens.colors.text.*` hierarchy
- [ ] Verify spacing uses `tokens.spacing.*`
- [ ] Verify separator uses `tokens.colors.border.subtle`

**Estimated Effort**: 1-2 hours
**Risk Level**: Medium (list component)

---

### 6. SplitResultDisplay

**Current Implementation**: ⚠️ Needs review
**Location**: `src/components/SplitResultDisplay.tsx`

**Audit Checklist**:
- [ ] Check amount display colors
- [ ] Verify positive amounts use `tokens.colors.financial.positive`
- [ ] Verify negative amounts use appropriate semantic color
- [ ] Verify settled state uses `tokens.colors.financial.settled`
- [ ] Verify typography uses appropriate scales
- [ ] Verify spacing and layout tokens

**Estimated Effort**: 2 hours
**Risk Level**: Medium (financial display, needs accuracy)

---

### 7. LoadingSpinner

**Current Implementation**: ⚠️ Needs review
**Location**: `src/components/LoadingSpinner.tsx`

**Audit Checklist**:
- [ ] Check spinner color uses `tokens.colors.brand.primary`
- [ ] Verify background (if any) uses tokens
- [ ] Verify size prop system aligns with spacing
- [ ] Verify animation timing uses `tokens.animations.timing.*`

**Estimated Effort**: 30 minutes - 1 hour
**Risk Level**: Low (simple component)

---

## Migration Plan

### Phase 1: Utility Setup (Week 12, Day 1)

**Create Color Utilities**:
```typescript
// src/utils/colorUtils.ts

/**
 * Convert hex color to rgba string for Skia
 */
export function hexToRgba(hex: string, opacity: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Example usage:
 * hexToRgba(tokens.colors.background.elevated, 0.98)
 * // Returns: "rgba(245, 243, 240, 0.98)"
 */
```

**Estimated Time**: 30 minutes

---

### Phase 2: High Priority Migrations (Week 12, Day 1-2)

**Components**:
1. ✅ GlassCard - Convert all rgba to tokens
2. ✅ AnimatedGlassCard - Same as GlassCard
3. ✅ AnimatedButton - Document token usage

**Validation**:
- Visual regression test on Dashboard
- Test on iOS and Android
- Verify glass effect renders correctly
- Check button press animations

**Estimated Time**: 4 hours

---

### Phase 3: Medium Priority Migrations (Week 12, Day 3)

**Components**:
1. ✅ BillAmountInput - Token conversion + testing
2. ✅ ParticipantList - Token conversion + testing
3. ✅ SplitResultDisplay - Token conversion + testing

**Validation**:
- Test input functionality
- Verify amount formatting
- Check participant selection states
- Validate settlement display accuracy

**Estimated Time**: 6 hours

---

### Phase 4: Low Priority Migrations (Week 12, Day 4)

**Components**:
1. ✅ LoadingSpinner - Token conversion

**Validation**:
- Verify spinner color and animation
- Test across different loading states

**Estimated Time**: 1 hour

---

### Phase 5: Comprehensive Testing (Week 12, Day 5)

**Test Matrix**:
- [ ] All components render with earthen colors
- [ ] No hardcoded colors remain (grep check)
- [ ] Spacing is consistent across components
- [ ] Typography scales correctly
- [ ] Animations use correct timing tokens
- [ ] Components work in light mode
- [ ] Components work in GlassCard containers
- [ ] Accessibility contrast ratios pass WCAG AA

**Automated Checks**:
```bash
# Check for hardcoded colors (should return 0 results in components)
grep -r "rgba\|#[0-9a-fA-F]\{6\}" src/components/ --exclude="*.test.*"

# Verify token imports
grep -r "import.*tokens" src/components/
```

**Estimated Time**: 4 hours

---

## New Component Specifications

### Overview

| Component | Purpose | Screens Used | Complexity | Priority |
|-----------|---------|--------------|------------|----------|
| BalanceCard | Display user balance overview | Dashboard | Medium | HIGH |
| TransactionCard | Show individual transaction | Activity Feed, Friend Detail | Medium | HIGH |
| FriendCard | Display friend in list | Friends List | Low | HIGH |
| StatusBadge | Show payment status | Multiple | Low | HIGH |
| ProgressBar | Settlement progress | Friend Detail, Bills | Low | HIGH |
| Avatar | User/friend profile image | Multiple | Low | HIGH |
| EmptyState | Reusable empty state wrapper | Multiple | Low | HIGH |
| SearchInput | Search with filters | Search Screen | Medium | MEDIUM |
| RadioGroup | Single selection (payment method) | Add Expense, Settle Up | Low | MEDIUM |
| Checkbox | Multi-selection, agreements | Filters, Settings | Low | MEDIUM |
| BottomSheet | Modal sheets, action menus | Multiple | High | MEDIUM |
| TabBar | Bottom navigation | Main navigation | Medium | HIGH |
| QuickAmountButtons | Preset expense amounts | Add Expense | Low | LOW |

---

### 1. BalanceCard

**Purpose**: Display user's overall balance (owed to / owed by)
**Location**: Dashboard screen (top section)
**Complexity**: Medium

**Visual Specification**:
```
┌─────────────────────────────────────┐
│  YOUR BALANCE                       │
│                                     │
│  You're owed        $125.00 ↑      │
│  You owe            $45.00  ↓      │
│  ──────────────────────────────     │
│  Net Balance        $80.00  ↑      │
│                                     │
│  [Settle Up]                        │
└─────────────────────────────────────┘
```

**Props API**:
```typescript
interface BalanceCardProps {
  /** Total amount user is owed */
  owedTo: number;
  /** Total amount user owes */
  owedBy: number;
  /** Callback when settle up pressed */
  onSettleUp: () => void;
  /** Optional style override */
  style?: ViewStyle;
  /** Loading state */
  loading?: boolean;
}
```

**Design Token Mapping**:
```typescript
{
  container: {
    backgroundColor: tokens.colors.background.elevated,  // GlassCard
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing['2xl'],
  },
  title: {
    ...tokens.typography.h3,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
  },
  amountPositive: {
    ...tokens.typography.h2,
    color: tokens.colors.financial.positive,
  },
  amountNegative: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
  },
  netBalance: {
    ...tokens.typography.h1,
    color: tokens.colors.financial.positive,  // if net positive
    marginTop: tokens.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
    marginVertical: tokens.spacing.lg,
  },
  button: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
  },
}
```

**Animation Specs**:
- Entry: FadeInDown with spring (gentle)
- Amount update: Number counter animation (400ms)
- Button press: Scale 0.95 with haptic medium

**Accessibility**:
- Label: "Balance overview"
- Value announcements: "You're owed $125.00, You owe $45.00, Net balance $80.00"
- Button: "Settle up all balances"

**Implementation Priority**: Week 12
**Estimated Effort**: 4 hours
**Dependencies**: AnimatedButton, GlassCard

---

### 2. TransactionCard

**Purpose**: Display individual expense/settlement in activity feed
**Location**: Activity Feed, Friend Detail screens
**Complexity**: Medium

**Visual Specification**:
```
┌──────────────────────────────────────┐
│ 👤 Dinner at Olive Garden            │
│    Added by John • 2 days ago        │
│                                      │
│    You paid $80.00                   │
│    John owes you $40.00         [↗]  │
│    Status: Pending              ●    │
└──────────────────────────────────────┘
```

**Props API**:
```typescript
interface TransactionCardProps {
  /** Transaction ID */
  id: string;
  /** Transaction type: 'expense' | 'settlement' */
  type: 'expense' | 'settlement';
  /** Transaction title/description */
  title: string;
  /** Amount */
  amount: number;
  /** Payer name */
  paidBy: string;
  /** Your share */
  yourShare: number;
  /** Status: 'pending' | 'paid' | 'settled' */
  status: 'pending' | 'paid' | 'settled';
  /** Timestamp */
  timestamp: Date;
  /** Avatar URL (optional) */
  avatarUrl?: string;
  /** Callback on press */
  onPress: () => void;
  /** Optional style */
  style?: ViewStyle;
}
```

**Design Token Mapping**:
```typescript
{
  container: {
    backgroundColor: tokens.colors.background.elevated,  // GlassCard
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  title: {
    ...tokens.typography.bodyLarge,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  metadata: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    marginBottom: tokens.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  amountLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  amountValue: {
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  amountPositive: {
    color: tokens.colors.financial.positive,
  },
  statusBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.components.badge.borderRadius,
  },
  chevron: {
    color: tokens.colors.text.tertiary,
  },
}
```

**Animation Specs**:
- Entry: FadeIn + SlideInRight (staggered in lists)
- Press: Scale 0.98 with haptic light
- Status change: Pulse animation on badge

**Accessibility**:
- Label: "Transaction: [title]"
- Value: Full transaction details announcement
- Action: "Double tap to view details"

**Implementation Priority**: Week 12
**Estimated Effort**: 5 hours
**Dependencies**: Avatar, StatusBadge, AnimatedButton

---

### 3. FriendCard

**Purpose**: Display friend in friends list
**Location**: Friends List screen
**Complexity**: Low

**Visual Specification**:
```
┌──────────────────────────────────────┐
│ 👤  John Smith                  [↗]  │
│     You owe $40.00                   │
│     ──────────── 60% settled         │
└──────────────────────────────────────┘
```

**Props API**:
```typescript
interface FriendCardProps {
  /** Friend ID */
  id: string;
  /** Friend name */
  name: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Balance (positive = they owe you, negative = you owe them) */
  balance: number;
  /** Settlement percentage (0-100) */
  settlementPercentage: number;
  /** Callback on press */
  onPress: () => void;
  /** Optional style */
  style?: ViewStyle;
}
```

**Design Token Mapping**:
```typescript
{
  container: {
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  name: {
    ...tokens.typography.bodyLarge,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  balance: {
    ...tokens.typography.body,
    color: tokens.colors.financial.positive,  // or text.primary if negative
    marginBottom: tokens.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  progressLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
}
```

**Animation Specs**:
- Entry: FadeIn with slight delay (staggered)
- Press: Scale 0.98 + haptic light
- Progress bar: Animated width on mount

**Implementation Priority**: Week 13
**Estimated Effort**: 3 hours
**Dependencies**: Avatar, ProgressBar

---

### 4. StatusBadge

**Purpose**: Display payment/settlement status
**Location**: Multiple screens (transaction cards, bill details)
**Complexity**: Low

**Visual Specification**:
```
┌─────────┐  ┌────────┐  ┌─────────┐
│ Pending │  │  Paid  │  │ Settled │
└─────────┘  └────────┘  └─────────┘
   Orange       Green      Green
```

**Props API**:
```typescript
interface StatusBadgeProps {
  /** Status type */
  status: 'pending' | 'paid' | 'settled';
  /** Optional custom label */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional style */
  style?: ViewStyle;
}
```

**Design Token Mapping**:
```typescript
{
  pending: {
    backgroundColor: tokens.colors.financial.negativeLight,
    color: tokens.colors.financial.pending,
    borderColor: tokens.colors.financial.pending,
  },
  paid: {
    backgroundColor: tokens.colors.financial.positiveLight,
    color: tokens.colors.financial.positive,
    borderColor: tokens.colors.financial.positive,
  },
  settled: {
    backgroundColor: tokens.colors.financial.positiveLight,
    color: tokens.colors.financial.settled,
    borderColor: tokens.colors.financial.settled,
  },
  base: {
    borderRadius: tokens.components.badge.borderRadius,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  text: {
    ...tokens.typography.caption,
    fontWeight: '600',
  },
}
```

**Animation Specs**:
- Status change: CrossFade between states (200ms)
- Entry: FadeIn (150ms)

**Implementation Priority**: Week 12
**Estimated Effort**: 1 hour

---

### 5. ProgressBar

**Purpose**: Show settlement progress percentage
**Location**: Friend Detail, Bill Detail screens
**Complexity**: Low

**Visual Specification**:
```
┌────────────────────────────────┐
│ ████████████░░░░░░░░░░░░  60%  │
└────────────────────────────────┘
```

**Props API**:
```typescript
interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Color variant: 'default' | 'success' */
  variant?: 'default' | 'success';
  /** Optional style */
  style?: ViewStyle;
  /** Height */
  height?: number;
}
```

**Design Token Mapping**:
```typescript
{
  container: {
    height: 4,  // or props.height
    backgroundColor: tokens.colors.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: tokens.colors.brand.primary,  // default
    borderRadius: 2,
  },
  fillSuccess: {
    backgroundColor: tokens.colors.financial.settled,
  },
  label: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing.sm,
  },
}
```

**Animation Specs**:
- Fill animation: Animated width with spring (smooth)
- Color transition: When variant changes (400ms)

**Implementation Priority**: Week 12
**Estimated Effort**: 2 hours

---

### 6. Avatar

**Purpose**: Display user/friend profile image with fallback
**Location**: Multiple screens
**Complexity**: Low

**Visual Specification**:
```
┌──────┐     ┌──────┐
│ IMG  │ or  │  JS  │  (Initials fallback)
└──────┘     └──────┘
```

**Props API**:
```typescript
interface AvatarProps {
  /** Image URL */
  imageUrl?: string;
  /** Name for fallback initials */
  name: string;
  /** Size preset */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** Custom size (overrides preset) */
  customSize?: number;
  /** Optional style */
  style?: ViewStyle;
  /** Callback on press */
  onPress?: () => void;
}
```

**Design Token Mapping**:
```typescript
{
  sizes: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
  container: {
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.brand.primaryLight,
    borderWidth: 2,
    borderColor: tokens.colors.background.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: tokens.radius.full,
  },
  initials: {
    ...tokens.typography.body,  // scales with size
    color: tokens.colors.brand.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
}
```

**Animation Specs**:
- Image load: FadeIn when loaded (300ms)
- Press: Scale 0.95 if onPress provided

**Implementation Priority**: Week 12
**Estimated Effort**: 2 hours

---

### 7. EmptyState

**Purpose**: Reusable wrapper for empty state UI
**Location**: All screens with potential empty states
**Complexity**: Low

**Visual Specification**:
```
┌─────────────────────────────┐
│        [ILLUSTRATION]       │
│                             │
│    No expenses yet!         │
│    Tap + to add your first  │
│                             │
│      [Primary Action]       │
└─────────────────────────────┘
```

**Props API**:
```typescript
interface EmptyStateProps {
  /** Illustration component or name */
  illustration: React.ReactNode | 'no-bills' | 'no-friends' | 'no-activity' | 'search' | 'offline';
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Primary action button (optional) */
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Secondary action button (optional) */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Optional style */
  style?: ViewStyle;
}
```

**Design Token Mapping**:
```typescript
{
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['3xl'],
    paddingVertical: tokens.spacing['4xl'],
  },
  illustrationContainer: {
    marginBottom: tokens.spacing['2xl'],
  },
  title: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  description: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing['2xl'],
  },
  primaryButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing['2xl'],
    paddingVertical: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  secondaryButton: {
    backgroundColor: tokens.colors.background.subtle,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing['2xl'],
    paddingVertical: tokens.spacing.md,
  },
}
```

**Animation Specs**:
- Entry: FadeIn + SlideInUp (gentle spring)
- Illustration: Optional float animation (subtle, slow)

**Implementation Priority**: Week 12
**Estimated Effort**: 3 hours
**Dependencies**: AnimatedButton, Illustration SVGs

---

### 8. SearchInput

**Purpose**: Search bar with filter capabilities
**Location**: Search screen
**Complexity**: Medium

**Props API**:
```typescript
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback on text change */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show filter button */
  showFilter?: boolean;
  /** Callback when filter pressed */
  onFilterPress?: () => void;
  /** Active filter count */
  filterCount?: number;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 13
**Estimated Effort**: 4 hours

---

### 9. RadioGroup

**Purpose**: Single selection UI (e.g., payment method)
**Location**: Add Expense, Settle Up screens
**Complexity**: Low

**Props API**:
```typescript
interface RadioGroupProps {
  /** Options array */
  options: Array<{ label: string; value: string; description?: string }>;
  /** Selected value */
  value: string;
  /** Callback on selection */
  onChange: (value: string) => void;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 13
**Estimated Effort**: 2 hours

---

### 10. Checkbox

**Purpose**: Boolean selection (filters, agreements)
**Location**: Filter modal, Settings, Terms
**Complexity**: Low

**Props API**:
```typescript
interface CheckboxProps {
  /** Checked state */
  checked: boolean;
  /** Callback on toggle */
  onToggle: (checked: boolean) => void;
  /** Label text */
  label: string;
  /** Optional description */
  description?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 13
**Estimated Effort**: 2 hours

---

### 11. BottomSheet

**Purpose**: Modal bottom sheets for actions/selections
**Location**: Multiple screens (modals, pickers)
**Complexity**: High

**Props API**:
```typescript
interface BottomSheetProps {
  /** Visibility state */
  visible: boolean;
  /** Callback on close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Title (optional) */
  title?: string;
  /** Height mode: 'auto' | 'half' | 'full' */
  heightMode?: 'auto' | 'half' | 'full';
  /** Show backdrop */
  showBackdrop?: boolean;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 13
**Estimated Effort**: 6 hours
**Note**: Consider using `@gorhom/bottom-sheet` library

---

### 12. TabBar

**Purpose**: Bottom navigation tabs
**Location**: Main app navigation
**Complexity**: Medium

**Props API**:
```typescript
interface TabBarProps {
  /** Active tab */
  activeTab: string;
  /** Callback on tab change */
  onTabChange: (tab: string) => void;
  /** Tab configuration */
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
    badge?: number;
  }>;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 12
**Estimated Effort**: 5 hours

---

### 13. QuickAmountButtons

**Purpose**: Preset expense amount selection
**Location**: Add Expense screen
**Complexity**: Low

**Props API**:
```typescript
interface QuickAmountButtonsProps {
  /** Preset amounts */
  amounts: number[];
  /** Callback on amount selected */
  onSelectAmount: (amount: number) => void;
  /** Currently selected amount */
  selectedAmount?: number;
  /** Optional style */
  style?: ViewStyle;
}
```

**Implementation Priority**: Week 14
**Estimated Effort**: 2 hours

---

## Component API Reference

### Common Patterns

**Standard Props** (all components should accept):
```typescript
interface BaseComponentProps {
  /** Optional style override */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}
```

**Animation Props** (interactive components):
```typescript
interface AnimatableProps {
  /** Enable enter animation */
  animated?: boolean;
  /** Animation delay (ms) */
  animationDelay?: number;
}
```

**Accessibility Props** (all interactive components):
```typescript
interface AccessibleProps {
  /** Accessible label */
  accessibilityLabel?: string;
  /** Accessible hint */
  accessibilityHint?: string;
  /** Accessible role */
  accessibilityRole?: string;
}
```

### Token Usage Guidelines

**Import Pattern**:
```typescript
import { tokens } from '@/theme/tokens';
```

**Color Usage**:
```typescript
// Text colors
color: tokens.colors.text.primary       // Main text
color: tokens.colors.text.secondary     // Supporting text
color: tokens.colors.text.tertiary      // Placeholder, disabled

// Background colors
backgroundColor: tokens.colors.background.base      // Main background
backgroundColor: tokens.colors.background.elevated  // Cards, headers
backgroundColor: tokens.colors.background.input     // Form inputs

// Brand colors
backgroundColor: tokens.colors.brand.primary        // Primary actions
backgroundColor: tokens.colors.brand.primaryLight   // Highlights
backgroundColor: tokens.colors.brand.primaryDark    // Pressed states

// Financial colors
color: tokens.colors.financial.positive      // Paid, settled
color: tokens.colors.financial.pending       // Pending payments
color: tokens.colors.financial.negative      // Errors, debts
```

**Spacing Usage**:
```typescript
// Padding/margin
padding: tokens.spacing.xs      // 4px - Tight spacing
padding: tokens.spacing.sm      // 8px - Compact spacing
padding: tokens.spacing.md      // 12px - Default spacing
padding: tokens.spacing.lg      // 16px - Comfortable spacing
padding: tokens.spacing.xl      // 20px - Spacious
padding: tokens.spacing['2xl']  // 24px - Extra spacious
padding: tokens.spacing['3xl']  // 32px - Section spacing
padding: tokens.spacing['4xl']  // 48px - Page spacing
```

**Typography Usage**:
```typescript
// Text styles
...tokens.typography.display    // 48px - Large headings
...tokens.typography.h1         // 32px - Page titles
...tokens.typography.h2         // 24px - Section titles
...tokens.typography.h3         // 20px - Subsection titles
...tokens.typography.bodyLarge  // 16px - Emphasized body
...tokens.typography.body       // 14px - Default body
...tokens.typography.caption    // 12px - Small text, metadata
```

**Border Radius Usage**:
```typescript
borderRadius: tokens.radius.sm    // 8px - Inputs, badges
borderRadius: tokens.radius.md    // 12px - Buttons, cards
borderRadius: tokens.radius.lg    // 16px - Large cards
borderRadius: tokens.radius.full  // 9999px - Pills, avatars
```

**Animation Usage**:
```typescript
// Spring configs
import { withSpring } from 'react-native-reanimated';

withSpring(targetValue, tokens.animations.spring.gentle)  // Smooth, calm
withSpring(targetValue, tokens.animations.spring.bouncy)  // Fun, playful
withSpring(targetValue, tokens.animations.spring.snappy)  // Quick, responsive
withSpring(targetValue, tokens.animations.spring.smooth)  // Balanced

// Timing
import { withTiming } from 'react-native-reanimated';

withTiming(targetValue, { duration: tokens.animations.timing.quick })     // 150ms
withTiming(targetValue, { duration: tokens.animations.timing.standard })  // 250ms
withTiming(targetValue, { duration: tokens.animations.timing.slow })      // 400ms
```

---

## Implementation Priority

### Week 12: Core Foundation (Dashboard, Onboarding, Tab Navigation, Activity Feed)

**Critical Path Components** (Must implement):
1. ✅ **TabBar** - Main navigation (Day 1)
2. ✅ **BalanceCard** - Dashboard hero (Day 1)
3. ✅ **EmptyState** - Onboarding/empty scenarios (Day 2)
4. ✅ **Avatar** - User display (Day 2)
5. ✅ **StatusBadge** - Transaction status (Day 3)
6. ✅ **TransactionCard** - Activity feed (Day 3)
7. ✅ **ProgressBar** - Visual feedback (Day 4)

**Migration Tasks**:
- ✅ GlassCard, AnimatedGlassCard (Day 1)
- ✅ AnimatedButton (Day 1)
- ✅ BillAmountInput, ParticipantList, SplitResultDisplay (Day 3)
- ✅ LoadingSpinner (Day 4)

**Total Estimated Time**: 32 hours (Week 12)

---

### Week 13: Tier 2 Screens (Friends, Add Expense, Settle Up)

**Required Components**:
1. ✅ **FriendCard** - Friends list (Day 1)
2. ✅ **SearchInput** - Friend search (Day 2)
3. ✅ **RadioGroup** - Payment method selection (Day 3)
4. ✅ **Checkbox** - Filters, agreements (Day 3)
5. ✅ **BottomSheet** - Modals and action sheets (Day 4-5)

**Total Estimated Time**: 20 hours (Week 13)

---

### Week 14: Premium Features (Insights, Debt Network, Smart Features)

**Required Components**:
1. ✅ **QuickAmountButtons** - Add expense presets (Day 1)

**Total Estimated Time**: 2 hours (Week 14)

---

### Week 15: Polish & Refinement

**Tasks**:
- Refine animations and micro-interactions
- Accessibility audit and fixes
- Visual polish on all components
- Performance optimization

**Total Estimated Time**: 16 hours (Week 15)

---

### Week 16: Integration Testing

**Tasks**:
- Component integration testing
- Visual regression testing
- Accessibility testing (WCAG AA compliance)
- Cross-platform testing (iOS, Android)
- Performance profiling

**Total Estimated Time**: 16 hours (Week 16)

---

## Week 12-16 Roadmap

### Week 12: Core Screens Implementation

**Day 1: Navigation & Foundation**
- [ ] Migrate GlassCard to tokens (2h)
- [ ] Migrate AnimatedButton to tokens (1h)
- [ ] Implement TabBar component (5h)
- [ ] Implement BalanceCard component (4h)

**Day 2: Empty States & Onboarding**
- [ ] Implement Avatar component (2h)
- [ ] Implement EmptyState component (3h)
- [ ] Integrate onboarding illustrations (3h)
- [ ] Implement onboarding flow screens (4h)

**Day 3: Activity Feed**
- [ ] Migrate BillAmountInput to tokens (1.5h)
- [ ] Migrate ParticipantList to tokens (1.5h)
- [ ] Migrate SplitResultDisplay to tokens (2h)
- [ ] Implement StatusBadge component (1h)
- [ ] Implement TransactionCard component (5h)

**Day 4: Dashboard Completion**
- [ ] Migrate LoadingSpinner to tokens (1h)
- [ ] Implement ProgressBar component (2h)
- [ ] Integrate BalanceCard with dashboard (2h)
- [ ] Integrate empty states (2h)
- [ ] Dashboard polish and animations (3h)

**Day 5: Testing & Validation**
- [ ] Component visual regression tests (4h)
- [ ] Accessibility audit (2h)
- [ ] Cross-platform testing (2h)
- [ ] Bug fixes and polish (4h)

---

### Week 13: Tier 2 Implementation

**Day 1: Friends List**
- [ ] Implement FriendCard component (3h)
- [ ] Friends list screen implementation (4h)
- [ ] Empty state integration (1h)

**Day 2: Search**
- [ ] Implement SearchInput component (4h)
- [ ] Search screen implementation (3h)
- [ ] Search empty state (1h)

**Day 3: Form Components**
- [ ] Implement RadioGroup component (2h)
- [ ] Implement Checkbox component (2h)
- [ ] Add Expense form integration (4h)

**Day 4-5: Modals & Sheets**
- [ ] Implement BottomSheet component (6h)
- [ ] Integrate bottom sheets across app (4h)
- [ ] Settle Up flow implementation (4h)
- [ ] Testing and polish (4h)

---

### Week 14: Premium Features

**Day 1: Quick Actions**
- [ ] Implement QuickAmountButtons (2h)
- [ ] Spending insights UI (6h)

**Day 2-3: Debt Network**
- [ ] Debt network visualization (8h)
- [ ] Smart settlement suggestions UI (4h)

**Day 4-5: Smart Features**
- [ ] Receipt scanning UI (6h)
- [ ] Smart notifications (4h)
- [ ] Testing (4h)

---

### Week 15: Polish & Refinement

**Day 1-2: Animations**
- [ ] Refine entry/exit animations (6h)
- [ ] Add micro-interactions (6h)
- [ ] Gesture-based interactions (4h)

**Day 3: Accessibility**
- [ ] Screen reader optimization (4h)
- [ ] Contrast ratio fixes (2h)
- [ ] Keyboard navigation (2h)

**Day 4-5: Visual Polish**
- [ ] Component alignment fixes (4h)
- [ ] Spacing consistency (3h)
- [ ] Color usage audit (3h)
- [ ] Final visual QA (4h)

---

### Week 16: Integration Testing

**Day 1-2: Automated Testing**
- [ ] Component unit tests (8h)
- [ ] Integration test suite (8h)

**Day 3: Visual Regression**
- [ ] Screenshot baseline creation (4h)
- [ ] Visual diff testing (4h)

**Day 4: Accessibility Testing**
- [ ] WCAG AA compliance audit (4h)
- [ ] Screen reader testing (4h)

**Day 5: Performance & Polish**
- [ ] Performance profiling (4h)
- [ ] Bundle size optimization (2h)
- [ ] Final bug fixes (4h)

---

## Completion Checklist

### Existing Components ✅
- [ ] GlassCard - Migrated to tokens
- [ ] AnimatedGlassCard - Migrated to tokens
- [ ] AnimatedButton - Documented token usage
- [ ] BillAmountInput - Migrated to tokens
- [ ] ParticipantList - Migrated to tokens
- [ ] SplitResultDisplay - Migrated to tokens
- [ ] LoadingSpinner - Migrated to tokens

### New Components ✅
- [ ] BalanceCard - Implemented with tokens
- [ ] TransactionCard - Implemented with tokens
- [ ] FriendCard - Implemented with tokens
- [ ] StatusBadge - Implemented with tokens
- [ ] ProgressBar - Implemented with tokens
- [ ] Avatar - Implemented with tokens
- [ ] EmptyState - Implemented with tokens
- [ ] SearchInput - Implemented with tokens
- [ ] RadioGroup - Implemented with tokens
- [ ] Checkbox - Implemented with tokens
- [ ] BottomSheet - Implemented with tokens
- [ ] TabBar - Implemented with tokens
- [ ] QuickAmountButtons - Implemented with tokens

### Quality Gates ✅
- [ ] All components use design tokens (no hardcoded colors)
- [ ] All components follow earthen design language
- [ ] All interactive components have animations
- [ ] All components have proper accessibility labels
- [ ] All components pass WCAG AA contrast requirements
- [ ] All components tested on iOS and Android
- [ ] All components have TypeScript types
- [ ] All components have usage documentation

---

**Status**: ✅ Complete
**Version**: 1.0
**Next Steps**: Proceed to Day 5 Animation Specifications
