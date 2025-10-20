/**
 * Color Utility Functions
 *
 * Helper functions for color conversions and manipulations
 */

/**
 * Convert hex color to RGBA format (for Skia components)
 *
 * @param hex - Hex color string (e.g., '#CB6843' or 'CB6843')
 * @param opacity - Alpha value (0-1)
 * @returns RGBA color string (e.g., 'rgba(203, 104, 67, 0.98)')
 *
 * @example
 * hexToRgba('#CB6843', 0.98) // 'rgba(203, 104, 67, 0.98)'
 * hexToRgba('CB6843', 0.5)   // 'rgba(203, 104, 67, 0.5)'
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove '#' if present
  const cleanHex = hex.replace('#', '');

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB or RRGGBB`);
  }

  // Parse RGB components
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Clamp opacity to 0-1 range
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

/**
 * Convert hex color to RGB format
 *
 * @param hex - Hex color string (e.g., '#CB6843' or 'CB6843')
 * @returns RGB color string (e.g., 'rgb(203, 104, 67)')
 *
 * @example
 * hexToRgb('#CB6843') // 'rgb(203, 104, 67)'
 */
export function hexToRgb(hex: string): string {
  return hexToRgba(hex, 1).replace(/rgba\((.+),\s*1\)/, 'rgb($1)');
}

/**
 * Lighten a hex color by a percentage
 *
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 *
 * @example
 * lightenColor('#CB6843', 20) // '#D8814A' (approximate)
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);

  const r = Math.min(255, Math.floor(((num >> 16) & 0xff) * (1 + percent / 100)));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xff) * (1 + percent / 100)));
  const b = Math.min(255, Math.floor((num & 0xff) * (1 + percent / 100)));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color by a percentage
 *
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 *
 * @example
 * darkenColor('#CB6843', 20) // '#9A4C32' (approximate)
 */
export function darkenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);

  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - percent / 100)));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
