import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/lib/data/database';

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
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
