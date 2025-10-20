/**
 * Vasooly Theme Provider
 *
 * Provides design tokens and theme context to the entire application.
 * Ensures fonts are loaded before rendering the app.
 *
 * @version 1.0
 * @date 2025-10-20
 */

import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { tokens } from './tokens';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 *
 * Loads Inter font family and provides design tokens to children.
 * Shows loading indicator while fonts are being loaded.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Show loading state while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tokens.colors.brand.primary} />
      </View>
    );
  }

  // If there's a font error, still render children (fallback to system fonts)
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.base,
  },
});

/**
 * Export tokens for easy access throughout the app
 */
export { tokens };
