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
import type { SettingsScreenProps } from '@/navigation/AppNavigator';

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

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update local state when store values change
  useEffect(() => {
    if (defaultVPA) setVpaInput(defaultVPA);
    if (defaultUPIName) setNameInput(defaultUPIName);
  }, [defaultVPA, defaultUPIName]);

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
            try {
              await resetSettings();
              setVpaInput('');
              setNameInput('');
              setIsEditingVPA(false);
              Alert.alert('Success', 'All settings have been reset to defaults');
            } catch (err) {
              console.error('Failed to reset settings:', err);
            }
          },
        },
      ]
    );
  };

  const handleHapticsToggle = async (value: boolean) => {
    try {
      await setEnableHaptics(value);
    } catch (err) {
      console.error('Failed to update haptics setting:', err);
    }
  };

  const handleReminderToggle = async (value: boolean) => {
    try {
      await setReminderEnabled(value);
    } catch (err) {
      console.error('Failed to update reminder setting:', err);
    }
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
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                      <ActivityIndicator size="small" color="#FFFFFF" />
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
                value={enableHaptics}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: '#3e3e3e', true: '#C2662D' }}
                thumbColor={enableHaptics ? '#FFFFFF' : '#f4f3f4'}
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
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: '#3e3e3e', true: '#C2662D' }}
                thumbColor={reminderEnabled ? '#FFFFFF' : '#f4f3f4'}
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
                minimumTrackTintColor="#C2662D"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#FFFFFF"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#EF4444" />
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
    backgroundColor: '#0A0A0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 13,
    color: '#C2662D',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  dangerTitle: {
    color: '#EF4444',
  },
  card: {
    marginBottom: 10,
  },
  dangerCard: {
    marginBottom: 10,
    borderColor: 'rgba(239, 68, 68, 0.2)',
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
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vpaId: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  vpaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  vpaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
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
    backgroundColor: '#C2662D',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  buttonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dangerText: {
    color: '#EF4444',
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
    color: 'rgba(255, 255, 255, 0.4)',
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C2662D',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  appInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});
