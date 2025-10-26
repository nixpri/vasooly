/**
 * Device Capabilities Utilities
 * Detect device hardware capabilities including ProMotion (120Hz) display support
 */

import { Platform, NativeModules } from 'react-native';
import * as Device from 'expo-device';

/**
 * Device refresh rate capabilities
 */
export enum RefreshRate {
  STANDARD = 60,
  PROMOTION = 120,
}

/**
 * Device models known to support ProMotion (120Hz) displays
 * Source: Apple Technical Specifications
 */
const PROMOTION_DEVICE_MODELS = new Set([
  // iPhone 13 Pro series
  'iPhone14,2', // iPhone 13 Pro
  'iPhone14,3', // iPhone 13 Pro Max

  // iPhone 14 Pro series
  'iPhone15,2', // iPhone 14 Pro
  'iPhone15,3', // iPhone 14 Pro Max

  // iPhone 15 Pro series
  'iPhone16,1', // iPhone 15 Pro
  'iPhone16,2', // iPhone 15 Pro Max

  // iPhone 16 Pro series (future-proofing)
  'iPhone17,1', // iPhone 16 Pro
  'iPhone17,2', // iPhone 16 Pro Max

  // iPad Pro 11-inch (3rd gen and later)
  'iPad13,4',
  'iPad13,5',
  'iPad13,6',
  'iPad13,7',

  // iPad Pro 12.9-inch (5th gen and later)
  'iPad13,8',
  'iPad13,9',
  'iPad13,10',
  'iPad13,11',

  // iPad Pro 11-inch (4th gen)
  'iPad14,3',
  'iPad14,4',

  // iPad Pro 12.9-inch (6th gen)
  'iPad14,5',
  'iPad14,6',
]);

// Cache for refresh rate to avoid repeated native calls
let cachedRefreshRate: number | null = null;

/**
 * Gets the actual refresh rate from the device's display
 *
 * @returns Promise that resolves to the refresh rate in Hz, or null if unavailable
 */
const getActualRefreshRateAsync = async (): Promise<number | null> => {
  if (cachedRefreshRate !== null) {
    return cachedRefreshRate;
  }

  try {
    if (Platform.OS === 'android') {
      console.log('🔍 Attempting to detect refresh rate...');

      const { DisplayModule } = NativeModules;
      console.log('DisplayModule available:', !!DisplayModule);

      if (DisplayModule && DisplayModule.getRefreshRate) {
        try {
          const rate = await DisplayModule.getRefreshRate();
          console.log('✅ Native module returned refresh rate:', rate);
          cachedRefreshRate = Math.round(rate);
          return cachedRefreshRate;
        } catch (nativeError) {
          console.warn('❌ Native module error:', nativeError);
        }
      } else {
        console.log('⚠️ DisplayModule not available, using fallback');
      }

      // Fallback: Check for common high refresh rate Android devices
      const modelName = Device.modelName?.toLowerCase() || '';
      const modelId = Device.modelId?.toLowerCase() || '';

      console.log('Device info for fallback:', { modelName, modelId });

      // OnePlus devices with high refresh rate (check BOTH modelName and modelId)
      if (modelName.includes('oneplus') || modelName.includes('cph') || modelId.includes('cph')) {
        // Most modern OnePlus devices support 120Hz
        if (modelName.includes('cph26') || modelName.includes('cph25') ||
            modelId.includes('cph26') || modelId.includes('cph25')) {
          console.log('✅ Detected OnePlus 120Hz device via fallback');
          cachedRefreshRate = 120;
          return 120;
        }
      }

      // Samsung Galaxy S/Note series with high refresh rate
      if (modelName.includes('galaxy s2') || modelName.includes('galaxy s3') ||
          modelName.includes('galaxy note2') || modelName.includes('galaxy z')) {
        console.log('✅ Detected Samsung 120Hz device via fallback');
        cachedRefreshRate = 120;
        return 120;
      }

      // Google Pixel (Pixel 4 and later often support 90Hz)
      if (modelName.includes('pixel')) {
        const match = modelName.match(/pixel (\d+)/);
        if (match && parseInt(match[1]) >= 4) {
          console.log('✅ Detected Pixel 90Hz device via fallback');
          cachedRefreshRate = 90;
          return 90;
        }
      }

      console.log('⚠️ No high refresh rate detection matched');
    }

    return null;
  } catch (error) {
    console.warn('❌ Error detecting refresh rate:', error);
    return null;
  }
};

/**
 * Gets the actual refresh rate from the device's display (synchronous fallback)
 *
 * @returns The refresh rate in Hz, or null if unavailable
 */
const getActualRefreshRate = (): number | null => {
  return cachedRefreshRate;
};

/**
 * Checks if the device supports ProMotion (120Hz refresh rate) or high refresh rate
 *
 * Note: React Native Reanimated automatically runs at the native refresh rate.
 * This detection is for informational purposes and conditional UI features.
 *
 * @returns true if device supports 120Hz ProMotion display or high refresh rate
 */
export const supportsProMotion = (): boolean => {
  if (Platform.OS === 'ios') {
    const modelId = Device.modelId;
    if (!modelId) {
      return false;
    }
    return PROMOTION_DEVICE_MODELS.has(modelId);
  }

  if (Platform.OS === 'android') {
    const actualRate = getActualRefreshRate();
    if (actualRate && actualRate >= 90) {
      return true;
    }
  }

  return false;
};

/**
 * Gets the maximum refresh rate supported by the device
 *
 * @returns Refresh rate in Hz (60, 90, or 120)
 */
export const getMaxRefreshRate = (): number => {
  const actualRate = getActualRefreshRate();
  if (actualRate) {
    return actualRate;
  }
  return supportsProMotion() ? RefreshRate.PROMOTION : RefreshRate.STANDARD;
};

/**
 * Gets device capability information
 *
 * @returns Object with device capabilities
 */
export const getDeviceCapabilities = () => {
  const hasProMotion = supportsProMotion();
  const maxRefreshRate = getMaxRefreshRate();

  return {
    hasProMotion,
    maxRefreshRate,
    platform: Platform.OS,
    modelId: Device.modelId || 'unknown',
    modelName: Device.modelName || 'unknown',
    osVersion: Device.osVersion || 'unknown',
  };
};

/**
 * Logs device capabilities to console (development only)
 * Useful for debugging animation performance on different devices
 */
export const logDeviceCapabilities = async () => {
  if (__DEV__) {
    // First, fetch the refresh rate asynchronously
    await getActualRefreshRateAsync();

    const capabilities = getDeviceCapabilities();
    console.log('📱 Device Capabilities:');
    console.log(`  Model: ${capabilities.modelName} (${capabilities.modelId})`);
    console.log(`  OS: ${capabilities.platform} ${capabilities.osVersion}`);
    console.log(`  ProMotion/High Refresh: ${capabilities.hasProMotion ? '✅ Supported' : '❌ Not supported'}`);
    console.log(`  Max Refresh Rate: ${capabilities.maxRefreshRate}Hz`);
    console.log(`  Animation Frame Rate: ${capabilities.maxRefreshRate}fps (automatic via Reanimated)`);
  }
};
