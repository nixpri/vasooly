import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/lib/data/database';
import { ThemeProvider, tokens } from './src/theme/ThemeProvider';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log('✅ Database initialized successfully');
        setIsDbReady(true);
      })
      .catch((error) => {
        console.error('❌ Database initialization failed:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error');
      });
  }, []);

  if (dbError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Database Error</Text>
            <Text style={styles.errorMessage}>{dbError}</Text>
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  if (!isDbReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.colors.brand.primary} />
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.base,
  },
  loadingText: {
    marginTop: tokens.spacing.lg,
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.regular,
    color: tokens.colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.base,
    padding: tokens.spacing['2xl'],
  },
  errorText: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.error,
    marginBottom: tokens.spacing.md,
  },
  errorMessage: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.regular,
    color: tokens.colors.text.primary,
    textAlign: 'center',
  },
});
