/**
 * DashboardScreen - Main home screen
 *
 * Features:
 * - Balance overview card (owed to you vs you owe)
 * - Quick action buttons (Add Expense, Settle Up, Invite Friend)
 * - Recent activity feed (5 most recent bills)
 * - Pull-to-refresh functionality
 * - Empty state when no bills exist
 *
 * Design: Earthen color palette with glass-morphism cards
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  SafeAreaView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBillStore } from '../stores/billStore';
import { useHistoryStore } from '../stores/historyStore';
import { tokens } from '../theme/tokens';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionCard } from '../components/TransactionCard';
import { AnimatedButton } from '../components/AnimatedButton';

type RootStackParamList = {
  Dashboard: undefined;
  BillCreate: { billId?: string } | undefined;
  BillDetail: { billId: string };
  BillHistory: undefined;
};

type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // Zustand stores
  const { loadAllBills, getNetBalance } = useBillStore();
  const { loadHistory, refreshHistory, getRecentActivity, isRefreshing } = useHistoryStore();

  // Load data on mount
  useEffect(() => {
    loadAllBills();
    loadHistory();
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([loadAllBills(), refreshHistory()]);
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }, [loadAllBills, refreshHistory]);

  // Get balance data
  const netBalancePaise = getNetBalance();

  // For now, we'll show simplified balance (total owed to you)
  // In a full implementation, we'd calculate separate owedTo and owedBy
  const owedTo = netBalancePaise > 0 ? netBalancePaise : 0;
  const owedBy = netBalancePaise < 0 ? Math.abs(netBalancePaise) : 0;

  // Get recent bills
  const recentBills = getRecentActivity(5);
  const hasNoBills = recentBills.length === 0;

  // Navigation handlers
  const handleAddExpense = () => {
    navigation.navigate('BillCreate');
  };

  const handleSettleUp = () => {
    // TODO: Navigate to settle up screen (Week 13)
    console.log('Settle up pressed');
  };

  const handleInviteFriend = () => {
    // TODO: Open share/invite flow (Week 13)
    console.log('Invite friend pressed');
  };

  const handleViewAllActivity = () => {
    navigation.navigate('BillHistory');
  };

  const handleBillPress = (billId: string) => {
    navigation.navigate('BillDetail', { billId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tokens.colors.brand.primary}
            colors={[tokens.colors.brand.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your expense overview</Text>
        </View>

        {/* Balance Card */}
        <BalanceCard
          owedTo={owedTo}
          owedBy={owedBy}
          onSettleUp={handleSettleUp}
          style={styles.balanceCard}
        />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {/* Add Expense - Primary CTA */}
            <AnimatedButton onPress={handleAddExpense} style={styles.primaryActionButton} haptic>
              <Text style={styles.actionIcon}>+</Text>
              <Text style={styles.primaryActionLabel}>Add Expense</Text>
            </AnimatedButton>

            {/* Secondary Actions */}
            <View style={styles.secondaryActionsRow}>
              <AnimatedButton
                onPress={handleSettleUp}
                style={styles.secondaryActionButton}
                haptic
              >
                <Text style={styles.secondaryActionIcon}>✓</Text>
                <Text style={styles.secondaryActionLabel}>Settle Up</Text>
              </AnimatedButton>

              <AnimatedButton
                onPress={handleInviteFriend}
                style={styles.secondaryActionButton}
                haptic
              >
                <Text style={styles.secondaryActionIcon}>→</Text>
                <Text style={styles.secondaryActionLabel}>Invite</Text>
              </AnimatedButton>
            </View>
          </View>
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
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No expenses yet</Text>
              <Text style={styles.emptyStateDescription}>
                Tap "Add Expense" to create your first bill
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing['3xl'],
  },
  header: {
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing['2xl'],
  },
  headerTitle: {
    ...tokens.typography.h1,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
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
  quickActionsGrid: {
    gap: tokens.spacing.md,
  },
  primaryActionButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    ...tokens.shadows.md,
  },
  actionIcon: {
    fontSize: 24,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  primaryActionLabel: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  secondaryActionIcon: {
    fontSize: 18,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  secondaryActionLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
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
    color: tokens.colors.brand.primary,
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
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: tokens.spacing.lg,
  },
  emptyStateTitle: {
    ...tokens.typography.h2,
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
