/**
 * Bill History Screen - List all bills with search and filter
 *
 * Features:
 * - FlashList for optimized rendering
 * - Search with database integration
 * - Pull-to-refresh
 * - Integration with historyStore
 * - React Navigation integration
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '@/components/GlassCard';
import { formatPaise } from '@/lib/business/splitEngine';
import { PaymentStatus } from '@/types';
import type { Bill } from '@/types';
import { useHistoryStore } from '@/stores';
import type { BillHistoryScreenProps } from '@/navigation/AppNavigator';
import { tokens } from '@/theme/ThemeProvider';

export const BillHistoryScreen: React.FC<BillHistoryScreenProps> = ({ navigation }) => {
  const {
    filteredBills,
    searchQuery,
    isLoading,
    loadBills,
    refreshBills,
    setSearchQuery,
  } = useHistoryStore();

  // Load bills on mount
  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Auto-refresh bills when screen gains focus (e.g., after creating/editing/deleting a bill)
  useFocusEffect(
    useCallback(() => {
      refreshBills();
    }, [refreshBills])
  );

  const handleRefresh = async () => {
    await refreshBills();
  };

  const handleBillPress = useCallback(
    (bill: Bill) => {
      navigation.navigate('BillDetail', { billId: bill.id });
    },
    [navigation]
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate('BillCreate');
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const calculateBillProgress = (bill: Bill): number => {
    if (bill.participants.length === 0) return 0;
    const paidCount = bill.participants.filter((p) => p.status === PaymentStatus.PAID).length;
    return (paidCount / bill.participants.length) * 100;
  };

  const getPaymentStatusText = (bill: Bill): string => {
    const paidCount = bill.participants.filter((p) => p.status === PaymentStatus.PAID).length;
    const totalCount = bill.participants.length;

    if (totalCount === 0) return 'No participants';
    if (paidCount === 0) return 'No payments yet';
    if (paidCount === totalCount) return 'Fully settled';
    return `${paidCount}/${totalCount} paid`;
  };

  const renderBillCard = useCallback(
    ({ item: bill }: { item: Bill }) => {
      const progress = calculateBillProgress(bill);
      const statusText = getPaymentStatusText(bill);
      // Check both progress percentage and actual payment status for settled state
      const paidCount = bill.participants.filter((p) => p.status === PaymentStatus.PAID).length;
      const totalCount = bill.participants.length;
      const isSettled = totalCount > 0 && paidCount === totalCount;

      return (
        <TouchableOpacity
          onPress={() => handleBillPress(bill)}
          activeOpacity={0.7}
          style={styles.billCardWrapper}
        >
          <GlassCard style={styles.billCard} borderRadius={16}>
            <View style={styles.billCardContent}>
              {/* Header */}
              <View style={styles.billHeader}>
                <Text style={styles.billTitle} numberOfLines={1}>
                  {bill.title}
                </Text>
                {isSettled && (
                  <View style={styles.settledBadge}>
                    <Text style={styles.settledBadgeText}>✓ Settled</Text>
                  </View>
                )}
              </View>

              {/* Amount */}
              <Text style={styles.billAmount}>{formatPaise(bill.totalAmountPaise)}</Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: isSettled ? tokens.colors.financial.settled : tokens.colors.brand.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                </View>
                <Text style={styles.progressText}>{statusText}</Text>
              </View>

              {/* Footer */}
              <View style={styles.billFooter}>
                <Text style={styles.participantCount}>
                  {bill.participants.length} {bill.participants.length === 1 ? 'person' : 'people'}
                </Text>
                <Text style={styles.billDate}>
                  {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      );
    },
    [handleBillPress]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No bills yet</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No bills match your search' : 'Create your first bill to get started'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePress} activeOpacity={0.8}>
          <Text style={styles.createButtonText}>Create Bill</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Bill History</Text>
            <Text style={styles.headerSubtitle}>
              {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={styles.settingsButton}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreatePress}
              style={styles.createHeaderButton}
              activeOpacity={0.8}
            >
              <Text style={styles.createHeaderButtonText}>+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* KeyboardAvoidingView wraps search and list */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior='padding'
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <GlassCard style={styles.searchCard} borderRadius={12}>
            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search bills..."
                placeholderTextColor={tokens.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </View>

        {/* Bill List */}
        <View style={styles.listContainer}>
          <FlashList
            data={filteredBills}
            renderItem={renderBillCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={tokens.colors.brand.primary}
                colors={[tokens.colors.brand.primary]}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  headerText: {
    flex: 1,
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
  headerButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  createHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  createHeaderButtonText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.inverse,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
  },
  searchCard: {
    width: '100%',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: tokens.spacing.xs,
  },
  clearButtonText: {
    fontSize: 18,
    color: tokens.colors.text.tertiary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  billCardWrapper: {
    marginBottom: 10,
  },
  billCard: {
    width: '100%',
  },
  billCardContent: {
    padding: 14,
    gap: 10,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  billTitle: {
    flex: 1,
    fontSize: tokens.typography.bodyLarge.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  settledBadge: {
    paddingHorizontal: tokens.components.badge.padding.horizontal,
    paddingVertical: tokens.components.badge.padding.vertical,
    backgroundColor: tokens.colors.financial.positiveLight,
    borderRadius: tokens.components.badge.borderRadius,
    borderWidth: 1,
    borderColor: tokens.colors.financial.positive,
  },
  settledBadgeText: {
    fontSize: 11,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.financial.positive,
  },
  billAmount: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: tokens.colors.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 11,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.secondary,
    minWidth: 28,
  },
  progressText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
  },
  billFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCount: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  billDate: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['3xl'],
    paddingTop: 60,
    gap: tokens.spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  emptyText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: tokens.spacing.md,
    paddingHorizontal: tokens.components.button.padding.horizontal,
    paddingVertical: tokens.components.button.padding.vertical,
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.inverse,
    textAlign: 'center',
  },
});
