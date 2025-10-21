/**
 * Activity Screen - Timeline view of all bill activities with grouping and filters
 *
 * Features:
 * - Timeline view with date grouping (Today, Yesterday, This Week, Earlier)
 * - Activity type icons and color coding
 * - Enhanced filters (All, This Month, Last Month, Settled, Unsettled)
 * - FlashList for optimized rendering
 * - Pull-to-refresh
 * - Search functionality
 */

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { ActivityCard } from '@/components/ActivityCard';
import { DateGroupHeader } from '@/components/DateGroupHeader';
import { ActivityType } from '@/types';
import type { Bill } from '@/types';
import { useHistoryStore } from '@/stores';
import type { ActivityScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';

type FilterType = 'all' | 'thisMonth' | 'lastMonth' | 'settled' | 'unsettled';

interface GroupedActivity {
  type: 'header' | 'activity';
  label?: string; // for headers
  bill?: Bill; // for activities
  activityType?: ActivityType; // for activities
  key: string;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ navigation }) => {
  const {
    filteredBills,
    searchQuery,
    isLoading,
    loadBills,
    refreshBills,
    setSearchQuery,
  } = useHistoryStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Load bills on mount
  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Auto-refresh bills when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refreshBills();
    }, [refreshBills])
  );

  const handleRefresh = async () => {
    await refreshBills();
  };

  const handleActivityPress = useCallback(
    (bill: Bill) => {
      navigation.navigate('BillDetail', { billId: bill.id });
    },
    [navigation]
  );

  // Determine activity type based on bill state
  const getActivityType = (bill: Bill): ActivityType => {
    if (bill.status === 'SETTLED') return ActivityType.BILL_SETTLED;

    const paidCount = bill.participants.filter((p) => p.status === 'PAID').length;
    const totalCount = bill.participants.length;

    if (paidCount === totalCount && totalCount > 0) return ActivityType.BILL_SETTLED;
    if (paidCount > 0) return ActivityType.PAYMENT_MADE;

    // Check if bill was recently updated
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(bill.createdAt).getTime()) / 86400000
    );
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(bill.updatedAt).getTime()) / 86400000
    );

    if (daysSinceCreation > 0 && daysSinceUpdate < daysSinceCreation) {
      return ActivityType.BILL_UPDATED;
    }

    return ActivityType.BILL_CREATED;
  };

  // Group bills by date
  const groupedActivities = useMemo((): GroupedActivity[] => {
    // Apply filters
    let bills = filteredBills;

    if (activeFilter === 'thisMonth') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      bills = bills.filter((b) => new Date(b.updatedAt) >= startOfMonth);
    } else if (activeFilter === 'lastMonth') {
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      bills = bills.filter((b) => {
        const date = new Date(b.updatedAt);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });
    } else if (activeFilter === 'settled') {
      bills = bills.filter((b) => b.status === 'SETTLED');
    } else if (activeFilter === 'unsettled') {
      bills = bills.filter((b) => b.status !== 'SETTLED');
    }

    // Group by date category
    const groups: { [key: string]: Bill[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    bills.forEach((bill) => {
      const billDate = new Date(bill.updatedAt);
      const billDateOnly = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());

      if (billDateOnly.getTime() === today.getTime()) {
        groups.today.push(bill);
      } else if (billDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(bill);
      } else if (billDateOnly >= weekStart) {
        groups.thisWeek.push(bill);
      } else {
        groups.earlier.push(bill);
      }
    });

    // Flatten into timeline format with headers
    const result: GroupedActivity[] = [];

    if (groups.today.length > 0) {
      result.push({ type: 'header', label: 'Today', key: 'header-today' });
      groups.today.forEach((bill) =>
        result.push({
          type: 'activity',
          bill,
          activityType: getActivityType(bill),
          key: `activity-${bill.id}`,
        })
      );
    }

    if (groups.yesterday.length > 0) {
      result.push({ type: 'header', label: 'Yesterday', key: 'header-yesterday' });
      groups.yesterday.forEach((bill) =>
        result.push({
          type: 'activity',
          bill,
          activityType: getActivityType(bill),
          key: `activity-${bill.id}`,
        })
      );
    }

    if (groups.thisWeek.length > 0) {
      result.push({ type: 'header', label: 'This Week', key: 'header-thisWeek' });
      groups.thisWeek.forEach((bill) =>
        result.push({
          type: 'activity',
          bill,
          activityType: getActivityType(bill),
          key: `activity-${bill.id}`,
        })
      );
    }

    if (groups.earlier.length > 0) {
      result.push({ type: 'header', label: 'Earlier', key: 'header-earlier' });
      groups.earlier.forEach((bill) =>
        result.push({
          type: 'activity',
          bill,
          activityType: getActivityType(bill),
          key: `activity-${bill.id}`,
        })
      );
    }

    return result;
  }, [filteredBills, activeFilter]);

  const renderItem = useCallback(
    ({ item }: { item: GroupedActivity }) => {
      if (item.type === 'header') {
        return <DateGroupHeader label={item.label!} />;
      }

      return (
        <ActivityCard
          bill={item.bill!}
          activityType={item.activityType!}
          onPress={() => handleActivityPress(item.bill!)}
        />
      );
    },
    [handleActivityPress]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No activity yet</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No activity matches your search'
          : activeFilter !== 'all'
          ? `No ${activeFilter} activity found`
          : 'Create your first bill to see activity here'}
      </Text>
    </View>
  );

  const filters: { type: FilterType; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'thisMonth', label: 'This Month' },
    { type: 'lastMonth', label: 'Last Month' },
    { type: 'settled', label: 'Settled' },
    { type: 'unsettled', label: 'Unsettled' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSubtitle}>
            {groupedActivities.filter((g) => g.type === 'activity').length} activities
          </Text>
        </View>
      </View>

      {/* KeyboardAvoidingView wraps search, filters, and list */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <GlassCard style={styles.searchCard} borderRadius={12}>
            <View style={styles.searchInputWrapper}>
              <Search size={16} color={tokens.colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search activity..."
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
                  <X size={16} color={tokens.colors.text.tertiary} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.type}
              onPress={() => setActiveFilter(filter.type)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.filterChip,
                  activeFilter === filter.type && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter.type && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity List */}
        <View style={styles.listContainer}>
          <FlashList
            data={groupedActivities}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={tokens.colors.sage[500]}
                colors={[tokens.colors.sage[500]]}
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
    gap: 2,
  },
  headerTitle: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
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
  filtersScrollView: {
    flexGrow: 0,
  },
  filtersContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.sage[500],
    borderColor: tokens.colors.sage[500],
  },
  filterChipText: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
  },
  filterChipTextActive: {
    color: tokens.colors.text.inverse,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.xl,
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
});
