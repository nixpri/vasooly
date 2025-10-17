/**
 * UPI Validation Framework
 *
 * Validates UPI deep links across different apps and devices.
 * Provides device compatibility testing and fallback URI selection.
 *
 * CRITICAL: This framework is essential for production readiness.
 * Must test on minimum 10 devices (8/10 success rate required).
 */

import { Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { UPIApp, UPILinkResult } from '../business/upiGenerator';

/**
 * Test device information
 */
export interface TestDevice {
  os: 'iOS' | 'Android';
  version: string;
  model: string;
  manufacturer?: string;
}

/**
 * UPI app availability on device
 */
export interface UPIAppAvailability {
  app: UPIApp;
  isInstalled: boolean;
  canOpenStandardUri: boolean;
  canOpenFallbackUri: boolean;
  packageName?: string;
}

/**
 * UPI validation test result for a single device
 */
export interface UPIValidationResult {
  device: TestDevice;
  standardUriWorks: boolean;
  appAvailability: UPIAppAvailability[];
  recommendedApp: UPIApp | null;
  qrCodeSupported: boolean;
  testTimestamp: number;
}

/**
 * Comprehensive validation report across multiple devices
 */
export interface ValidationReport {
  totalDevicesTested: number;
  successfulDevices: number;
  failedDevices: number;
  successRate: number;
  deviceResults: UPIValidationResult[];
  overallRecommendation: 'PASS' | 'FAIL' | 'WARNING';
  issues: string[];
}

/**
 * Package names for UPI apps on Android
 */
const ANDROID_PACKAGE_NAMES: Record<UPIApp, string> = {
  [UPIApp.GPAY]: 'com.google.android.apps.nbu.paisa.user',
  [UPIApp.PHONEPE]: 'com.phonepe.app',
  [UPIApp.PAYTM]: 'net.one97.paytm',
  [UPIApp.BHIM]: 'in.org.npci.upiapp',
  [UPIApp.GENERIC]: '', // Not applicable
};

/**
 * iOS URL schemes for UPI apps
 */
const IOS_URL_SCHEMES: Record<UPIApp, string> = {
  [UPIApp.GPAY]: 'googlepay://',
  [UPIApp.PHONEPE]: 'phonepe://',
  [UPIApp.PAYTM]: 'paytmmp://',
  [UPIApp.BHIM]: 'bhim://',
  [UPIApp.GENERIC]: 'upi://',
};

/**
 * Gets current device information
 *
 * @returns Test device info for validation
 *
 * @example
 * ```typescript
 * const device = getCurrentDevice();
 * console.log(`Testing on ${device.model} (${device.os} ${device.version})`);
 * ```
 */
export function getCurrentDevice(): TestDevice {
  return {
    os: Platform.OS === 'ios' ? 'iOS' : 'Android',
    version: Platform.Version.toString(),
    model: DeviceInfo.getModel(),
    manufacturer: DeviceInfo.getManufacturerSync(),
  };
}

/**
 * Checks if a specific UPI app is installed on the device
 *
 * @param app - UPI app to check
 * @returns True if app is likely installed
 *
 * @example
 * ```typescript
 * const hasGPay = await isUPIAppInstalled(UPIApp.GPAY);
 * if (hasGPay) {
 *   // Use GPay-specific URI
 * }
 * ```
 */
export async function isUPIAppInstalled(app: UPIApp): Promise<boolean> {
  if (app === UPIApp.GENERIC) {
    return true; // Generic UPI is always "available"
  }

  try {
    if (Platform.OS === 'android') {
      // On Android, try to check if app-specific URL scheme can be opened
      // This is more reliable than package: URLs on modern Android
      const scheme = getAppSpecificScheme(app);
      const canOpen = await Linking.canOpenURL(scheme);
      return canOpen;
    } else {
      // On iOS, check if URL scheme can be opened
      const scheme = IOS_URL_SCHEMES[app];
      const canOpen = await Linking.canOpenURL(scheme);
      return canOpen;
    }
  } catch (error) {
    console.warn(`Error checking ${app} installation:`, error);
    return false;
  }
}

/**
 * Gets app-specific URL scheme for testing installation
 */
function getAppSpecificScheme(app: UPIApp): string {
  switch (app) {
    case UPIApp.GPAY:
      return 'gpay://';
    case UPIApp.PHONEPE:
      return 'phonepe://';
    case UPIApp.PAYTM:
      return 'paytmmp://';
    case UPIApp.BHIM:
      return 'bhim://';
    default:
      return 'upi://';
  }
}

/**
 * Tests if a specific URI can be opened on the device
 *
 * @param uri - URI to test
 * @returns True if URI can be opened
 *
 * @example
 * ```typescript
 * const canOpen = await canOpenURI('upi://pay?pa=test@paytm&pn=Test&am=1');
 * ```
 */
export async function canOpenURI(uri: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(uri);
  } catch (error) {
    console.warn(`Error checking URI: ${uri}`, error);
    return false;
  }
}

/**
 * Tests UPI app availability for a given UPI link
 *
 * @param upiLink - Generated UPI link result
 * @returns Array of app availability information
 *
 * @example
 * ```typescript
 * const upiLink = generateUPILink({...});
 * const availability = await testUPIAppAvailability(upiLink);
 *
 * const installedApps = availability.filter(a => a.isInstalled);
 * console.log(`Found ${installedApps.length} UPI apps`);
 * ```
 */
export async function testUPIAppAvailability(
  upiLink: UPILinkResult
): Promise<UPIAppAvailability[]> {
  const apps: UPIApp[] = [
    UPIApp.GPAY,
    UPIApp.PHONEPE,
    UPIApp.PAYTM,
    UPIApp.BHIM,
    UPIApp.GENERIC,
  ];

  const results: UPIAppAvailability[] = [];

  for (const app of apps) {
    const isInstalled = await isUPIAppInstalled(app);
    const fallbackUri = upiLink.fallbackUris[app];

    const canOpenStandard =
      app === UPIApp.GENERIC || (await canOpenURI(upiLink.standardUri));
    const canOpenFallback = await canOpenURI(fallbackUri);

    results.push({
      app,
      isInstalled,
      canOpenStandardUri: canOpenStandard,
      canOpenFallbackUri: canOpenFallback,
      packageName:
        Platform.OS === 'android' ? ANDROID_PACKAGE_NAMES[app] : undefined,
    });
  }

  return results;
}

/**
 * Validates UPI link on current device
 *
 * Comprehensive test of UPI link functionality including:
 * - Standard URI support
 * - App-specific fallback URIs
 * - QR code compatibility
 * - Recommended app selection
 *
 * @param upiLink - Generated UPI link result
 * @returns Validation result for current device
 *
 * @example
 * ```typescript
 * const upiLink = generateUPILink({...});
 * const result = await validateUPILink(upiLink);
 *
 * if (result.standardUriWorks) {
 *   console.log('Standard UPI deep link works!');
 * } else if (result.recommendedApp) {
 *   console.log(`Use ${result.recommendedApp} fallback URI`);
 * } else {
 *   console.error('No UPI apps available');
 * }
 * ```
 */
export async function validateUPILink(
  upiLink: UPILinkResult
): Promise<UPIValidationResult> {
  const device = getCurrentDevice();

  // Test standard URI
  const standardUriWorks = await canOpenURI(upiLink.standardUri);

  // Test app availability
  const appAvailability = await testUPIAppAvailability(upiLink);

  // Find recommended app (first installed app that works)
  let recommendedApp: UPIApp | null = null;
  for (const app of appAvailability) {
    if (
      app.isInstalled &&
      (app.canOpenStandardUri || app.canOpenFallbackUri)
    ) {
      recommendedApp = app.app;
      break;
    }
  }

  // QR code is supported if any UPI app is installed
  const qrCodeSupported = appAvailability.some((app) => app.isInstalled);

  return {
    device,
    standardUriWorks,
    appAvailability,
    recommendedApp,
    qrCodeSupported,
    testTimestamp: Date.now(),
  };
}

/**
 * Selects best URI for opening based on device capabilities
 *
 * Strategy:
 * 1. Try standard URI if it works
 * 2. Fall back to app-specific URI for installed apps
 * 3. Return generic URI as last resort
 *
 * @param upiLink - Generated UPI link result
 * @param validationResult - Validation result from validateUPILink
 * @returns Best URI to use for opening
 *
 * @example
 * ```typescript
 * const upiLink = generateUPILink({...});
 * const validation = await validateUPILink(upiLink);
 * const bestUri = selectBestURI(upiLink, validation);
 *
 * // Open payment
 * await Linking.openURL(bestUri);
 * ```
 */
export function selectBestURI(
  upiLink: UPILinkResult,
  validationResult: UPIValidationResult
): string {
  // If standard URI works, use it
  if (validationResult.standardUriWorks) {
    return upiLink.standardUri;
  }

  // Use recommended app's fallback URI
  if (validationResult.recommendedApp) {
    return upiLink.fallbackUris[validationResult.recommendedApp];
  }

  // Last resort: generic URI
  return upiLink.standardUri;
}

/**
 * Generates validation report from multiple device tests
 *
 * Used for comprehensive testing across device matrix.
 * Minimum 10 devices recommended, 8/10 success rate required.
 *
 * @param deviceResults - Validation results from multiple devices
 * @returns Comprehensive validation report
 *
 * @example
 * ```typescript
 * const results: UPIValidationResult[] = [];
 *
 * // Test on multiple devices
 * for (const device of testDevices) {
 *   const result = await validateUPILink(upiLink);
 *   results.push(result);
 * }
 *
 * const report = generateValidationReport(results);
 * console.log(`Success rate: ${report.successRate}%`);
 *
 * if (report.overallRecommendation === 'PASS') {
 *   console.log('Ready for production!');
 * }
 * ```
 */
export function generateValidationReport(
  deviceResults: UPIValidationResult[]
): ValidationReport {
  const totalDevices = deviceResults.length;
  const successfulDevices = deviceResults.filter(
    (r) => r.standardUriWorks || r.recommendedApp !== null
  ).length;
  const failedDevices = totalDevices - successfulDevices;
  const successRate = (successfulDevices / totalDevices) * 100;

  const issues: string[] = [];

  // Check minimum device count
  if (totalDevices < 10) {
    issues.push(
      `Only ${totalDevices} devices tested. Minimum 10 required for production.`
    );
  }

  // Check success rate
  if (successRate < 80) {
    issues.push(
      `Success rate ${successRate.toFixed(1)}% is below 80% threshold.`
    );
  }

  // Check for devices with no UPI app support
  const devicesWithNoApps = deviceResults.filter(
    (r) => !r.appAvailability.some((a) => a.isInstalled)
  );
  if (devicesWithNoApps.length > 0) {
    issues.push(
      `${devicesWithNoApps.length} device(s) have no UPI apps installed.`
    );
  }

  // Determine overall recommendation
  let overallRecommendation: 'PASS' | 'FAIL' | 'WARNING';
  if (successRate >= 80 && totalDevices >= 10 && issues.length === 0) {
    overallRecommendation = 'PASS';
  } else if (successRate >= 70 && totalDevices >= 8) {
    overallRecommendation = 'WARNING';
  } else {
    overallRecommendation = 'FAIL';
  }

  return {
    totalDevicesTested: totalDevices,
    successfulDevices,
    failedDevices,
    successRate,
    deviceResults,
    overallRecommendation,
    issues,
  };
}

/**
 * Pretty prints validation report for console output
 *
 * @param report - Validation report to print
 */
export function printValidationReport(report: ValidationReport): void {
  console.log('\n=== UPI Validation Report ===\n');
  console.log(`Total Devices Tested: ${report.totalDevicesTested}`);
  console.log(`Successful: ${report.successfulDevices}`);
  console.log(`Failed: ${report.failedDevices}`);
  console.log(`Success Rate: ${report.successRate.toFixed(1)}%`);
  console.log(`Overall: ${report.overallRecommendation}\n`);

  if (report.issues.length > 0) {
    console.log('Issues:');
    report.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
    console.log();
  }

  console.log('Device Breakdown:');
  report.deviceResults.forEach((result, index) => {
    const status = result.standardUriWorks || result.recommendedApp ? '✅' : '❌';
    console.log(
      `  ${index + 1}. ${status} ${result.device.model} (${result.device.os} ${result.device.version})`
    );
    if (result.recommendedApp) {
      console.log(`     Recommended: ${result.recommendedApp}`);
    }
  });
  console.log('\n============================\n');
}
