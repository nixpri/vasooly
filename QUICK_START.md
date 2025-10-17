# Vasooly - Quick Start Guide

**Phase 0 Complete!** This guide covers device testing and validation for UPI and performance features.

---

## Prerequisites

- Node.js 20+ installed
- Android device or emulator
- USB debugging enabled (for physical devices)
- ADB installed and configured

---

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android device/emulator
npm run android
```

---

## Device Testing Overview

Phase 0 is complete with two key validation tasks:

1. **UPI Validation Framework** - Test UPI deep links on 10 devices (8/10 pass rate required)
2. **Performance POC** - Validate 60fps animations on 3 mid-range devices

---

## UPI Validation Testing

### What to Test

The UPI Validation Screen tests:
- Device UPI app detection (GPay, PhonePe, Paytm, BHIM, Amazon Pay)
- Standard UPI URI compatibility (`upi://pay`)
- App-specific fallback URIs
- QR code generation
- Smart URI selection algorithm

### Testing Procedure

**Step 1: Launch App**
```bash
npm run android
# App opens directly to UPI Validation Screen
```

**Step 2: Run UPI Validation**
1. Tap "Run UPI Validation" button
2. Wait for app detection (2-3 seconds)
3. Review results showing installed UPI apps

**Step 3: Test Standard URI**
1. Tap "Test Standard URI" button
2. Device opens UPI app selection dialog OR specific app
3. **In UPI app**: Verify ₹1.00 payment details visible
4. **Cancel the payment** (this is a test transaction)
5. Return to app

**Step 4: Test Smart URI**
1. Tap "Test Best URI (Smart)" button
2. App uses intelligent fallback for your device
3. Verify payment screen opens
4. Cancel and return

**Step 5: Test QR Code**
1. Tap "Generate QR Code" button
2. View QR generation confirmation dialog
3. Note QR code size and error correction level

### Recording Results

Document for each device:

```yaml
Device: [Model name and OS version]
Apps Installed: [GPay, PhonePe, etc.]
Standard URI: [✅ Works / ❌ Failed]
Smart URI: [✅ Works / ❌ Failed]
QR Generated: [✅ Yes / ❌ No]
Notes: [Any issues or observations]
```

### Success Criteria

**Per Device:**
- ✅ At least 1 UPI app installed
- ✅ Standard URI OR Smart URI works
- ✅ QR code generates successfully

**Overall:**
- ✅ 8 out of 10 devices pass all criteria
- ✅ No critical failures (app crashes, data loss)

### Common Issues

**No UPI apps detected:**
- Install GPay or PhonePe
- Restart validation test

**URI doesn't open:**
- Check if app is default handler
- Try Smart URI as fallback

**Payment screen shows wrong amount:**
- This is expected (₹1.00 test amount)
- Always cancel, never complete payment

---

## Performance POC Testing

### What to Test

The Performance POC validates:
- Glass card morphing animations (60fps target)
- Skia-based glassmorphism effects
- Moti animation library performance
- Real-world rendering performance

### Testing Procedure

**Step 1: Navigate to Performance Screen**
1. Launch app (UPI Validation Screen)
2. Add navigation to Performance POC screen (temporary test setup)
3. Or modify App.tsx to show Performance POC directly

**Step 2: Visual Performance Check**
1. Observe glass card animations
2. Look for smooth morphing transitions
3. Check for jank, stuttering, or frame drops
4. Test for 30+ seconds to catch thermal throttling

**Step 3: Measure Performance**

**Option A: Chrome DevTools (Recommended)**
```bash
# In app, shake device → "Debug" → "Open React DevTools"
# Enable Performance Monitor
# Observe FPS counter during animations
```

**Option B: Android Studio Profiler**
```bash
# Open Android Studio
# Tools → Device File Explorer
# Monitor → System Trace
# Record during animation sequence
# Analyze frame rendering times (<16ms for 60fps)
```

### Recording Results

Document for each device:

```yaml
Device: [Model name, chipset, RAM]
Average FPS: [Measured frame rate]
Min FPS: [Lowest observed]
Frame Drops: [Count during 30s test]
Thermal Throttling: [Yes/No after 2min]
Visual Quality: [Smooth/Minor Jank/Laggy]
Verdict: [✅ Pass / ❌ Fail]
```

### Success Criteria

**Per Device:**
- ✅ Sustained 60fps during normal operation
- ✅ Minimum 55fps during peak complexity
- ✅ No visible jank or stuttering
- ✅ Smooth glassmorphism effects

**Overall:**
- ✅ 3 out of 3 mid-range devices pass
- ✅ No thermal throttling in first 2 minutes
- ✅ Consistent performance across Android versions

### Common Issues

**Low FPS (<50):**
- Check device background processes
- Reduce animation complexity
- Consider fallback to simpler effects

**Thermal throttling:**
- Allow device to cool between tests
- Profile with Android Studio to find bottlenecks

**Visual glitches:**
- Check Skia shader compilation
- Verify react-native-reanimated worklets

---

## Testing Matrix Template

Copy this template for systematic device testing:

### UPI Testing Matrix

| Device | OS | Apps | Standard URI | Smart URI | QR | Pass |
|--------|----|----- |--------------|-----------|----|----- |
| 1. Pixel 5 | 13 | GPay, PhonePe | ✅ | ✅ | ✅ | ✅ |
| 2. Galaxy S21 | 12 | GPay, Paytm | ✅ | ✅ | ✅ | ✅ |
| 3. OnePlus 9 | 11 | PhonePe | ❌ | ✅ | ✅ | ✅ |
| 4. [Your device] | | | | | | |
| 5. [Your device] | | | | | | |
| 6. [Your device] | | | | | | |
| 7. [Your device] | | | | | | |
| 8. [Your device] | | | | | | |
| 9. [Your device] | | | | | | |
| 10. [Your device] | | | | | | |

**Pass Rate**: __/10 (Need 8/10)

### Performance Testing Matrix

| Device | Chipset | RAM | Avg FPS | Min FPS | Throttle | Pass |
|--------|---------|-----|---------|---------|----------|------|
| 1. [Mid-range 1] | | | | | | |
| 2. [Mid-range 2] | | | | | | |
| 3. [Mid-range 3] | | | | | | |

**Pass Rate**: __/3 (Need 3/3)

---

## Troubleshooting

### ADB Connection Issues

```bash
# Check device connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Check device permissions
adb shell pm list packages | grep upi
```

### Build Failures

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### App Crashes

```bash
# View crash logs
adb logcat *:E

# Clear app data
adb shell pm clear com.vasooly
```

### Performance Issues

```bash
# Check React Native version
npm list react-native

# Verify reanimated plugin
cat babel.config.js | grep reanimated

# Profile with Flipper
npm run android -- --no-packager
```

---

## Next Steps After Testing

**Phase 0 Complete ✅** - All framework code implemented

**Pending Validation:**
1. UPI testing on 10 physical devices
2. Performance testing on 3 mid-range devices
3. Document results in PROJECT_STATUS.md

**Phase 1 Ready** - Proceed with core development:
- Week 3: Split Engine Enhancement
- Week 4: Core UI Components
- Week 5: Payment Status & Tracking
- Week 6: Share & Export Features

---

## Useful Commands

```bash
# Development
npm start                  # Start Metro bundler
npm run android            # Run on Android
npm run ios                # Run on iOS

# Testing
npm test                   # Run unit tests
npm run test:coverage      # Generate coverage report
npm run validate           # Full quality check

# Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix lint issues
npm run typecheck          # TypeScript validation

# Build
cd android && ./gradlew assembleDebug    # Build debug APK
```

---

## Documentation References

- **PROJECT_STATUS.md** - Complete project status and timeline
- **IMPLEMENTATION_PLAN.md** - Phase-by-phase development plan
- **SYSTEM_DESIGN.md** - Technical architecture and decisions
- **docs/UPI_TESTING_GUIDE.md** - Comprehensive UPI testing methodology
- **docs/TESTING.md** - Complete testing infrastructure guide

---

## Support

**Issues**: Create GitHub issue with:
- Device model and OS version
- Installed UPI apps
- Error logs from `adb logcat`
- Steps to reproduce

**Documentation**: See `docs/` directory for detailed technical guides

**Status**: See `PROJECT_STATUS.md` for current progress and metrics

---

**Last Updated**: 2025-10-17
**Phase 0**: Complete ✅
**Next**: Physical device validation
