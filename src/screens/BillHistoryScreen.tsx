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

    if (paidCount === 0) return 'No payments yet';
    if (paidCount === totalCount) return 'Fully settled';
    return `${paidCount}/${totalCount} paid`;
  };

  const renderBillCard = useCallback(
    ({ item: bill }: { item: Bill }) => {
      const progress = calculateBillProgress(bill);
      const statusText = getPaymentStatusText(bill);
      const isSettled = progress === 100;

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
                          backgroundColor: isSettled ? '#10B981' : '#6C5CE7',
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
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                tintColor="#6C5CE7"
                colors={['#6C5CE7']}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  createHeaderButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#6C5CE7',
    borderRadius: 6,
  },
  createHeaderButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settledBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  settledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 28,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  billFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  billDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
