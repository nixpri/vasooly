# Essential Development Commands

## Development

### Start Development Server
```bash
npm start              # Start Metro bundler with QR code
npm run android        # Launch on Android device/emulator
npm run ios            # Launch on iOS simulator
npm run web            # Launch in web browser
```

### Quick Start (From Fresh Clone)
```bash
git clone <repo-url>
cd vasooly
npm install
npm start              # Then scan QR or press 'a' for Android
```

## Testing

### Unit Tests
```bash
npm test                    # Run all tests (watch mode off)
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run with coverage report (text, HTML, LCOV)
npm run test:ci             # CI mode (no watch, max 2 workers)
```

### E2E Tests (Detox - After Installation)
```bash
npm run e2e:build:android   # Build Android debug APK
npm run e2e:test:android    # Run E2E tests on Android emulator
npm run e2e:build:ios       # Build iOS debug app
npm run e2e:test:ios        # Run E2E tests on iOS simulator
```

**Note**: Detox configured but not yet installed. Run `npm install detox` first.

## Code Quality

### Full Validation (Pre-Commit)
```bash
npm run validate            # Runs: typecheck + lint + test:coverage
```
**Use this before every commit!**

### Individual Quality Checks
```bash
npm run typecheck           # TypeScript compilation check (no emit)
npm run lint                # ESLint check (report issues)
npm run lint:fix            # ESLint with auto-fix
```

## Git Workflow

### Branch Strategy
```bash
git status                  # Always check before starting work
git branch                  # Verify you're on correct branch (main)
git checkout -b feature/my-feature  # Create feature branch
```

### Quality Check Before Commit
```bash
npm run validate            # MANDATORY before commit
git add .
git commit -m "feat: description"
git push origin feature/my-feature
```

## Development Workflow

### Typical Day
1. `git pull origin main` - Get latest changes
2. `git checkout -b feature/xyz` - Create feature branch
3. `npm start` - Start dev server
4. Write code + tests
5. `npm run validate` - Check quality
6. `git commit` - Commit changes
7. Test on device (scan QR from `npm start`)

### Testing on Physical Device
```bash
npm start                   # Start Metro
# Scan QR code with Expo Go app
# OR press 'a' for Android emulator
```

**Current Build**: Opens UPIValidationScreen for device testing

## Troubleshooting

### Clear Cache
```bash
npm start -- --clear        # Clear Metro bundler cache
rm -rf node_modules .expo   # Nuclear option (then npm install)
```

### Fix Dependencies
```bash
npm install                 # Reinstall packages
npm audit fix               # Fix security vulnerabilities
```

### Check Everything
```bash
npm run validate            # Runs all quality checks at once
```

## CI/CD (GitHub Actions)

### Automated Checks (On Push/PR)
- Lint and TypeCheck
- Unit Tests with Coverage (uploads to Codecov)
- Build Android APK
- Build iOS
- Security Scan (npm audit)

### Manual Trigger
Push to `main` or `develop` branch, or create a Pull Request.

## Platform-Specific Commands

### macOS (Darwin)
- **List files**: `ls -la`
- **Find files**: Use `Glob` tool, not `find` command
- **Search content**: Use `Grep` tool, not `grep` command
- **Git**: Standard git commands work
- **Permissions**: May need `chmod +x` for scripts

## Performance Profiling

### Android
```bash
adb shell dumpsys gfxinfo <package> > performance.txt  # Frame stats
adb logcat | grep -i performance                       # Performance logs
```

### iOS (Xcode Instruments)
Open Xcode → Product → Profile → Choose Instruments template

## Database Management (SQLite)

### View Database (Development)
```bash
# Expo Go: Database is in app sandbox, hard to access
# Production Build: Use adb pull or iOS tools
adb pull /data/data/<package>/databases/bills.db
sqlite3 bills.db
```

### Reset Database (Development)
1. Uninstall app from device
2. Reinstall with `npm run android` or `npm run ios`

## Documentation

### Key Documents (Read in Order)
1. `README.md` - Project overview (15 min)
2. `docs/SYSTEM_DESIGN.md` - Architecture (60 min)
3. `docs/IMPLEMENTATION_PLAN.md` - 18-week roadmap (30 min)
4. `PROJECT_STATUS.md` - Current progress

### Specialized Guides
- `docs/DATABASE_SETUP.md` - Encryption setup
- `docs/UPI_INTEGRATION.md` - UPI implementation
- `docs/TESTING.md` - Testing strategy
- `claudedocs/UPI_APPS_RESEARCH_2025.md` - UPI apps research

## Quick Quality Check (Every Commit)
```bash
npm run validate && echo "✅ Ready to commit!"
```
