/**
 * DashboardScreen - Main home screen
 *
 * Features:
 * - Balance overview card (owed to you vs you owe)
 * - Quick action buttons (Add Vasooly, Settle Up, Invite Friend)
 * - Recent activity feed (5 most recent bills)
 * - Pull-to-refresh functionality
 * - Empty state when no bills exist
 *
 * Design: Earthen color palette with glass-morphism cards
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
  InteractionManager,
} from 'react-native';
import { ChevronRight, ClipboardList } from 'lucide-react-native';
import { useBillStore } from '../stores/billStore';
import { useSettingsStore } from '../stores/settingsStore';
import { tokens } from '../theme/tokens';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionCard } from '../components/TransactionCard';
import { PaymentStatus } from '../types';
import type { DashboardScreenProps } from '@/navigation/types';
import { listPerformanceProps } from '../utils/performance';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // Zustand stores
  const { bills, loadAllBills } = useBillStore();
  const { defaultUPIName } = useSettingsStore();

  // Separate refreshing state for pull-to-refresh (don't show spinner for automatic background refreshes)
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = React.useRef<any>(null);
  const lastFocusTime = React.useRef<number>(0);

  // Listen for focus - refresh data and scroll to top when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only scroll to top if focus happened within last 100ms (indicating tab press)
      // This prevents scrolling on back navigation
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;
      lastFocusTime.current = now;

      // Refresh data
      loadAllBills().catch((error) => {
        console.error('Failed to refresh dashboard:', error);
      });

      // Scroll to top only if this is a fresh focus (tab press, not back navigation)
      if (timeSinceLastFocus > 500 && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation, loadAllBills]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllBills();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAllBills]);

  // Get recent bills (most recent 5 by updatedAt)
  const recentBills = React.useMemo(() => {
    if (!bills || bills.length === 0) return [];

    return [...bills]
      .filter(bill => bill && bill.updatedAt) // Ensure valid bills
      .sort((a, b) => {
        // Handle date objects properly
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime();
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [bills]);
  const hasNoBills = recentBills.length === 0;

  // Calculate Vasooly metrics (excluding user's own amounts)
  // Helper function to check if participant is the current user
  const isCurrentUser = (participantName: string) => {
    const trimmedName = participantName.trim();

    // Check for "You" or empty string (current user markers)
    if (trimmedName === '' || trimmedName.toLowerCase() === 'you') {
      return true;
    }

    // Check against defaultUPIName if set
    if (defaultUPIName) {
      return trimmedName.toLowerCase() === defaultUPIName.toLowerCase();
    }

    return false;
  };

  // Calculate from ALL bills, not just recent 5
  const vasoolyMetrics = React.useMemo(() => {
    let totalVasoolyLeft = 0;  // Total pending from others
    let totalVasooled = 0;      // Total received from others
    const billsWithPending = new Set<string>();  // Track bills with pending amounts

    bills.forEach((bill) => {
      bill.participants.forEach((participant) => {
        // Skip if this is the current user's share
        if (isCurrentUser(participant.name)) return;

        if (participant.status === PaymentStatus.PAID) {
          totalVasooled += participant.amountPaise;
        } else {
          totalVasoolyLeft += participant.amountPaise;
          billsWithPending.add(bill.id);  // Track this bill has pending
        }
      });
    });

    return {
      totalVasoolyLeft,
      totalVasooled,
      totalPending: totalVasoolyLeft,  // Same as vasooly left
      pendingBillCount: billsWithPending.size,  // Bills with pending payments
      totalBillCount: bills.length,  // Total bills count
    };
  }, [bills, defaultUPIName]);

  // Navigation handlers
  const handleAddVasooly = () => {
    navigation.navigate('AddVasooly');
  };

  const handleViewAllActivity = () => {
    // Navigate to Activity tab and ensure ActivityScreen is shown
    navigation.getParent()?.navigate('Activity', { screen: 'ActivityScreen' });
  };

  const handleBillPress = (billId: string) => {
    navigation.navigate('VasoolyDetail', { billId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require('../../assets/vasooly-logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.colors.brand.primary}
            colors={[tokens.colors.brand.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={listPerformanceProps.removeClippedSubviews}
        scrollEventThrottle={listPerformanceProps.scrollEventThrottle}
      >

        {/* Balance Card */}
        <BalanceCard
          totalExpenses={vasoolyMetrics.totalVasoolyLeft}
          pendingBillCount={vasoolyMetrics.pendingBillCount}
          totalBillCount={vasoolyMetrics.totalBillCount}
          settledAmount={vasoolyMetrics.totalVasooled}
          pendingAmount={vasoolyMetrics.totalPending}
          onViewDetails={handleViewAllActivity}
          style={styles.balanceCard}
        />

        {/* Quick Actions - Hero CTA */}
        <View style={styles.quickActionsSection}>
          <Pressable onPress={handleAddVasooly} style={styles.heroActionButton}>
            <View style={styles.heroActionContent}>
              <View style={styles.heroIconContainer}>
                <Text style={styles.heroIcon}>₹</Text>
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroActionTitle}>Let's Vasooly!</Text>
                <Text style={styles.heroActionSubtitle}>Split your next bill</Text>
              </View>
              <ChevronRight size={24} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} />
            </View>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {!hasNoBills && (
              <Pressable onPress={handleViewAllActivity} hitSlop={8}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            )}
          </View>

          {/* Empty State */}
          {hasNoBills ? (
            <View style={styles.emptyState}>
              <ClipboardList size={48} color={tokens.colors.text.tertiary} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No bills yet</Text>
              <Text style={styles.emptyStateDescription}>
                Tap "Let's Vasooly!" to split your first bill
              </Text>
            </View>
          ) : (
            /* Recent Bills List */
            <View style={styles.activityList}>
              {recentBills.map((bill) => (
                <TransactionCard
                  key={bill.id}
                  bill={bill}
                  onPress={() => handleBillPress(bill.id)}
                  style={styles.transactionCard}
                />
              ))}
            </View>
          )}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerLogo: {
    width: 200,
    height: 44,
    marginLeft: -14,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: 120, // Extra padding for bottom tab bar
  },
  balanceCard: {
    marginBottom: tokens.spacing['2xl'],
  },
  quickActionsSection: {
    marginBottom: tokens.spacing['2xl'],
  },
  sectionTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  // Hero CTA styles (Option A)
  heroActionButton: {
    backgroundColor: tokens.colors.amber[500],
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    shadowColor: tokens.colors.amber[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  heroActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    fontSize: 26,
    color: tokens.colors.text.inverse,
    fontWeight: '700',
  },
  heroTextContainer: {
    flex: 1,
    gap: 2,
  },
  heroActionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.inverse,
    letterSpacing: 0.3,
  },
  heroActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  recentActivitySection: {
    marginBottom: tokens.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  viewAllLink: {
    ...tokens.typography.body,
    color: tokens.colors.amber[600],  // Amber for links (better visibility)
    fontWeight: '600',
  },
  activityList: {
    gap: tokens.spacing.md,
  },
  transactionCard: {
    // Individual card spacing handled by component
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing['4xl'],
    gap: tokens.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
