# AndroidManifest.xml Queries for UPI App Detection

**Purpose**: Enable UPI app detection on Android 11+ (API 30+)
**Status**: Required for production build, not applicable in Expo Go
**Last Updated**: 2025-10-17

---

## Why This Is Needed

Starting from Android 11 (API 30), apps cannot query for other installed packages due to **package visibility restrictions**. This is why:

- ✅ Standard `upi://pay` links work (system handles app selector)
- ❌ App-specific detection fails (can't query if GPay/PhonePe/etc are installed)
- ❌ URL scheme checks return false even if apps are installed

**Solution**: Declare packages in AndroidManifest.xml using `<queries>` tags.

---

## For Expo Projects

### Option 1: Create app.json plugin (Recommended)

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "manifestQueries": {
              "package": [
                "com.google.android.apps.nbu.paisa.user",
                "com.phonepe.app",
                "net.one97.paytm",
                "in.org.npci.upiapp",
                "com.whatsapp",
                "in.amazon.mShop.android.shopping",
                "com.sbi.lotusintouch",
                "com.csam.icici.bank.imobile",
                "com.snapwork.hdfc",
                "com.axis.mobile",
                "com.kotak811mobilebankingapp.instantsavingsupiscanandpayrecharge",
                "com.naviapp",
                "com.dreamplug.androidapp",
                "money.jupiter",
                "com.epifi.paisa",
                "in.indwealth",
                "money.super.payments"
              ],
              "intent": [
                {
                  "action": "android.intent.action.VIEW",
                  "data": {
                    "scheme": "upi"
                  }
                }
              ]
            }
          }
        }
      ]
    ]
  }
}
```

### Option 2: Use Expo Config Plugin

Install plugin:
```bash
npx expo install expo-build-properties
```

Then add configuration as shown in Option 1.

---

## For React Native (non-Expo) Projects

### File Location
`android/app/src/main/AndroidManifest.xml`

### Add Inside `<manifest>` Tag

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Add this BEFORE <application> tag -->
    <queries>
        <!-- Major Payment Apps -->
        <package android:name="com.google.android.apps.nbu.paisa.user" />
        <package android:name="com.phonepe.app" />
        <package android:name="net.one97.paytm" />
        <package android:name="in.org.npci.upiapp" />
        <package android:name="com.whatsapp" />
        <package android:name="in.amazon.mShop.android.shopping" />

        <!-- Banking Apps -->
        <package android:name="com.sbi.lotusintouch" />
        <package android:name="com.csam.icici.bank.imobile" />
        <package android:name="com.snapwork.hdfc" />
        <package android:name="com.axis.mobile" />
        <package android:name="com.kotak811mobilebankingapp.instantsavingsupiscanandpayrecharge" />

        <!-- Fintech Apps -->
        <package android:name="com.naviapp" />
        <package android:name="com.dreamplug.androidapp" />
        <package android:name="money.jupiter" />
        <package android:name="com.epifi.paisa" />
        <package android:name="in.indwealth" />
        <package android:name="money.super.payments" />

        <!-- Generic UPI Intent (Required) -->
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="upi" />
        </intent>
    </queries>

    <application>
        <!-- Your app configuration -->
    </application>

</manifest>
```

---

## Complete Package List (50+ Apps)

See `claudedocs/UPI_APPS_RESEARCH_2025.md` for the full list of 50+ UPI apps with package names.

**Included in manifest above**: Top 18 most popular apps (covers 95%+ of users)

**Additional apps** (add if targeting specific banks):
```xml
<!-- Public Sector Banks -->
<package android:name="com.fss.pnbone" /> <!-- PNB ONE -->
<package android:name="com.MSI.BOB" /> <!-- Bank of Baroda -->
<package android:name="com.infrasoft.canaramobile" /> <!-- Canara Bank -->

<!-- Private Banks -->
<package android:name="com.enstage.wibmo.merchant.yespaynext" /> <!-- Yes Bank -->
<package android:name="com.indusind.mobile" /> <!-- IndusInd Bank -->
<package android:name="com.fedmobile" /> <!-- Federal Bank -->
<package android:name="com.rblbank.mobank" /> <!-- RBL Bank -->

<!-- Fintech -->
<package android:name="com.freecharge.android" /> <!-- Freecharge -->
<package android:name="com.mobikwik_new" /> <!-- MobiKwik -->
<package android:name="com.itz.mobilebanking" /> <!-- PayZapp (HDFC) -->
```

---

## Testing After Adding Queries

### 1. Build Production APK

**Expo**:
```bash
eas build --platform android --profile production
```

**React Native**:
```bash
cd android
./gradlew assembleRelease
```

### 2. Install on Device
```bash
adb install -r app-release.apk
```

### 3. Test Detection
- Open app
- Run UPI Validation
- Should now show individual apps detected (not just "generic")

---

## Impact on App Size

**Queries section**: ~2KB
**No runtime impact**: Manifest is read at install time only
**No permissions required**: Queries don't need user permissions

---

## Common Issues

### Issue: Detection still shows "generic"
**Cause**: App built with old manifest or Expo Go
**Fix**: Clean build and reinstall
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue: Some apps not detected
**Cause**: Package name incorrect or app not installed
**Fix**:
1. Verify package name from Google Play Store URL
2. Check app is actually installed on device
3. Try manual query: `adb shell pm list packages | grep <package>`

### Issue: Build fails with "duplicate element"
**Cause**: Queries already exist in merged manifest
**Fix**: Check `android/app/build/intermediates/merged_manifests/` for conflicts

---

## Verification Command

Check if your APK includes queries:
```bash
# Extract AndroidManifest.xml from APK
aapt dump xmltree app-debug.apk AndroidManifest.xml | grep -A 20 "queries"

# Or use bundletool
bundletool dump manifest --bundle=app.aab | grep -A 20 "queries"
```

---

## References

1. **Android Package Visibility**: https://developer.android.com/training/package-visibility
2. **Queries Element**: https://developer.android.com/guide/topics/manifest/queries-element
3. **Expo Build Properties**: https://docs.expo.dev/versions/latest/sdk/build-properties/
4. **UPI App Research**: `claudedocs/UPI_APPS_RESEARCH_2025.md`

---

## Next Steps

**For Current Testing (Expo Go)**:
- ✅ Standard UPI links work perfectly
- ✅ App selector shows all installed apps
- ⏸️ Individual detection pending production build

**For Production Release**:
1. Add queries to app.json (Expo) or AndroidManifest.xml (React Native)
2. Build production APK/AAB
3. Test detection on device
4. Verify all target apps detected correctly

---

**Last Updated**: 2025-10-17
**Status**: Documentation complete, implementation pending production build
