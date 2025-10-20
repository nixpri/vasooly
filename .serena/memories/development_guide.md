# Vasooly Development Guide

**Last Updated**: 2025-10-21
**Purpose**: Quick reference for common development patterns and decisions

---

## Critical Patterns

### Metro Bundler Asset Paths ⚠️ IMPORTANT

**Problem**: TypeScript path aliases don't work with Metro's `require()`

```typescript
// ❌ WRONG - Metro bundler can't resolve TypeScript aliases
import { Image } from 'react-native';
<Image source={require('@/assets/image.png')} />

// ✅ RIGHT - Use relative paths for require()
<Image source={require('../../assets/image.png')} />

// ✅ ALSO RIGHT - TypeScript imports can still use aliases
import { Component } from '@/components';
import { tokens } from '@/theme/tokens';
```

**Why**:
- TypeScript path aliases (`@/` → `src/*`) work at **compile-time** for imports
- Metro bundler resolves `require()` at **runtime** using Node.js resolution
- `require()` needs relative or absolute paths, not TypeScript aliases

**When to Use Each**:
- **Relative paths**: For `require()` with assets (images, fonts, etc.)
- **`@/` alias**: For TypeScript imports (components, utilities, types)

**Alternative Solution** (Not Implemented):
- Configure `babel-plugin-module-resolver` in `babel.config.js`
- More complex, adds dependency, requires Metro cache clearing
- Relative paths are simpler and standard React Native practice

---

## Component Patterns

### Illustration/Image Components

**Best Practice**: Create wrapper components for reusable images

```typescript
// ✅ Good - Wrapper component with relative path
export const WelcomeIllustration: React.FC<{ size?: number }> = ({ 
  size = 280 
}) => (
  <View style={{ width: size, height: size }}>
    <Image
      source={require('../../assets/illustrations/welcome.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  </View>
);

// ❌ Bad - Direct require in multiple places
<Image source={require('../../assets/illustrations/welcome.png')} />
```

**Benefits**:
- Single source of truth for asset paths
- Easy to add animations or styling later
- Type-safe props interface
- Centralized export from `components/index.ts`

### Animation Components

**Pattern**: Use Reanimated 3 worklets for 60fps animations

```typescript
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { tokens } from '@/theme/tokens';

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ 
    scale: withSpring(isActive ? 1.2 : 1, tokens.animation.spring.gentle) 
  }],
  opacity: withSpring(isActive ? 1 : 0.4, tokens.animation.spring.gentle),
}));

return <Animated.View style={animatedStyle}>{children}</Animated.View>;
```

**Key Points**:
- Always use `tokens.animation.*` for consistency
- Use `withSpring` for natural motion, `withTiming` for linear
- Keep animations at 60fps by using worklets (no JS thread blocking)

---

## Store Patterns

### Zustand State Management

**Pattern**: Selector functions for derived state

```typescript
// ✅ Good - Selector function
const useStore = create<StoreState>((set, get) => ({
  items: [],
  getFilteredItems: (query: string) => 
    get().items.filter(item => item.name.includes(query)),
}));

// Usage
const filteredItems = useStore(state => state.getFilteredItems('search'));
```

**Benefits**:
- Centralized logic, not scattered across components
- Easy to test in isolation
- Reusable across multiple components

### State Persistence

**Pattern**: SecureStore for sensitive data, regular storage for preferences

```typescript
import * as SecureStore from 'expo-secure-store';

// ✅ Sensitive data (UPI VPA, auth tokens)
await SecureStore.setItemAsync('vpa', vpaValue);

// ✅ User preferences (non-sensitive)
const settingsStore = create(
  persist(
    (set) => ({ theme: 'light', ... }),
    { name: 'settings-storage' }
  )
);
```

---

## Navigation Patterns

### Conditional Initial Routes

**Pattern**: Navigate based on app state (onboarding, auth, etc.)

```typescript
// AppNavigator.tsx
const { onboardingCompleted } = useSettingsStore();

<Stack.Navigator
  initialRouteName={onboardingCompleted ? 'Main' : 'Onboarding'}
>
  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  <Stack.Screen name="Main" component={MainScreen} />
</Stack.Navigator>
```

### Preventing Back Navigation

**Pattern**: Use `replace` navigation for one-way flows

```typescript
// ✅ Good - Prevents back to onboarding
navigation.replace('Main');

// ❌ Bad - User can go back to onboarding
navigation.navigate('Main');
```

**When to Use**:
- Onboarding completion
- Authentication success
- Logout (back to login)

---

## Design System Integration

### Using Design Tokens

**Always use tokens, never hardcode values**

```typescript
import { tokens } from '@/theme/tokens';

// ✅ Good - Uses design tokens
const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.background.base,
    padding: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
  },
  title: {
    fontSize: tokens.typography.h1.fontSize,
    fontWeight: tokens.typography.h1.fontWeight,
    color: tokens.colors.text.primary,
  },
});

// ❌ Bad - Hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F7',
    padding: 24,
    borderRadius: 12,
  },
});
```

**Token Categories**:
- `tokens.colors.*` - All colors (brand, background, text, etc.)
- `tokens.spacing.*` - Spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- `tokens.typography.*` - Typography styles (display, h1-h6, body, etc.)
- `tokens.radius.*` - Border radius (sm, md, lg, xl, full)
- `tokens.shadows.*` - Elevation shadows (sm, md, lg)
- `tokens.animation.*` - Animation configs (spring, timing)

### Earthen Color Palette

**Primary Colors**:
- **Terracotta** (#CB6843) - Primary brand, CTAs, active states
- **Olive Green** (#6B7C4A) - Success, positive actions, checkmarks
- **Warm Neutrals** (#FAF9F7 to #342E28) - Backgrounds, text

**Usage**:
- `tokens.colors.brand.primary` - Terracotta
- `tokens.colors.brand.secondary` - Olive Green
- `tokens.colors.background.base` - Warm white (#FAF9F7)
- `tokens.colors.text.primary` - Dark brown (#342E28)

---

## Testing Patterns

### Component Testing

**Pattern**: Test user interactions, not implementation

```typescript
import { render, fireEvent } from '@testing-library/react-native';

test('button calls onPress when tapped', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button onPress={onPress}>Tap Me</Button>);
  
  fireEvent.press(getByText('Tap Me'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

### Store Testing

**Pattern**: Test store logic in isolation

```typescript
import { renderHook, act } from '@testing-library/react-hooks';

test('adds bill to store', () => {
  const { result } = renderHook(() => useBillStore());
  
  act(() => {
    result.current.addBill({ title: 'Test', amount: 1000 });
  });
  
  expect(result.current.bills).toHaveLength(1);
  expect(result.current.bills[0].title).toBe('Test');
});
```

---

## Performance Optimization

### Image Optimization

**Current**: PNG format (~6.2MB for 6 onboarding illustrations)

**Future Optimization**:
```typescript
// Option 1: WebP format (30-50% smaller)
// Convert: cwebp -q 80 input.png -o output.webp
<Image source={require('../../assets/illustrations/welcome.webp')} />

// Option 2: Lazy loading for non-visible content
const [imageLoaded, setImageLoaded] = useState(false);
useEffect(() => {
  if (isVisible) setImageLoaded(true);
}, [isVisible]);
```

### List Rendering

**Always use FlashList for large lists**

```typescript
import { FlashList } from '@shopify/flash-list';

// ✅ Good - Virtualized, 60fps
<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={80}
/>

// ❌ Bad - Renders all items, slow on large lists
<ScrollView>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</ScrollView>
```

---

## Common Pitfalls & Solutions

### 1. Metro Bundler Cache Issues

**Symptom**: Changes not reflected, or build errors after updates

**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# OR
rm -rf node_modules/.cache
```

### 2. TypeScript Path Alias Not Working

**Symptom**: Import errors with `@/` in new files

**Solution**:
```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

# Check tsconfig.json has correct paths configuration
```

### 3. Reanimated Animations Lagging

**Symptom**: Animations running at <60fps

**Solution**:
```typescript
// ✅ Use worklets (runs on UI thread)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(value) }]
}));

// ❌ Don't use regular state (runs on JS thread)
const [scale, setScale] = useState(1);
```

---

## Git Workflow

### Commit Message Convention

**Pattern**: `type(scope): description`

```bash
# Feature additions
git commit -m "feat(onboarding): integrate 6 PNG illustrations"
git commit -m "feat(dashboard): add balance overview card"

# Bug fixes
git commit -m "fix(metro): use relative paths for asset requires"
git commit -m "fix(navigation): prevent back to onboarding screen"

# Documentation
git commit -m "docs(readme): update installation instructions"
git commit -m "docs(changelog): add Week 12 Day 1-2 completion"

# Chores (no production code change)
git commit -m "chore(deps): update expo-sdk to 54.0.0"
git commit -m "chore(lint): fix ESLint warnings"
```

### Before Committing

**Checklist**:
```bash
# 1. Run validations
npm run typecheck  # 0 errors required
npm run lint       # 0 errors required (warnings OK)
npm test          # All tests passing

# 2. Check git status
git status         # Review changed files
git diff          # Review actual changes

# 3. Stage and commit
git add .
git commit -m "feat(scope): description"

# 4. Push to remote
git push origin main
```

---

## Environment Setup

### Required Tools
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Expo CLI 6+ (`npm install -g expo-cli`)
- iOS: Xcode 14+ (Mac only)
- Android: Android Studio (with SDK 33+)

### Recommended VS Code Extensions
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - IntelliSense
- **React Native Tools** - Debugging
- **Path Intellisense** - Path autocomplete

---

## Quick Reference Commands

```bash
# Development
npm run typecheck              # TypeScript validation
npm test                      # Run all tests
npm run lint                  # ESLint validation
npx expo start                # Start dev server
npx expo start --clear        # Clear cache and start

# Testing
npm test -- --coverage        # Test with coverage
npm test -- --watch          # Watch mode
npm test -- filename.test.ts  # Single file

# Building
npx expo run:android          # Build Android
npx expo run:ios             # Build iOS (Mac only)

# Debugging
npx react-native log-android  # Android logs
npx react-native log-ios     # iOS logs
```

---

**Last Updated**: 2025-10-21
**Status**: Active development guide
**Next Update**: When new patterns emerge
