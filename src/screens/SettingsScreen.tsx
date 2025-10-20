/**
 * Settings Screen - User preferences management
 *
 * Features:
 * - Default VPA (UPI ID) management with validation
 * - Haptic feedback toggle
 * - Auto-delete days configuration
 * - Reminder settings
 * - Reset settings functionality
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { GlassCard } from '@/components/GlassCard';
import { useSettingsStore } from '@/stores';
import type { SettingsScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const {
    defaultVPA,
    defaultUPIName,
    enableHaptics,
    autoDeleteDays,
    reminderEnabled,
    isLoading,
    error,
    setDefaultVPA,
    clearDefaultVPA,
    setEnableHaptics,
    setAutoDeleteDays,
    setReminderEnabled,
    resetSettings,
    loadSettings,
    clearError,
    hasDefaultVPA,
  } = useSettingsStore();

  // Local state for form inputs
  const [vpaInput, setVpaInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isEditingVPA, setIsEditingVPA] = useState(false);

  // Local state for toggles to prevent jitter
  const [localHaptics, setLocalHaptics] = useState(enableHaptics);
  const [localReminders, setLocalReminders] = useState(reminderEnabled);
  const [isResetting, setIsResetting] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update local state when store values change
  useEffect(() => {
    if (defaultVPA) setVpaInput(defaultVPA);
    if (defaultUPIName) setNameInput(defaultUPIName);
  }, [defaultVPA, defaultUPIName]);

  // Sync local toggle states with store
  useEffect(() => {
    setLocalHaptics(enableHaptics);
  }, [enableHaptics]);

  useEffect(() => {
    setLocalReminders(reminderEnabled);
  }, [reminderEnabled]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSaveVPA = async () => {
    if (!vpaInput.trim() || !nameInput.trim()) {
      Alert.alert('Error', 'Please enter both VPA and name');
      return;
    }

    try {
      await setDefaultVPA(vpaInput.trim(), nameInput.trim());
      setIsEditingVPA(false);
      Alert.alert('Success', 'Default VPA saved successfully');
    } catch (err) {
      // Error is already in store state
      console.error('Failed to save VPA:', err);
    }
  };

  const handleClearVPA = () => {
    Alert.alert(
      'Clear Default VPA',
      'Are you sure you want to remove your default UPI ID?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearDefaultVPA();
              setVpaInput('');
              setNameInput('');
              setIsEditingVPA(false);
              Alert.alert('Success', 'Default VPA cleared');
            } catch (err) {
              console.error('Failed to clear VPA:', err);
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await resetSettings();
              setVpaInput('');
              setNameInput('');
              setIsEditingVPA(false);
              setLocalHaptics(true); // Reset to defaults
              setLocalReminders(false);
              Alert.alert('Success', 'All settings have been reset to defaults');
            } catch (err) {
              console.error('Failed to reset settings:', err);
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleHapticsToggle = (value: boolean) => {
    // Update local state immediately for smooth UI
    setLocalHaptics(value);
    // Update store asynchronously
    setEnableHaptics(value).catch((err) => {
      console.error('Failed to update haptics setting:', err);
      // Revert on error
      setLocalHaptics(!value);
    });
  };

  const handleReminderToggle = (value: boolean) => {
    // Update local state immediately for smooth UI
    setLocalReminders(value);
    // Update store asynchronously
    setReminderEnabled(value).catch((err) => {
      console.error('Failed to update reminder setting:', err);
      // Revert on error
      setLocalReminders(!value);
    });
  };

  const handleAutoDeleteDaysChange = async (value: number) => {
    try {
      await setAutoDeleteDays(Math.round(value));
    } catch (err) {
      console.error('Failed to update auto-delete days:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Message */}
        {error && (
          <GlassCard style={styles.errorCard} borderRadius={12}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </GlassCard>
        )}

        {/* Default VPA Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default UPI ID</Text>
          <Text style={styles.sectionDescription}>
            Set your default VPA for receiving payments
          </Text>

          <GlassCard style={styles.card} borderRadius={12}>
            {!hasDefaultVPA() || isEditingVPA ? (
              <View style={styles.cardContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>UPI ID (VPA)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yourname@paytm"
                    placeholderTextColor={tokens.colors.text.tertiary}
                    value={vpaInput}
                    onChangeText={setVpaInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  <Text style={styles.inputHint}>
                    Format: username@bankname (e.g., john@paytm)
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={tokens.colors.text.tertiary}
                    value={nameInput}
                    onChangeText={setNameInput}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={handleSaveVPA}
                    style={[styles.button, styles.buttonPrimary]}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={tokens.colors.text.inverse} />
                    ) : (
                      <Text style={styles.buttonTextPrimary}>Save</Text>
                    )}
                  </TouchableOpacity>
                  {isEditingVPA && hasDefaultVPA() && (
                    <TouchableOpacity
                      onPress={() => {
                        setVpaInput(defaultVPA || '');
                        setNameInput(defaultUPIName || '');
                        setIsEditingVPA(false);
                      }}
                      style={[styles.button, styles.buttonSecondary]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonTextSecondary}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.cardContent}>
                <View style={styles.vpaDisplay}>
                  <View style={styles.vpaInfo}>
                    <Text style={styles.vpaName}>{defaultUPIName}</Text>
                    <Text style={styles.vpaId}>{defaultVPA}</Text>
                  </View>
                  <View style={styles.vpaBadge}>
                    <Text style={styles.vpaBadgeText}>✓ Set</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={() => setIsEditingVPA(true)}
                    style={[styles.button, styles.buttonSecondary]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonTextSecondary}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClearVPA}
                    style={[styles.button, styles.buttonDanger]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonTextDanger}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </GlassCard>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Haptic Feedback */}
          <GlassCard style={styles.card} borderRadius={12}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>
                  Feel vibrations for button presses
                </Text>
              </View>
              <Switch
                value={localHaptics}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: tokens.colors.border.medium, true: tokens.colors.brand.primary }}
                thumbColor={localHaptics ? tokens.colors.text.inverse : tokens.colors.background.elevated}
              />
            </View>
          </GlassCard>

          {/* Reminders */}
          <GlassCard style={styles.card} borderRadius={12}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Payment Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified for pending payments
                </Text>
              </View>
              <Switch
                value={localReminders}
                onValueChange={handleReminderToggle}
                trackColor={{ false: tokens.colors.border.medium, true: tokens.colors.brand.primary }}
                thumbColor={localReminders ? tokens.colors.text.inverse : tokens.colors.background.elevated}
              />
            </View>
          </GlassCard>

          {/* Auto-Delete Days */}
          <GlassCard style={styles.card} borderRadius={12}>
            <View style={styles.cardContent}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-Delete Settled Bills</Text>
                <Text style={styles.settingDescription}>
                  Delete settled bills after {autoDeleteDays} days
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={365}
                step={1}
                value={autoDeleteDays}
                onSlidingComplete={handleAutoDeleteDaysChange}
                minimumTrackTintColor={tokens.colors.brand.primary}
                maximumTrackTintColor={tokens.colors.border.default}
                thumbTintColor={tokens.colors.text.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1 day</Text>
                <Text style={styles.sliderValue}>{autoDeleteDays} days</Text>
                <Text style={styles.sliderLabel}>365 days</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

          <GlassCard style={styles.dangerCard} borderRadius={12}>
            <View style={styles.cardContent}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  Reset All Settings
                </Text>
                <Text style={styles.settingDescription}>
                  Restore all settings to their default values
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleResetSettings}
                style={[styles.button, styles.buttonDanger, { marginTop: 12 }]}
                activeOpacity={0.8}
                disabled={isResetting}
              >
                {isResetting ? (
                  <ActivityIndicator size="small" color={tokens.colors.error.main} />
                ) : (
                  <Text style={styles.buttonTextDanger}>Reset Settings</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Vasooly v1.0.0</Text>
          <Text style={styles.appInfoText}>Bill splitting made simple</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 52,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  backButton: {
    marginBottom: tokens.spacing.sm,
  },
  backButtonText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.brand.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  headerTitle: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.xl,
    paddingBottom: 40,
  },
  errorCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: tokens.colors.error.light,
    borderColor: tokens.colors.error.main,
    borderWidth: 1,
  },
  errorText: {
    color: tokens.colors.error.main,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginBottom: 12,
  },
  dangerTitle: {
    color: tokens.colors.error.main,
  },
  card: {
    marginBottom: 10,
  },
  dangerCard: {
    marginBottom: 10,
    borderColor: tokens.colors.error.dark,
    borderWidth: 1,
  },
  cardContent: {
    padding: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: tokens.colors.background.input,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: tokens.colors.text.primary,
  },
  inputHint: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 6,
  },
  vpaDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vpaInfo: {
    flex: 1,
  },
  vpaName: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  vpaId: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  vpaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: tokens.colors.financial.positiveLight,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: tokens.colors.financial.positive,
  },
  vpaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.financial.positive,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPrimary: {
    backgroundColor: tokens.colors.brand.primary,
  },
  buttonSecondary: {
    backgroundColor: tokens.colors.background.subtle,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  buttonDanger: {
    backgroundColor: tokens.colors.error.light,
    borderWidth: 1,
    borderColor: tokens.colors.error.main,
  },
  buttonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.inverse,
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  buttonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.error.main,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
  },
  dangerText: {
    color: tokens.colors.error.main,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: tokens.colors.text.tertiary,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.brand.primary,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
});
