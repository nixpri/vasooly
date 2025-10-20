/**
 * Friends List Screen - Placeholder
 *
 * Temporary placeholder for Friends tab. Will be implemented in Week 13.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FriendsListScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';

export const FriendsListScreen: React.FC<FriendsListScreenProps> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👥</Text>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Coming in Week 13</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  subtitle: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
});
