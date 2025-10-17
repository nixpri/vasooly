# Task Completion Checklist

## Before Marking Any Task Complete

### 1. Code Quality ✅
- [ ] TypeScript compilation passes: `npm run typecheck`
- [ ] No ESLint errors or warnings: `npm run lint`
- [ ] All tests passing: `npm test`
- [ ] Test coverage maintained/improved: `npm run test:coverage`

### 2. Full Validation (MANDATORY)
```bash
npm run validate
```
This runs: `typecheck && lint && test:coverage`

**Rule**: Never commit without green validate check!

### 3. Testing Requirements

#### Unit Tests (Required)
- [ ] New code has unit tests
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] 100% coverage for business logic
- [ ] 100% coverage for data layer

#### Integration Tests (As Needed)
- [ ] Component integration tested
- [ ] Native module integration tested
- [ ] Database operations tested

#### E2E Tests (Critical Flows Only)
- [ ] User journey tested (if applicable)
- [ ] UPI flow validated (if applicable)

### 4. Documentation

#### Code Documentation
- [ ] JSDoc comments for exported functions
- [ ] Complex logic explained with comments
- [ ] README updated (if public API changed)
- [ ] Type definitions accurate

#### Project Documentation
- [ ] PROJECT_STATUS.md updated with progress
- [ ] Relevant docs/*.md updated
- [ ] Breaking changes noted
- [ ] Examples provided for new features

### 5. Git Hygiene

#### Before Commit
```bash
git status                  # Check what's staged
git diff                    # Review changes
npm run validate            # Quality check
git add <files>             # Stage specific files
git commit -m "type: description"
```

#### Commit Message Format
```
type: brief description (50 chars max)

Detailed explanation if needed (wrap at 72 chars)

- Bullet points for details
- What changed and why
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### 6. Performance Checks (Critical Features)

#### Animation Code
- [ ] 60fps maintained (profile with tools)
- [ ] No jank on mid-range devices
- [ ] Worklets used correctly

#### Database Operations
- [ ] Transactions used for batch ops
- [ ] Queries optimized (<50ms average)
- [ ] Proper indexing

#### List Rendering
- [ ] FlashList used (not FlatList)
- [ ] Items memoized
- [ ] keyExtractor optimized

### 7. Security Review (Data/Privacy Features)

#### Encryption
- [ ] Sensitive data encrypted
- [ ] Keys stored in OS Keychain
- [ ] No plaintext storage

#### Validation
- [ ] User inputs validated
- [ ] SQL injection prevented (use prepared statements)
- [ ] XSS prevented (if web views)

### 8. Accessibility (UI Components)

- [ ] Screen reader labels
- [ ] Touch targets ≥44x44 points
- [ ] Color contrast ratios met
- [ ] Focus order logical

### 9. Error Handling

- [ ] User-facing errors have helpful messages
- [ ] Errors logged with context
- [ ] Graceful degradation for failures
- [ ] Network errors handled

### 10. Cross-Platform Testing

#### iOS
- [ ] Tested on iOS simulator
- [ ] UI renders correctly
- [ ] Native modules work

#### Android
- [ ] Tested on Android emulator or device
- [ ] UI renders correctly
- [ ] Native modules work
- [ ] Back button behavior correct

## Quick Checklist (Every Commit)

```bash
npm run validate     # ← MANDATORY
git status           # ← Verify changes
git add .            # ← Stage files
git commit -m "..."  # ← Descriptive message
```

## Pre-Release Checklist (Phase Completion)

### Phase Completion
- [ ] All phase tasks completed
- [ ] Full test suite passing (100%)
- [ ] Documentation updated
- [ ] PROJECT_STATUS.md updated
- [ ] No known blockers
- [ ] Security review passed
- [ ] Performance benchmarks met

### Beta Release
- [ ] All above checks
- [ ] E2E tests passing
- [ ] Beta testing plan ready
- [ ] Rollback plan documented
- [ ] Monitoring in place

### Production Release
- [ ] All above checks
- [ ] App store assets ready
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Support documentation ready
- [ ] Crash reporting enabled
- [ ] Analytics configured

## Troubleshooting Failed Checks

### TypeCheck Fails
```bash
npm run typecheck    # See errors
# Fix type errors, don't use 'any' or @ts-ignore
```

### Lint Fails
```bash
npm run lint:fix     # Auto-fix if possible
npm run lint         # Check remaining issues
```

### Tests Fail
```bash
npm test             # Run all tests
npm test -- src/path/to/file.test.ts  # Run specific test
npm run test:watch   # Watch mode for debugging
```

### Coverage Drop
```bash
npm run test:coverage  # See coverage report
open coverage/lcov-report/index.html  # Visual report
# Add tests for uncovered lines
```

## Emergency Rollback

### If commit breaks things
```bash
git log --oneline    # Find last good commit
git revert <hash>    # Create revert commit
npm run validate     # Verify rollback works
```

### If pushed to main
```bash
git revert <hash>
git push origin main
# Notify team immediately
```

## Quality Gates (Automated - GitHub Actions)

All of these run automatically on push/PR:
1. Lint and TypeCheck
2. Unit Tests + Coverage
3. Build Android APK
4. Build iOS
5. Security Scan (npm audit)

**If CI fails**: Fix before merge, don't skip!
