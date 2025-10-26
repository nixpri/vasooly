/**
 * Expo Config Plugin to enable high refresh rate (120Hz) on Android
 *
 * This plugin modifies AndroidManifest.xml to add the preferredDisplayModeId
 * which allows the app to use the device's maximum refresh rate.
 *
 * For OnePlus 13 and other high refresh rate devices (90Hz, 120Hz, 144Hz)
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const withAndroidHighRefreshRate = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Add preferredDisplayModeId to use highest refresh rate available
    // This will enable 120Hz on devices that support it
    if (!mainApplication.$) {
      mainApplication.$ = {};
    }

    // Add high refresh rate support
    mainApplication.$['android:preferredDisplayModeId'] = '0';

    return config;
  });
};

module.exports = withAndroidHighRefreshRate;
