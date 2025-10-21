/**
 * Profile Screen - User profile with statistics and settings access
 *
 * Features:
 * - User information display (UPI name and ID)
 * - Profile statistics (bills created, vasooly amount, settled count, success rate)
 * - Copy UPI ID functionality
 * - Settings access navigation
 * - Glass-morphism design consistency
 * - Lucide icons throughout
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { User, Copy, Settings, TrendingUp, CheckCircle, IndianRupee } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { useBillStore, useSettingsStore } from '@/stores';
import { formatPaise } from '@/lib/business/splitEngine';
import type { ProfileScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { bills, getSettledBills } = useBillStore();
  const { defaultUPIName, defaultVPA } = useSettingsStore();

  // Calculate profile statistics
  const stats = useMemo(() => {
    const totalBills = bills.length;
    const settledBills = getSettledBills().length;
    const successRate = totalBills > 0 ? (settledBills / totalBills) * 100 : 0;

    // Calculate total vasooly amount (sum of all bill amounts)
    const totalVasoolyPaise = bills.reduce((sum, bill) => sum + bill.totalAmountPaise, 0);

    return {
      totalBills,
      settledBills,
      successRate,
      totalVasoolyPaise,
    };
  }, [bills, getSettledBills]);

  const handleCopyUPI = async () => {
    if (defaultVPA) {
      await Clipboard.setStringAsync(defaultVPA);
      Alert.alert('Copied', 'UPI ID copied to clipboard');
    }
  };

  const displayName = defaultUPIName || 'User';
  const displayUPI = defaultVPA || 'Not set';
  const hasUPI = defaultVPA !== null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Info Card */}
      <GlassCard style={styles.userCard} borderRadius={16}>
        <View style={styles.userInfoContent}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <User size={48} color={tokens.colors.brand.primary} strokeWidth={2} />
          </View>

          {/* User Name */}
          <Text style={styles.userName}>{displayName}</Text>

          {/* UPI ID with Copy */}
          {hasUPI && (
            <TouchableOpacity
              style={styles.upiContainer}
              onPress={handleCopyUPI}
              activeOpacity={0.7}
            >
              <Text style={styles.upiText}>{displayUPI}</Text>
              <Copy size={16} color={tokens.colors.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {!hasUPI && (
            <Text style={styles.noUpiText}>No UPI ID set</Text>
          )}
        </View>
      </GlassCard>

      {/* Statistics Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Statistics</Text>
      </View>

      <View style={styles.statsGrid}>
        {/* Total Bills */}
        <GlassCard style={styles.statCard} borderRadius={12}>
          <View style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.sage[500]}15` }]}>
              <TrendingUp size={24} color={tokens.colors.sage[500]} strokeWidth={2} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.totalBills}</Text>
              <Text style={styles.statLabel}>Bills Created</Text>
            </View>
          </View>
        </GlassCard>

        {/* Total Vasooly Amount */}
        <GlassCard style={styles.statCard} borderRadius={12}>
          <View style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.amber[500]}15` }]}>
              <IndianRupee size={24} color={tokens.colors.amber[500]} strokeWidth={2} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{formatPaise(stats.totalVasoolyPaise)}</Text>
              <Text style={styles.statLabel}>Vasooly Amount</Text>
            </View>
          </View>
        </GlassCard>

        {/* Settled Bills */}
        <GlassCard style={styles.statCard} borderRadius={12}>
          <View style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.brand.primary}15` }]}>
              <CheckCircle size={24} color={tokens.colors.brand.primary} strokeWidth={2} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.settledBills}</Text>
              <Text style={styles.statLabel}>Bills Settled</Text>
            </View>
          </View>
        </GlassCard>

        {/* Success Rate */}
        <GlassCard style={styles.statCard} borderRadius={12}>
          <View style={styles.statCardContent}>
            <View style={[styles.statIconContainer, { backgroundColor: `${tokens.colors.sage[500]}15` }]}>
              <TrendingUp size={24} color={tokens.colors.sage[500]} strokeWidth={2} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.successRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <GlassCard style={styles.settingsCard} borderRadius={12}>
          <View style={styles.settingsContent}>
            <View style={[styles.settingsIconContainer, { backgroundColor: `${tokens.colors.text.tertiary}15` }]}>
              <Settings size={22} color={tokens.colors.text.tertiary} strokeWidth={2} />
            </View>
            <Text style={styles.settingsText}>Settings</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Calculate stat card width: (screen width - horizontal padding - gap) / 2
const { width: screenWidth } = Dimensions.get('window');
const STAT_CARD_WIDTH = (screenWidth - (tokens.spacing.lg * 2) - tokens.spacing.md) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  contentContainer: {
    paddingHorizontal: tokens.spacing.lg, // 16px for proper card alignment
    paddingBottom: tokens.spacing['2xl'], // 24px bottom padding for scroll clearance
  },
  header: {
    paddingTop: 52,
    paddingBottom: tokens.spacing.lg,
  },
  headerTitle: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  userCard: {
    width: '100%',
    paddingVertical: tokens.spacing['2xl'], // 24px top/bottom
    paddingHorizontal: tokens.spacing.xl, // 20px left/right
    marginBottom: tokens.spacing.xl, // 20px below card
  },
  userInfoContent: {
    width: '100%',
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: tokens.radius.full,
    backgroundColor: `${tokens.colors.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.lg, // 16px below avatar
  },
  userName: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm, // 8px below name
    textAlign: 'center',
    width: '100%',
  },
  upiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
  },
  upiText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  noUpiText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: tokens.spacing.md, // 12px below section title
  },
  sectionTitle: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md, // 12px gap between cards
    marginBottom: tokens.spacing['2xl'], // 24px below grid (reduced from 40px, compensated elsewhere)
  },
  statCard: {
    width: STAT_CARD_WIDTH, // Calculated: (screenWidth - 32px padding - 12px gap) / 2
    padding: tokens.spacing.md, // 12px all around
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md, // 12px between icon and text
  },
  statTextContainer: {
    flex: 1,
    gap: tokens.spacing.xs, // 4px between value and label
  },
  statIconContainer: {
    width: 48, // 48px icon container
    height: 48,
    borderRadius: tokens.radius.md, // 12px radius
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Prevent icon container from shrinking
  },
  statValue: {
    fontSize: tokens.typography.h3.fontSize, // 20px
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  statLabel: {
    fontSize: tokens.typography.caption.fontSize, // 12px
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  settingsButton: {
    width: '100%',
    marginTop: tokens.spacing.lg, // 16px above settings button for guaranteed separation
  },
  settingsCard: {
    width: '100%',
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg, // 16px padding (increased from 12px)
    gap: tokens.spacing.md, // 12px gap (increased from 8px)
  },
  settingsIconContainer: {
    width: 44, // 44px icon container (increased from 40px)
    height: 44,
    borderRadius: tokens.radius.md, // 12px radius (increased from 8px)
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: tokens.typography.bodyLarge.fontSize, // 16px (increased from 14px)
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
});
