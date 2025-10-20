# Week 12 Implementation Roadmap

## Overview
**Focus**: Core Screens Design Implementation (5 days)
**Goal**: Implement Tier 1 screens (highest user impact)
**Status**: Ready to begin (Week 11 complete)

## Day 1-2: Onboarding Flow

### Deliverables
- `OnboardingScreen.tsx` component stack (4-6 screens)
- Screen pagination with dots indicator
- Skip/next navigation
- First-launch detection
- Smooth screen transitions
- Onboarding completion state persistence

### Implementation Details

**Screens to Create**:
1. **Welcome Screen** - Hero illustration, app tagline
2. **Bill Splitting** - Explain how splitting works
3. **Friend Groups** - Show friend management
4. **Settlement Tracking** - Demonstrate payment tracking
5. **Privacy & Security** - Reassure about data safety
6. **Get Started** - CTA to begin

**Technical Approach**:
- Use React Native Swiper or custom ViewPager
- Illustrations from `ILLUSTRATION_SPECS.md` (Onboarding section)
- FadeInDown entry animations from `ANIMATION_SPECS.md`
- Store completion in settingsStore (new field: `onboardingCompleted`)
- Check on app launch in App.tsx

**Files to Create**:
- `src/screens/OnboardingScreen.tsx` (~400-500 lines)
- `src/components/OnboardingPagination.tsx` (~80 lines, dots indicator)

**Files to Modify**:
- `src/stores/settingsStore.ts` - Add `onboardingCompleted` field
- `App.tsx` or `AppNavigator.tsx` - Conditional onboarding flow

**Design Reference**: 
- Illustrations: `claudedocs/ILLUSTRATION_SPECS.md` (lines 83-264)
- Animations: `claudedocs/ANIMATION_SPECS.md` (FadeInDown pattern)
- Colors: `docs/DESIGN_GUIDE.md` (earthen palette)

## Day 2-3: Dashboard/Home Screen (NEW)

### Deliverables
- `DashboardScreen.tsx` (replaces BillHistoryScreen as home)
- Balance overview card with glass-morphism
- Quick actions section
- Recent activity preview
- Pull-to-refresh functionality
- Skeleton loading states

### Implementation Details

**Screen Sections**:
1. **Hero Balance Card**:
   - "You are owed" vs "You owe" with visual distinction
   - Net balance calculation from all bills
   - Tap to flip/expand for breakdown
   - Glass-morphism using GlassCard component
   - BalanceCard component from `COMPONENT_AUDIT.md`

2. **Quick Actions**:
   - Add Expense (primary CTA, elevated)
   - Settle Up (secondary)
   - Invite Friend (tertiary)
   - AnimatedButton with haptics

3. **Recent Activity Preview**:
   - Latest 5 transactions/events
   - TransactionCard component
   - "View All" link to Activity tab

4. **Friends Who Owe You**:
   - Top 3 friends by amount owed
   - FriendCard component (compact variant)
   - Navigate to Friends tab

5. **Pending Reminders Count**:
   - Badge with pending reminder count
   - Navigate to Notifications

**Technical Approach**:
- Integrate with billStore (balance calculations)
- Integrate with historyStore (recent activity)
- Use BalanceCard component from Day 4 component implementation
- FadeIn entry animations for cards
- Pull-to-refresh with RefreshControl

**Files to Create**:
- `src/screens/DashboardScreen.tsx` (~450-550 lines)
- `src/components/BalanceCard.tsx` (~200 lines) - implement from COMPONENT_AUDIT.md
- `src/components/TransactionCard.tsx` (~150 lines) - implement from COMPONENT_AUDIT.md
- `src/components/QuickActionButton.tsx` (~100 lines) - variant of AnimatedButton

**Files to Modify**:
- `src/stores/billStore.ts` - Add `getNetBalance()` selector
- `src/stores/historyStore.ts` - Add `getRecentActivity(limit: 5)` selector
- `src/navigation/AppNavigator.tsx` - Add DashboardScreen to Home tab stack

**Design Reference**:
- Components: `claudedocs/COMPONENT_AUDIT.md` (BalanceCard lines 110-236, TransactionCard lines 238-364)
- Animations: `claudedocs/ANIMATION_SPECS.md` (BalanceCard lines 512-609, TransactionCard lines 611-693)
- Layout: `claudedocs/WIREFRAME_SPECS.md` (Dashboard section, if exists)

## Day 4: Bottom Tab Navigation

### Deliverables
- Hybrid navigation structure (Stack + Bottom Tabs)
- Custom tab bar with elevated center button
- Tab bar animations
- Navigation type definitions
- Updated AppNavigator

### Implementation Details

**Tab Structure**:
```
Bottom Tabs (5 tabs):
├─ Tab 1: Home (Dashboard) - house icon 🏠
├─ Tab 2: Friends - users icon 👥
├─ Tab 3: Add Expense (CENTER, ELEVATED) - plus-circle icon ➕
├─ Tab 4: Activity - list icon 📋
└─ Tab 5: Profile - user icon 👤
```

**Each Tab Stack**:
```typescript
Home Stack: Dashboard → BillDetail
Friends Stack: Friends (placeholder) → FriendDetail (placeholder)
Add Expense: Modal presentation (not stack)
Activity Stack: ActivityScreen (renamed BillHistory) → BillDetail
Profile Stack: Profile (placeholder) → Settings
```

**Custom Tab Bar**:
- Center button elevated (+24px)
- Scale animation on tap
- Active tab color: `brand.primary` (Terracotta)
- Inactive tab color: `text.tertiary` (Neutral 500)
- Tab bar background: `background.elevated` with glass-morphism

**Technical Approach**:
- Install `@react-navigation/bottom-tabs`
- Create custom `TabBar.tsx` component
- Implement center button as floating action button
- Tab press animations with scale + haptics
- Type-safe navigation with TypeScript

**Files to Create**:
- `src/components/TabBar.tsx` (~250-300 lines, custom tab bar)
- `src/navigation/types.ts` (~50 lines, navigation type definitions)

**Files to Modify**:
- `src/navigation/AppNavigator.tsx` - Major refactor to Bottom Tabs + Stacks
- `package.json` - Add `@react-navigation/bottom-tabs`

**Design Reference**:
- Component: `claudedocs/COMPONENT_AUDIT.md` (TabBar lines 919-1037)
- Animations: `claudedocs/ANIMATION_SPECS.md` (Tab press animations)

## Day 5: Enhanced Activity Feed

### Deliverables
- Rename `BillHistoryScreen.tsx` → `ActivityScreen.tsx`
- Timeline view with date grouping
- Activity type icons and color coding
- Enhanced filters (all, this month, last month, settled)
- Infinite scroll/pagination
- Empty state

### Implementation Details

**Activity Types**:
1. **Bill Created** - Terracotta icon, neutral text
2. **Payment Made** - Sage icon, positive text
3. **Reminder Sent** - Amber icon, pending text
4. **Bill Settled** - Sage icon with checkmark, positive text

**Timeline Design**:
- Group by date (Today, Yesterday, This Week, Earlier)
- Date headers with sticky positioning
- Activity cards with icon, description, amount, timestamp
- Tap to navigate to BillDetail or FriendDetail

**Filters**:
- All activity (default)
- This month
- Last month
- Settled only
- Unsettled only

**Technical Approach**:
- Rename file and update all imports
- Add activity type field to history items
- Implement date grouping logic
- FlashList for virtualization
- Enhanced search with type filtering

**Files to Modify**:
- `src/screens/BillHistoryScreen.tsx` → `src/screens/ActivityScreen.tsx` (major refactor)
- `src/stores/historyStore.ts` - Add activity type and grouping logic
- `src/navigation/AppNavigator.tsx` - Update import and screen name
- All files importing BillHistoryScreen

**Files to Create**:
- `src/components/ActivityCard.tsx` (~150 lines) - activity item component
- `src/components/DateGroupHeader.tsx` (~80 lines) - sticky date header

**Design Reference**:
- Layout: Timeline view with date grouping
- Colors: Activity type color coding from DESIGN_GUIDE.md
- Empty State: `claudedocs/ILLUSTRATION_SPECS.md` (No Activity illustration)

## Component Implementation Priority

### Day 1-2 (Onboarding + Dashboard)
Implement these components from `COMPONENT_AUDIT.md`:
1. **BalanceCard** (lines 110-236) - Dashboard hero
2. **TransactionCard** (lines 238-364) - Recent activity
3. **QuickAmountButtons** (lines 1039-1137) - Quick actions (optional, can defer)

### Day 4 (Navigation)
4. **TabBar** (lines 919-1037) - Bottom navigation

### Day 5 (Activity Feed)
5. **EmptyState** (lines 662-748) - No activity state
6. **SearchInput** (lines 750-848) - Enhanced search (optional, existing search may suffice)

### Deferred to Week 13
- FriendCard (lines 366-492) - Friends Screen
- StatusBadge (lines 494-586) - Friend balances
- ProgressBar (lines 588-660) - Friend detail
- Avatar (lines 750-848) - Friend photos
- BottomSheet (lines 850-917) - Settle up modal
- RadioGroup, Checkbox (lines 1139-1295) - Settings enhancements

## Integration Checklist

### Store Integration
- [ ] `billStore.getNetBalance()` - Dashboard balance calculation
- [ ] `historyStore.getRecentActivity(5)` - Dashboard activity preview
- [ ] `settingsStore.onboardingCompleted` - First launch detection
- [ ] `historyStore` activity types and grouping

### Navigation Integration
- [ ] Bottom Tabs navigator setup
- [ ] Stack navigators for each tab
- [ ] Type-safe navigation params
- [ ] Deep linking structure (prepare for future)

### Animation Integration
- [ ] Entry animations: FadeInDown for onboarding, FadeIn for dashboard cards
- [ ] Interactive: Tab press with scale + haptics
- [ ] Progress: Balance card flip animation (optional)

### Design Token Integration
- [ ] All components use `tokens.colors.*`
- [ ] All spacing uses `tokens.spacing.*`
- [ ] All typography uses `tokens.typography.*`
- [ ] All animations use `tokens.animations.*`

## Testing Strategy

### Unit Tests
- [ ] Balance calculation logic (billStore)
- [ ] Activity grouping logic (historyStore)
- [ ] Date formatting utilities
- [ ] Navigation type safety

### Manual Testing
- [ ] Onboarding flow (first launch)
- [ ] Skip onboarding (all screens)
- [ ] Dashboard balance accuracy
- [ ] Quick actions navigation
- [ ] Tab switching smoothness
- [ ] Activity timeline grouping
- [ ] Filter functionality
- [ ] Pull-to-refresh

### Visual QA
- [ ] Earthen color consistency
- [ ] Typography hierarchy
- [ ] Spacing consistency (8-point grid)
- [ ] Animation smoothness (60fps)
- [ ] Glass-morphism effects
- [ ] Haptic feedback

## Success Criteria

✅ Onboarding flow complete with 4-6 screens  
✅ Dashboard screen implemented with balance cards  
✅ Bottom tab navigation working (5 tabs)  
✅ Activity feed redesigned with timeline view  
✅ All screens use new design system tokens  
✅ Smooth animations and transitions  
✅ TypeScript and ESLint validation passing  

## Dependencies

**NPM Packages to Install**:
```bash
npm install @react-navigation/bottom-tabs
# OR
npx expo install @react-navigation/bottom-tabs
```

**Files to Reference**:
- `claudedocs/ILLUSTRATION_SPECS.md` - All illustration specs
- `claudedocs/COMPONENT_AUDIT.md` - Component APIs and specs
- `claudedocs/ANIMATION_SPECS.md` - Animation patterns and code
- `docs/DESIGN_GUIDE.md` - Design system reference
- `src/theme/tokens.ts` - Design token implementation

## Common Patterns

### Screen Structure
```typescript
import { tokens } from '@/theme/tokens';
import { useAnimatedStyle, FadeIn } from '@/utils/animations';

export const ScreenName = () => {
  // 1. State management (Zustand stores)
  const data = useStore(state => state.data);
  
  // 2. Animations
  const animatedStyle = useFadeInDown(0);
  
  // 3. Event handlers
  const handleAction = () => {
    triggerHaptic('medium');
    // Action logic
  };
  
  // 4. Render
  return (
    <GlassCard style={animatedStyle}>
      {/* Content using tokens.* */}
    </GlassCard>
  );
};
```

### Component Props Pattern
```typescript
interface ComponentProps {
  /** Brief description */
  data: DataType;
  /** Callback description */
  onAction: () => void;
  /** Optional style override */
  style?: ViewStyle;
  /** Optional loading state */
  loading?: boolean;
}
```

### Animation Pattern
```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(visible ? 1 : 0, {
    duration: tokens.animations.timing.standard,
  }),
  transform: [{
    translateY: withSpring(visible ? 0 : -20, tokens.animations.spring.gentle)
  }],
}));
```

## Notes

- All illustrations reference ILLUSTRATION_SPECS.md (don't create actual SVGs yet)
- Use placeholder icons (emoji or text) for Week 12, add proper icons in Week 15
- Dashboard becomes new home screen (BillHistory moves to Activity tab)
- Focus on functionality over pixel-perfect polish (Week 15 for polish)
- Maintain 60fps animations on all screens
- Test on physical device frequently (OnePlus 13 or similar)
