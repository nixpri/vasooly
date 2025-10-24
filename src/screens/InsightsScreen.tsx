/**
 * Insights Screen
 *
 * Spending analytics and insights dashboard with:
 * - Key metrics (4-card grid)
 * - Monthly spending visualization
 * - Category breakdown with visual bars
 * - Spending trend
 * - Top karzedaars spending list
 * - Time period filters
 * - Empty state for insufficient data
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  TrendingUp,
  IndianRupee,
  FileText,
  CheckCircle,
  Percent,
} from 'lucide-react-native';
import { useBillStore } from '@/stores/billStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { ScreenHeader } from '@/components';
import { tokens } from '@/theme/tokens';
import { TimeRange, ExpenseCategory } from '@/types';
import {
  calculateMonthlySpending,
  calculateCategoryBreakdown,
  getTopKarzedaars,
  calculateKeyMetrics,
} from '@/utils/insightsCalculator';
import { formatPaise } from '@/lib/business/splitEngine';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const InsightsScreen: React.FC = () => {
  const { bills, loadAllBills } = useBillStore();
  const { defaultUPIName } = useSettingsStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('this_month');
  const [refreshing, setRefreshing] = useState(false);

  // Time range filter options
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'this_month', label: 'This Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'this_year', label: 'This Year' },
  ];

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllBills();
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAllBills]);

  // Calculate insights data
  const monthlyData = useMemo(
    () => calculateMonthlySpending(bills, selectedTimeRange, defaultUPIName ?? undefined),
    [bills, selectedTimeRange, defaultUPIName]
  );

  const categoryData = useMemo(
    () => calculateCategoryBreakdown(bills, selectedTimeRange, defaultUPIName ?? undefined),
    [bills, selectedTimeRange, defaultUPIName]
  );

  const topKarzedaars = useMemo(
    () => getTopKarzedaars(bills, selectedTimeRange, defaultUPIName ?? undefined, 5),
    [bills, selectedTimeRange, defaultUPIName]
  );

  const metrics = useMemo(
    () => calculateKeyMetrics(bills, selectedTimeRange, defaultUPIName ?? undefined),
    [bills, selectedTimeRange, defaultUPIName]
  );

  // Check if we have enough data (minimum 3 bills)
  const hasInsufficientData = bills.length < 3;

  // Calculate max value for bar chart scaling
  const maxMonthlyValue = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => d.totalPaise))
    : 1;

  // Calculate paid vs pending for each month
  const monthlyDataWithPayments = useMemo(() => {
    return monthlyData.map(monthData => {
      // Get all bills for this month
      const monthBills = bills.filter(bill => {
        const billDate = bill.createdAt instanceof Date ? bill.createdAt : new Date(bill.createdAt);
        const monthKey = `${billDate.toLocaleString('default', { month: 'short' })} ${billDate.getFullYear()}`;
        return monthKey === monthData.month;
      });

      // Calculate paid and pending amounts (excluding current user)
      let paidPaise = 0;
      let pendingPaise = 0;

      monthBills.forEach(bill => {
        bill.participants.forEach(participant => {
          // Skip current user
          const isUser = participant.name.trim() === '' ||
                         participant.name.toLowerCase() === 'you' ||
                         (defaultUPIName && participant.name.toLowerCase() === defaultUPIName.toLowerCase());

          if (!isUser) {
            if (participant.status === 'PAID') {
              paidPaise += participant.amountPaise;
            } else {
              pendingPaise += participant.amountPaise;
            }
          }
        });
      });

      return {
        ...monthData,
        paidPaise,
        pendingPaise,
      };
    });
  }, [monthlyData, bills, defaultUPIName]);

  // Get category display name
  const getCategoryName = (category: ExpenseCategory): string => {
    const names: Record<ExpenseCategory, string> = {
      [ExpenseCategory.FOOD]: 'Food & Drinks',
      [ExpenseCategory.TRAVEL]: 'Travel',
      [ExpenseCategory.SHOPPING]: 'Shopping',
      [ExpenseCategory.ENTERTAINMENT]: 'Entertainment',
      [ExpenseCategory.OTHER]: 'Other',
    };
    return names[category] || 'Other';
  };

  // Empty state
  if (hasInsufficientData) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Insights" />
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.colors.brand.primary}
              colors={[tokens.colors.brand.primary]}
            />
          }
        >
          <TrendingUp
            size={64}
            color={tokens.colors.text.tertiary}
            strokeWidth={1.5}
          />
          <Text style={styles.emptyStateTitle}>Not Enough Data</Text>
          <Text style={styles.emptyStateText}>
            Add at least 3 vasoolys to see spending insights and analytics.
          </Text>
          <Text style={styles.emptyStateHint}>
            Current vasoolys: {bills.length}/3
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Insights" />

      <ScrollView
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
      >
        {/* Time Range Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {timeRangeOptions.map(option => (
            <Pressable
              key={option.value}
              onPress={() => setSelectedTimeRange(option.value)}
              style={[
                styles.filterChip,
                selectedTimeRange === option.value && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedTimeRange === option.value && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Average Bill Size */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: tokens.colors.amber[100] }]}>
              <IndianRupee size={20} color={tokens.colors.amber[600]} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>{formatPaise(metrics.averageBillSizePaise)}</Text>
            <Text style={styles.metricLabel}>Avg Bill Size</Text>
          </View>

          {/* Total Bills */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: tokens.colors.sage[100] }]}>
              <FileText size={20} color={tokens.colors.sage[600]} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>{metrics.totalBills}</Text>
            <Text style={styles.metricLabel}>Total Bills</Text>
          </View>

          {/* Settled Bills */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: tokens.colors.terracotta[100] }]}>
              <CheckCircle size={20} color={tokens.colors.terracotta[600]} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>{metrics.settledBills}</Text>
            <Text style={styles.metricLabel}>Settled</Text>
          </View>

          {/* Settlement Rate */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: tokens.colors.sage[100] }]}>
              <Percent size={20} color={tokens.colors.sage[600]} strokeWidth={2} />
            </View>
            <Text style={styles.metricValue}>{Math.round(metrics.settlementRate)}%</Text>
            <Text style={styles.metricLabel}>Settled Rate</Text>
          </View>
        </View>

        {/* Monthly Spending Bar Chart */}
        {monthlyData.length > 0 && (
          <View style={styles.chartCard}>
            {/* Title and Legend Row */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <Text style={styles.cardTitle}>Monthly Spending</Text>
                <Text style={styles.cardSubtitle}>Vasooly collections over time</Text>
              </View>
              {/* Legend */}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: tokens.colors.financial.positive }]} />
                  <Text style={styles.legendText}>Paid</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: tokens.colors.amber[500] }]} />
                  <Text style={styles.legendText}>Pending</Text>
                </View>
              </View>
            </View>

            <View style={styles.barChartContainer}>
              {monthlyDataWithPayments.map((item, index) => {
                const totalHeight = (item.totalPaise / maxMonthlyValue) * 150;
                const paidHeight = (item.paidPaise / maxMonthlyValue) * 150;
                const pendingHeight = (item.pendingPaise / maxMonthlyValue) * 150;
                const isLast = index === monthlyDataWithPayments.length - 1;

                return (
                  <View key={item.month} style={styles.barWrapper}>
                    <View style={styles.barColumn}>
                      <Text style={styles.barValue}>{formatPaise(item.totalPaise)}</Text>
                      <View style={styles.barContainer}>
                        {/* Stacked bar with pending on top, paid on bottom */}
                        <View style={[styles.barStack, { height: Math.max(totalHeight, 20) }]}>
                          {/* Pending section (top) */}
                          {item.pendingPaise > 0 && (
                            <View
                              style={[
                                styles.barSection,
                                {
                                  height: Math.max(pendingHeight, 10),
                                  backgroundColor: isLast ? tokens.colors.amber[500] : tokens.colors.amber[400],
                                  borderTopLeftRadius: 4,
                                  borderTopRightRadius: 4,
                                }
                              ]}
                            />
                          )}
                          {/* Paid section (bottom) */}
                          {item.paidPaise > 0 && (
                            <View
                              style={[
                                styles.barSection,
                                {
                                  height: Math.max(paidHeight, 10),
                                  backgroundColor: isLast ? tokens.colors.financial.positive : tokens.colors.financial.positiveLight,
                                  borderTopLeftRadius: item.pendingPaise === 0 ? 4 : 0,
                                  borderTopRightRadius: item.pendingPaise === 0 ? 4 : 0,
                                }
                              ]}
                            />
                          )}
                        </View>
                      </View>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {item.month.split(' ')[0]}
                      </Text>
                      <Text style={styles.barSubLabel}>
                        {item.billCount} {item.billCount === 1 ? 'bill' : 'bills'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Category Breakdown with Visual Bars */}
        {categoryData.length > 0 && (
          <View style={styles.categoryCard}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>
            <Text style={styles.cardSubtitle}>Spending by category</Text>

            <View style={styles.categoryList}>
              {categoryData.map((item) => (
                <View key={item.category} style={styles.categoryItemWrapper}>
                  <View style={styles.categoryItemHeader}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryName}>{getCategoryName(item.category)}</Text>
                    </View>
                    <Text style={styles.categoryAmount}>{formatPaise(item.totalPaise)}</Text>
                  </View>

                  {/* Visual percentage bar */}
                  <View style={styles.categoryBarContainer}>
                    <View
                      style={[
                        styles.categoryBar,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }
                      ]}
                    />
                  </View>

                  <View style={styles.categoryItemFooter}>
                    <Text style={styles.categoryCount}>
                      {item.billCount} {item.billCount === 1 ? 'bill' : 'bills'}
                    </Text>
                    <Text style={styles.categoryPercentage}>{Math.round(item.percentage)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Karzedaars */}
        {topKarzedaars.length > 0 && (
          <View style={styles.karzedaarCard}>
            <Text style={styles.cardTitle}>Top Karzedaars</Text>
            <Text style={styles.cardSubtitle}>Highest spending karzedaars</Text>
            <View style={styles.karzedaarList}>
              {topKarzedaars.map((karzedaar, index) => (
                <View key={karzedaar.karzedaarId} style={styles.karzedaarItem}>
                  <View style={styles.karzedaarRank}>
                    <Text style={styles.karzedaarRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.karzedaarInfo}>
                    <Text style={styles.karzedaarName} numberOfLines={1}>
                      {karzedaar.name}
                    </Text>
                    <Text style={styles.karzedaarStats}>
                      {karzedaar.billCount} {karzedaar.billCount === 1 ? 'bill' : 'bills'} • {karzedaar.settledBills} settled
                    </Text>
                  </View>
                  <Text style={styles.karzedaarAmount}>{formatPaise(karzedaar.totalPaise)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing['3xl'],
  },
  emptyStateTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    marginTop: tokens.spacing.lg,
    textAlign: 'center',
  },
  emptyStateText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    maxWidth: 280,
  },
  emptyStateHint: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    marginTop: tokens.spacing.md,
  },

  // Filters
  filterContainer: {
    marginBottom: tokens.spacing.md,
  },
  filterContent: {
    gap: tokens.spacing.sm,
    paddingRight: tokens.spacing.xl,
  },
  filterChip: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.background.elevated,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.sage[100],
    borderColor: tokens.colors.sage[500],
  },
  filterChipText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: tokens.colors.sage[700],
    fontWeight: '600',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - tokens.spacing.xl * 2 - tokens.spacing.md) / 2 - tokens.spacing.md,
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    ...tokens.shadows.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  metricValue: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  metricLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },

  // Bar Chart Card
  chartCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadows.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
  },
  cardTitleSection: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  cardTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: tokens.radius.full,
  },
  legendText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
    fontSize: 11,
  },
  barStack: {
    width: '100%',
    flexDirection: 'column-reverse', // Paid on bottom, pending on top
    justifyContent: 'flex-end',
  },
  barSection: {
    width: '100%',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barColumn: {
    alignItems: 'center',
    width: '100%',
  },
  barValue: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  barContainer: {
    height: 150,
    justifyContent: 'flex-end',
    width: 32,
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 20,
  },
  barLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  barSubLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    fontSize: 9,
  },

  // Category Card
  categoryCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadows.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  categoryList: {
    gap: tokens.spacing.lg,
  },
  categoryItemWrapper: {
    gap: tokens.spacing.sm,
  },
  categoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    flex: 1,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: tokens.radius.full,
  },
  categoryName: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  categoryAmount: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: tokens.colors.background.subtle,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: tokens.radius.sm,
    minWidth: 20,
  },
  categoryItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryCount: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  categoryPercentage: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },

  // Karzedaar Card
  karzedaarCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadows.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  karzedaarList: {
    gap: tokens.spacing.md,
  },
  karzedaarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  karzedaarRank: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.terracotta[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  karzedaarRankText: {
    ...tokens.typography.caption,
    color: tokens.colors.terracotta[700],
    fontWeight: '700',
  },
  karzedaarInfo: {
    flex: 1,
  },
  karzedaarName: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  karzedaarStats: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  karzedaarAmount: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
});
