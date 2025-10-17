# UPI Testing Guide - Week 2 Day 1-2

**Date**: 2025-10-17
**Phase**: UPI Validation Framework Testing

---

## Overview

Complete guide for testing UPI deep links across devices and UPI apps. This is a **critical** phase - UPI links must work on 8/10 devices minimum for production.

---

## UPI App Deep Link Schemes

### Research Summary

**Standard UPI URI**:
```
upi://pay?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>
```

**App-Specific Fallback URIs**:

#### Google Pay (GPay)
```
# Android
googlepay://upi/tr?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>

# Package: com.google.android.apps.nbu.paisa.user
# URL Scheme: googlepay://
```

#### PhonePe
```
# Android
phonepe://pay?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>

# Package: com.phonepe.app
# URL Scheme: phonepe://
```

#### Paytm
```
# Android
paytmmp://pay?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>

# Package: net.one97.paytm
# URL Scheme: paytmmp://
```

#### BHIM
```
# Android
bhim://pay?pa=<VPA>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>

# Package: in.org.npci.upiapp
# URL Scheme: bhim://
```

### Key Findings

1. **Standard URI Support**: Not universally supported
   - Some devices require app-specific URIs
   - Android 12+ has better standard URI support
   - iOS requires app-specific URL schemes

2. **Fallback Strategy**:
   - Try standard `upi://pay` first
   - Fall back to app-specific URIs for installed apps
   - Provide QR code as universal fallback

3. **QR Code Compatibility**:
   - All UPI apps can scan standard UPI QR codes
   - QR code is the most reliable method
   - Use QR when deep link support is uncertain

---

## Testing Framework Components

### 1. UPI Validation Service

**Location**: `src/lib/platform/upiValidation.ts`

**Key Functions**:
```typescript
// Get current device info
getCurrentDevice(): TestDevice

// Check if UPI app is installed
isUPIAppInstalled(app: UPIApp): Promise<boolean>

// Test URI compatibility
canOpenURI(uri: string): Promise<boolean>

// Full validation
validateUPILink(upiLink: UPILinkResult): Promise<UPIValidationResult>

// Select best URI for device
selectBestURI(upiLink, validationResult): string

// Generate test report
generateValidationReport(deviceResults): ValidationReport
```

### 2. Interactive Testing Screen

**Location**: `src/screens/UPIValidationScreen.tsx`

**Features**:
- Device information display
- One-tap validation
- App availability detection
- Live URI testing
- QR code generation
- Step-by-step testing checklist

---

## Device Testing Matrix

### Target Devices (Minimum 10)

| # | Device Type | OS | Priority | Status |
|---|-------------|--------|----------|--------|
| 1 | Your Android | Android | HIGH | 🟡 Ready |
| 2 | Friend's Android | Android | HIGH | ⚪ Needed |
| 3 | Mid-range Android | Android 11-13 | HIGH | ⚪ Needed |
| 4 | Budget Android | Android 10-11 | MEDIUM | ⚪ Needed |
| 5 | iPhone 12/13 | iOS 16+ | HIGH | ⚪ Needed |
| 6 | iPhone SE | iOS 15+ | MEDIUM | ⚪ Needed |
| 7 | Older Android | Android 9-10 | LOW | ⚪ Needed |
| 8 | Tablet Android | Android | LOW | ⚪ Needed |
| 9 | iPad | iOS | LOW | ⚪ Needed |
| 10 | Another Android | Android | MEDIUM | ⚪ Needed |

### Success Criteria

**Minimum Requirements**:
- ✅ 10 devices tested
- ✅ 8/10 devices pass (80% success rate)
- ✅ At least 6 Android devices
- ✅ At least 2 iOS devices

**Pass Criteria Per Device**:
- ✅ At least 1 UPI app installed
- ✅ Standard URI works OR fallback URI works
- ✅ QR code can be generated and scanned

---

## Testing Procedure

### Setup (5 minutes)

1. **Install on Device**:
```bash
# Connect Android device
adb devices

# Run app
npm run android
```

2. **Verify UPI Apps**:
   - Install at least one UPI app (GPay, PhonePe, Paytm, BHIM)
   - Verify app is set up with active UPI ID
   - Ensure device has internet connection

### Validation Tests (10 minutes per device)

#### Step 1: Run Validation
- Open UPI Validation Screen
- Tap "Run UPI Validation"
- Record device info and results

#### Step 2: Check App Availability
- Note which UPI apps are installed
- Check if they show as "Installed" in the app list
- Record installed count (e.g., 2/5 apps)

#### Step 3: Test Standard URI
- Tap "Test Standard URI"
- Observe:
  - ✅ Opens UPI app → **PASS**
  - ❌ Error/doesn't open → **FAIL**
- Cancel payment in UPI app

#### Step 4: Test Smart URI
- Tap "Test Best URI (Smart)"
- Should open UPI app using fallback if needed
- Observe:
  - ✅ Opens UPI app → **PASS**
  - ❌ Error/doesn't open → **FAIL**
- Cancel payment in UPI app

#### Step 5: Test QR Code
- Tap "Generate QR Code"
- Note QR code size and format
- Open any UPI app → Scan QR
- Observe:
  - ✅ QR scans, payment details show → **PASS**
  - ❌ QR doesn't scan → **FAIL**
- Cancel payment

### Record Results

For each device, record in testing matrix:

```markdown
### Device [N]: [Model Name]

**Specs**:
- Model: [e.g., Samsung Galaxy S21]
- OS: [e.g., Android 13]
- RAM: [e.g., 8GB]
- UPI Apps Installed: [e.g., GPay, PhonePe (2/5)]

**Results**:
- Standard URI: [✅ PASS / ❌ FAIL]
- Smart URI: [✅ PASS / ❌ FAIL]
- QR Code: [✅ PASS / ❌ FAIL]
- Overall: [✅ PASS / ❌ FAIL]

**Notes**: [Any observations, issues, or special behavior]
```

---

## Testing Checklist

### Before Testing
- [ ] UPI Validation Screen implemented
- [ ] At least 1 physical device available
- [ ] Device has at least 1 UPI app installed
- [ ] Understanding of success criteria (8/10 devices)

### During Testing
- [ ] Run validation on device
- [ ] Test standard URI
- [ ] Test smart URI (fallback)
- [ ] Generate and scan QR code
- [ ] Record results in matrix
- [ ] Note any issues or unexpected behavior

### After Testing Session
- [ ] Update device testing matrix
- [ ] Calculate success rate
- [ ] Document any UPI app compatibility issues
- [ ] Decide if more devices needed

---

## Common Issues & Troubleshooting

### Issue: Standard URI Doesn't Work

**Symptoms**: `upi://pay` link doesn't open any app

**Solutions**:
1. Use fallback URI for installed app
2. Provide QR code option
3. Show list of installed UPI apps, let user choose

**Code**:
```typescript
const validation = await validateUPILink(upiLink);
if (!validation.standardUriWorks && validation.recommendedApp) {
  // Use fallback URI
  const uri = upiLink.fallbackUris[validation.recommendedApp];
  await Linking.openURL(uri);
}
```

### Issue: No UPI Apps Installed

**Symptoms**: Validation shows 0/5 apps installed

**Solutions**:
1. Show error message: "Install a UPI app to continue"
2. Provide QR code to save for later
3. Send link via WhatsApp/SMS (opens in app when user has UPI app)

**Code**:
```typescript
if (!validation.appAvailability.some(a => a.isInstalled)) {
  Alert.alert(
    'No UPI Apps Found',
    'Please install Google Pay, PhonePe, Paytm, or BHIM to make payments.'
  );
}
```

### Issue: URI Opens Wrong App

**Symptoms**: Standard URI opens unexpected UPI app

**Solutions**:
1. Use app-specific URI for target app
2. Let user select preferred app
3. Remember user's choice in settings

**Code**:
```typescript
// User selected GPay
const gpayUri = upiLink.fallbackUris[UPIApp.GPAY];
await Linking.openURL(gpayUri);
```

### Issue: QR Code Too Large

**Symptoms**: QR code generation fails with size error

**Solutions**:
1. Reduce transaction note length
2. Remove optional parameters
3. Use error correction level 'L' instead of 'M'

**Code**:
```typescript
// Compact UPI link for QR
const upiLink = generateUPILink({
  vpa,
  name: name.substring(0, 20), // Truncate
  amount,
  transactionNote: note.substring(0, 50), // Truncate
});

const qr = await generateQRCode(upiLink.standardUri, {
  errorCorrectionLevel: 'L', // Less data, smaller QR
});
```

---

## Production Deployment Checklist

### Before Launch
- [ ] **10+ devices tested** (mix of Android/iOS, old/new)
- [ ] **8/10 success rate achieved** (80%+ pass rate)
- [ ] Fallback URIs working for all major apps
- [ ] QR code generation working
- [ ] Error handling for no UPI apps case
- [ ] User-friendly error messages

### UPI Compatibility Report
- [ ] Document which UPI apps work best
- [ ] Document Android version compatibility
- [ ] Document iOS version compatibility
- [ ] Document known issues and workarounds
- [ ] Update user documentation

### Monitoring Plan
- [ ] Track UPI link open success rate
- [ ] Monitor which URIs are used most
- [ ] Log failures for analysis
- [ ] Plan for UPI app updates handling

---

## Go/No-Go Decision Criteria

### ✅ GO (Proceed to Production)
- 10+ devices tested
- 80%+ success rate (8/10 devices pass)
- Fallback strategy working
- QR code generation reliable
- Error handling in place

### ⚠️ WARNING (Proceed with Caution)
- 8-9 devices tested (need 1-2 more)
- 70-80% success rate
- Some UPI apps problematic
- Manual testing required

### ❌ NO-GO (More Work Required)
- <8 devices tested
- <70% success rate
- Standard AND fallback URIs failing
- QR code not working
- Major UPI apps not supported

---

## Next Steps

### Immediate (Your Android Device)
1. Run `npm run android`
2. Open UPI Validation Screen
3. Complete all 5 test steps
4. Record results

### Short-term (Week 2)
1. Test on 2-3 more devices (friends/family)
2. Test different UPI apps
3. Document compatibility matrix
4. Make go/no-go decision

### Long-term (Ongoing)
1. Monitor UPI app updates
2. Test new Android/iOS versions
3. Update fallback URIs if needed
4. Maintain compatibility matrix

---

## Resources

### Documentation
- **UPI Spec**: https://www.npci.org.in/what-we-do/upi/upi-link-specification
- **Android Deep Links**: https://developer.android.com/training/app-links
- **iOS URL Schemes**: https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app

### Code References
- `src/lib/business/upiGenerator.ts` - UPI link generation
- `src/lib/platform/upiValidation.ts` - Validation framework
- `src/screens/UPIValidationScreen.tsx` - Testing interface

---

**Document Status**: Ready for Testing
**Next Action**: Run `npm run android` and start validation tests
