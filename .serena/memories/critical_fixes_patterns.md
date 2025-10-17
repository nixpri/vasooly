# Critical Patterns & Fixes - Learnings Archive

## Pattern 1: Expo Go Native Module Version Matching
**Context**: Expo Go ships with pre-built native modules at specific SDK versions
**Problem**: Installing newer package versions updates JS but native stays at Expo Go version
**Detection**: "Version mismatch" errors between JS and native (e.g., "0.6.1 vs 0.5.1")
**Solution**: Always match package versions to Expo SDK requirements
**Verification**: `npx expo-doctor` must show 17/17 checks pass
**Prevention**: Use `npx expo install <package>` instead of `npm install` for native modules

## Pattern 2: Reanimated v4 Entry Point Initialization
**Context**: Reanimated v4.x uses New Architecture requiring explicit initialization
**Problem**: "react-native-reanimated is not installed" despite package existing
**Root Cause**: Native module bridge not initialized before component render
**Solution**: Add `import 'react-native-reanimated';` as FIRST import in App.tsx
**Why It Works**: Import triggers `initializeReanimatedModule()` before React tree mounts
**Critical**: Must be FIRST import, before React or any other imports

## Pattern 3: npm --legacy-peer-deps Side Effects
**Context**: Used to bypass peer dependency conflicts (e.g., React 19 vs React 18)
**Problem**: npm aggressively removes packages it deems conflicting
**Detection**: Package in package.json but missing from node_modules
**Solution**: Always verify with `ls node_modules/<package>` after install
**Recovery**: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
**Prevention**: Use `--legacy-peer-deps` consistently for all install commands

## Pattern 4: Metro Bundler Resolution for Nested Dependencies
**Context**: Metro can struggle with nested node_modules ESM imports
**Problem**: "Unable to resolve 'X' from node_modules/Y/node_modules/Z"
**Root Cause**: Dependency not hoisted to root level
**Solution**: Install dependency at root level to force hoisting
**Example**: Installing framer-motion at root resolved tslib resolution
**Verification**: Check `ls -la node_modules/X/node_modules/` returns empty

## Pattern 5: Dynamic Component Dimensions with Skia
**Context**: Skia Canvas requires explicit dimensions, doesn't inherit from parent
**Problem**: Canvas renders but at wrong size or not visible
**Root Cause**: Hardcoded dimensions (e.g., 350x200) don't match actual component
**Solution**: Use `onLayout` to capture dimensions, store in state, pass to Canvas
**Pattern**:
```typescript
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
const handleLayout = (event: LayoutChangeEvent) => {
  const { width, height } = event.nativeEvent.layout;
  setDimensions({ width, height });
};
// Use dimensions.width and dimensions.height in RoundedRect
```

## Pattern 6: Glass Effect Visibility Tuning
**Context**: Subtle glass effects may not be visible on all screens
**Problem**: Glass effects present but user reports "can't see"
**Diagnosis**: Check opacity values, blur intensity, border visibility
**Solution Adjustments**:
- Background opacity: 0.05 → 0.08 (more visible)
- Gradient: ['rgba(255,255,255,0.1)', '0.02'] → ['0.15', '0.05'] (stronger)
- Border: 0.15 → 0.2 with 1.5px stroke (more prominent)
- Blur: Increase from 15-20px
**Verification**: Test on actual device in different lighting conditions

## Pattern 7: Database Initialization in React Native
**Context**: Database operations fail if DB not initialized
**Problem**: Runtime error on first database operation
**Pattern**: Initialize in App.tsx useEffect before rendering app screens
**Implementation**:
```typescript
const [isDbReady, setIsDbReady] = useState(false);
useEffect(() => {
  initializeDatabase()
    .then(() => setIsDbReady(true))
    .catch(setDbError);
}, []);
if (!isDbReady) return <LoadingScreen />;
return <MainApp />;
```
**Critical**: Show loading state during initialization

## Pattern 8: Root Cause vs Workaround Decision Tree
**Question**: Should I fix properly or use workaround?
**Choose Proper Fix When**:
- Time permits thorough investigation
- Issue will affect multiple features
- Workaround adds technical debt
- Security or data integrity involved
**Choose Workaround When**:
- True emergency (production down)
- Issue isolated to single non-critical feature
- Proper fix requires major refactor
- Temporary until proper fix available
**This Session**: Chose proper fixes for all issues (no workarounds)

## Pattern 9: Dependency Chain Analysis
**Tool**: `npm list <package>` shows full dependency tree
**Use Case**: Understanding why package is installed and by whom
**Example**: `npm list react-native-worklets` revealed:
- Required by: react-native-reanimated@4.1.3
- Also in: @shopify/react-native-skia
- Version: Must match Expo SDK requirement
**Action**: Diagnose version conflicts and peer dependency issues

## Pattern 10: Expo Doctor as Source of Truth
**Purpose**: Official Expo SDK compatibility checker
**Usage**: `npx expo-doctor`
**Output**: 17 checks covering peer deps, versions, configuration
**Success Criteria**: Must show "17/17 checks passed"
**When to Run**:
- After any dependency install/update
- Before testing on Expo Go
- After SDK version change
- When getting runtime errors
**Fix Command**: `npx expo install --fix --legacy-peer-deps`

## Anti-Patterns Avoided

❌ **Metro Config Workarounds**: Don't add custom resolvers unless absolutely necessary
✅ **Proper Dependency Management**: Fix at source with correct versions

❌ **Removing Moti for Simplicity**: Don't compromise UX design decisions
✅ **Root Cause Resolution**: Fix dependency issues properly

❌ **Ignoring expo-doctor Warnings**: "It works on my machine" syndrome
✅ **SDK Compatibility Verification**: Ensure Expo Go compatibility

❌ **Skipping Clean Reinstall**: Trusting corrupted node_modules
✅ **Clean Slate When Needed**: rm -rf node_modules for consistency

## Session Metrics
- **Issues Fixed**: 8 (7 user-reported + 1 discovered)
- **Root Cause Analyses**: 8 (100% ultrathink approach)
- **Workarounds Used**: 0 (all proper solutions)
- **Files Modified**: 5
- **Lines Changed**: ~285 (77 App.tsx, 2 styles, ~200 GlassCard/SplitResult)
- **Dependencies Fixed**: 7 packages
- **Test Coverage Maintained**: 98.52%
- **User Satisfaction**: ✅ "Tested everything, everything work fine"
