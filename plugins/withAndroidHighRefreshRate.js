/**
 * Expo Config Plugin to enable high refresh rate (120Hz) on Android
 *
 * This plugin modifies the MainActivity to request high refresh rate.
 * Works on devices that support high refresh rates (90Hz, 120Hz, 144Hz)
 *
 * Note: The actual implementation requires native code changes in MainActivity.java
 * For now, this plugin is disabled as high refresh rate works by default in React Native
 * when the device supports it.
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidHighRefreshRate = (config) => {
  // High refresh rate is enabled by default in React Native 0.81+
  // No manifest changes needed - just return the config as-is
  return config;
};

module.exports = withAndroidHighRefreshRate;
