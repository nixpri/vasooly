# Vasooly - Testing Guide

## ✅ Day 1-2 Implementation Complete

All systems tested and operational. Here's how to verify everything works.

---

## Quick Verification (2 minutes)

Run these commands to verify the setup:

```bash
# 1. Type checking
npm run typecheck
# Expected: No output = success ✅

# 2. Linting
npm run lint
# Expected: No output = success ✅

# 3. Test suite
npm test
# Expected: Test Suites: 2 passed, Tests: 10 passed ✅

# 4. Git status
git status
# Expected: "nothing to commit, working tree clean" ✅
```

---

## Complete Test Suite

### 1. Run All Tests
```bash
npm test
```

**Expected Output**:
```
PASS src/__tests__/example.test.ts
PASS src/lib/business/splitEngine.test.ts

Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        ~0.5s
```

### 2. Run Tests with Coverage
```bash
npm run test:coverage
```

**Expected Output**:
```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |     100 |      100 |     100 |     100 |
 lib/business    |     100 |      100 |     100 |     100 |
  splitEngine.ts |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|-------------------
```

### 3. Watch Mode for Development
```bash
npm run test:watch
```

Press `a` to run all tests, or let it auto-run on file changes.

---

## Testing the Split Engine

The split engine is fully implemented and tested. Here's what it does:

### Core Functionality

**Equal Split Algorithm** (`splitEqual`):
- Divides amount equally among participants
- Uses integer paise (not floats) for precision
- Distributes remainder to first shares

Example:
```typescript
splitEqual(10000, 3)  // ₹100.00 ÷ 3
// Returns: [3334, 3333, 3333] paise
// = [₹33.34, ₹33.33, ₹33.33]
```

**Test Coverage**:
- ✅ Even division (300 ÷ 3 = [100, 100, 100])
- ✅ Remainder handling (100 ÷ 3 = [34, 33, 33])
- ✅ Single participant (500 ÷ 1 = [500])
- ✅ Zero amount (0 ÷ 3 = [0, 0, 0])
- ✅ Invalid count error (count ≤ 0)
- ✅ Negative amount error (amount < 0)
- ✅ Detailed split result
- ✅ Currency formatting (10000 paise → "₹100.00")
- ✅ Unit conversion (₹100 → 10000 paise)

---

## Testing the App Shell

### Start Development Server
```bash
npm start
```

Choose a platform:
- Press `i` → iOS Simulator (macOS only)
- Press `a` → Android Emulator (requires Android Studio)
- Press `w` → Web Browser (quick preview)

**Expected Result**:
- Dark background (#0F172A)
- "Vasooly" title in white
- "UPI Bill Splitter" subtitle in gray
- "✅ Project Initialized" status in green

---

## Code Quality Checks

### TypeScript Type Checking
```bash
npm run typecheck
```

**What it checks**:
- Type correctness across all `.ts` and `.tsx` files
- Strict mode enabled (no implicit any)
- Path aliases (`@/` → `src/`)

**Expected**: No errors (silent output = success)

### ESLint Code Style
```bash
npm run lint
```

**What it checks**:
- TypeScript best practices
- Unused variables (with `_` prefix exemption)
- Code style consistency

**Expected**: No warnings or errors

**Auto-fix issues**:
```bash
npm run lint:fix
```

---

## Project Structure Validation

Verify all directories exist:

```bash
ls -R src/
```

**Expected Structure**:
```
src/
├── __tests__/              ✅ Tests
│   └── example.test.ts
├── components/             ✅ Ready for UI components
├── lib/
│   ├── business/          ✅ Business logic (splitEngine)
│   │   ├── .gitkeep
│   │   ├── splitEngine.ts
│   │   └── splitEngine.test.ts
│   ├── data/              ✅ Ready for database
│   │   └── .gitkeep
│   └── platform/          ✅ Ready for native modules
│       └── .gitkeep
├── screens/               ✅ Ready for UI screens
├── stores/                ✅ Ready for Zustand stores
├── types/                 ✅ TypeScript types
│   └── index.ts
└── utils/                 ✅ Ready for utilities
```

---

## Dependency Verification

Check installed packages:

```bash
npm list --depth=0
```

**Core Dependencies** (should be present):
- ✅ `zustand@^5.0.8` - State management
- ✅ `expo-sqlite@~16.0.8` - Database
- ✅ `expo-secure-store@~15.0.7` - Encryption keys
- ✅ `react-native-reanimated@^4.1.3` - Animations
- ✅ `@shopify/flash-list@^2.1.0` - Virtualized lists
- ✅ `expo-contacts@~15.0.9` - Contact picker
- ✅ `expo-sharing@~14.0.7` - Share functionality
- ✅ `react-native-svg@^15.14.0` - QR codes

**Dev Dependencies**:
- ✅ `jest@^30.2.0` - Testing
- ✅ `jest-expo@^54.0.12` - Expo Jest preset
- ✅ `@testing-library/react-native@^13.3.3` - Component testing
- ✅ `@typescript-eslint/*@^8.46.1` - TypeScript linting
- ✅ `eslint@^9.37.0` - Code linting

---

## Git Verification

### Check Commit
```bash
git log -1 --oneline
```

**Expected**:
```
f2e227c Initial project setup - Day 1-2 Complete
```

### Check Files Committed
```bash
git show --stat HEAD
```

**Expected**: 21 files changed, including:
- ✅ PROJECT_STATUS.md
- ✅ README.md
- ✅ docs/SYSTEM_DESIGN.md
- ✅ docs/IMPLEMENTATION_PLAN.md
- ✅ src/lib/business/splitEngine.ts
- ✅ src/lib/business/splitEngine.test.ts
- ✅ All configuration files

---

## Performance Benchmarks

### Test Execution Speed
```bash
time npm test
```

**Expected**: < 1 second for all tests

### Type Checking Speed
```bash
time npm run typecheck
```

**Expected**: < 5 seconds

---

## Troubleshooting

### Issue: Tests failing with Expo import errors
**Solution**: Already fixed! `jest.setup.js` mocks Expo modules.

### Issue: ESLint not finding config
**Solution**: Already fixed! Using `eslint.config.mjs` for ESLint v9.

### Issue: TypeScript path aliases not working
**Solution**: Already configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Success Criteria ✅

All checks must pass:

- [x] **TypeScript**: No type errors
- [x] **ESLint**: No linting warnings
- [x] **Tests**: 10/10 passing (2 suites)
- [x] **Coverage**: 100% on split engine
- [x] **Git**: Clean working tree, 1 commit
- [x] **Structure**: All directories created
- [x] **Dependencies**: All packages installed
- [x] **App**: Runs and displays correctly

---

## Next Steps

After verifying everything works:

1. **Day 3-4**: Database encryption setup (CRITICAL)
   - Configure SQLCipher
   - Create database schema
   - Implement data access layer

2. **Day 5-7**: UPI integration
   - UPI link generator
   - QR code generation
   - Device testing matrix

---

## Quick Reference Commands

```bash
# Development
npm start              # Start dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Quality
npm run typecheck      # Type checking
npm run lint           # Code linting
npm run lint:fix       # Auto-fix lint issues

# Git
git status             # Check status
git log --oneline -5   # Recent commits
```

---

**Status**: ✅ All systems operational
**Last Verified**: 2025-10-17
**Next Milestone**: Day 3-4 Database Setup
