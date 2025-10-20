/**
 * Profile Screen - Placeholder
 *
 * Temporary placeholder for Profile tab. Will be implemented in Week 13.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ProfileScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Coming in Week 13</Text>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
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
  settingsButton: {
    marginTop: tokens.spacing.lg,
    paddingHorizontal: tokens.components.button.padding.horizontal,
    paddingVertical: tokens.components.button.padding.vertical,
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
  },
  settingsButtonText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.inverse,
  },
});
