/**
 * Insights Calculator Utility
 *
 * Calculates spending insights, analytics, and metrics from bill data.
 * All calculations exclude the current user's own share (Vasooly = collecting from others).
 *
 * @module insightsCalculator
 */

import {
  Bill,
  TimeRange,
  MonthlySpendingData,
  CategorySpendingData,
  KarzedaarSpending,
  InsightsMetrics,
  ExpenseCategory,
  PaymentStatus,
} from '@/types';
import { tokens } from '@/theme/tokens';
import { format, startOfMonth, subMonths, startOfYear, isAfter, isBefore } from 'date-fns';

/**
 * Helper: Check if participant is the current user
 */
const isCurrentUser = (participantName: string, defaultUPIName?: string): boolean => {
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

/**
 * Filter bills by time range
 */
export function filterBillsByTimeRange(bills: Bill[], timeRange: TimeRange): Bill[] {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'this_month':
      startDate = startOfMonth(now);
      break;
    case 'last_3_months':
      startDate = startOfMonth(subMonths(now, 2)); // Current + 2 previous months
      break;
    case 'last_6_months':
      startDate = startOfMonth(subMonths(now, 5)); // Current + 5 previous months
      break;
    case 'this_year':
      startDate = startOfYear(now);
      break;
    default:
      startDate = startOfMonth(now);
  }

  return bills.filter(bill => {
    const billDate = bill.createdAt instanceof Date ? bill.createdAt : new Date(bill.createdAt);
    return isAfter(billDate, startDate) || billDate.getTime() === startDate.getTime();
  });
}

/**
 * Calculate monthly spending data for bar chart
 */
export function calculateMonthlySpending(
  bills: Bill[],
  timeRange: TimeRange,
  defaultUPIName?: string
): MonthlySpendingData[] {
  const filteredBills = filterBillsByTimeRange(bills, timeRange);

  // Group bills by month
  const monthlyMap = new Map<string, { totalPaise: number; billCount: number }>();

  filteredBills.forEach(bill => {
    const billDate = bill.createdAt instanceof Date ? bill.createdAt : new Date(bill.createdAt);
    const monthKey = format(billDate, 'MMM yyyy'); // "Jan 2025"

    // Calculate total Vasooly amount (excluding user's own share)
    const vasoolyAmount = bill.participants
      .filter(p => !isCurrentUser(p.name, defaultUPIName))
      .reduce((sum, p) => sum + p.amountPaise, 0);

    const existing = monthlyMap.get(monthKey) || { totalPaise: 0, billCount: 0 };
    monthlyMap.set(monthKey, {
      totalPaise: existing.totalPaise + vasoolyAmount,
      billCount: existing.billCount + 1,
    });
  });

  // Convert to array and sort by date
  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalPaise: data.totalPaise,
      billCount: data.billCount,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

/**
 * Get category color from design tokens
 */
function getCategoryColor(category: ExpenseCategory): string {
  switch (category) {
    case ExpenseCategory.FOOD:
      return tokens.colors.amber[500];
    case ExpenseCategory.TRAVEL:
      return tokens.colors.sage[500];
    case ExpenseCategory.SHOPPING:
      return tokens.colors.terracotta[400];
    case ExpenseCategory.ENTERTAINMENT:
      return tokens.colors.terracotta[600];
    case ExpenseCategory.OTHER:
      return tokens.colors.neutral[500];
    default:
      return tokens.colors.neutral[400];
  }
}

/**
 * Calculate category breakdown for pie chart
 */
export function calculateCategoryBreakdown(
  bills: Bill[],
  timeRange: TimeRange,
  defaultUPIName?: string
): CategorySpendingData[] {
  const filteredBills = filterBillsByTimeRange(bills, timeRange);

  // Group by category
  const categoryMap = new Map<ExpenseCategory, { totalPaise: number; billCount: number }>();

  filteredBills.forEach(bill => {
    const category = bill.category || ExpenseCategory.OTHER;

    // Calculate Vasooly amount (excluding user's own share)
    const vasoolyAmount = bill.participants
      .filter(p => !isCurrentUser(p.name, defaultUPIName))
      .reduce((sum, p) => sum + p.amountPaise, 0);

    const existing = categoryMap.get(category) || { totalPaise: 0, billCount: 0 };
    categoryMap.set(category, {
      totalPaise: existing.totalPaise + vasoolyAmount,
      billCount: existing.billCount + 1,
    });
  });

  // Calculate total for percentages
  const totalPaise = Array.from(categoryMap.values()).reduce((sum, data) => sum + data.totalPaise, 0);

  // Convert to array with percentages
  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      totalPaise: data.totalPaise,
      billCount: data.billCount,
      percentage: totalPaise > 0 ? (data.totalPaise / totalPaise) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.totalPaise - a.totalPaise); // Sort by amount descending
}

/**
 * Get top spending karzedaars
 */
export function getTopKarzedaars(
  bills: Bill[],
  timeRange: TimeRange,
  defaultUPIName?: string,
  limit: number = 5
): KarzedaarSpending[] {
  const filteredBills = filterBillsByTimeRange(bills, timeRange);

  // Group by karzedaar (participant)
  const karzedaarMap = new Map<string, {
    name: string;
    totalPaise: number;
    billCount: number;
    settledBills: number;
  }>();

  filteredBills.forEach(bill => {
    bill.participants.forEach(participant => {
      // Skip current user
      if (isCurrentUser(participant.name, defaultUPIName)) return;

      const key = participant.phone || participant.name; // Use phone as unique key if available
      const existing = karzedaarMap.get(key) || {
        name: participant.name,
        totalPaise: 0,
        billCount: 0,
        settledBills: 0
      };

      karzedaarMap.set(key, {
        name: participant.name,
        totalPaise: existing.totalPaise + participant.amountPaise,
        billCount: existing.billCount + 1,
        settledBills: existing.settledBills + (participant.status === PaymentStatus.PAID ? 1 : 0),
      });
    });
  });

  // Convert to array and sort by total amount
  return Array.from(karzedaarMap.entries())
    .map(([id, data]) => ({
      karzedaarId: id,
      name: data.name,
      totalPaise: data.totalPaise,
      billCount: data.billCount,
      settledBills: data.settledBills,
    }))
    .sort((a, b) => b.totalPaise - a.totalPaise)
    .slice(0, limit);
}

/**
 * Calculate spending trend (% change vs previous period)
 */
export function calculateSpendingTrend(
  bills: Bill[],
  timeRange: TimeRange,
  defaultUPIName?: string
): number {
  // Current period
  const currentPeriodBills = filterBillsByTimeRange(bills, timeRange);
  const currentTotal = currentPeriodBills.reduce((sum, bill) => {
    const vasoolyAmount = bill.participants
      .filter(p => !isCurrentUser(p.name, defaultUPIName))
      .reduce((s, p) => s + p.amountPaise, 0);
    return sum + vasoolyAmount;
  }, 0);

  // Previous period (same duration as current)
  let previousPeriodStart: Date;
  const now = new Date();

  switch (timeRange) {
    case 'this_month':
      previousPeriodStart = startOfMonth(subMonths(now, 1));
      break;
    case 'last_3_months':
      previousPeriodStart = startOfMonth(subMonths(now, 5)); // Previous 3 months
      break;
    case 'last_6_months':
      previousPeriodStart = startOfMonth(subMonths(now, 11)); // Previous 6 months
      break;
    case 'this_year':
      previousPeriodStart = startOfYear(subMonths(now, 12)); // Previous year
      break;
    default:
      previousPeriodStart = startOfMonth(subMonths(now, 1));
  }

  const currentPeriodStart = filterBillsByTimeRange(bills, timeRange)[0]?.createdAt || now;
  const previousPeriodBills = bills.filter(bill => {
    const billDate = bill.createdAt instanceof Date ? bill.createdAt : new Date(bill.createdAt);
    return isAfter(billDate, previousPeriodStart) && isBefore(billDate, currentPeriodStart);
  });

  const previousTotal = previousPeriodBills.reduce((sum, bill) => {
    const vasoolyAmount = bill.participants
      .filter(p => !isCurrentUser(p.name, defaultUPIName))
      .reduce((s, p) => s + p.amountPaise, 0);
    return sum + vasoolyAmount;
  }, 0);

  // Calculate percentage change
  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

/**
 * Calculate key insights metrics
 */
export function calculateKeyMetrics(
  bills: Bill[],
  timeRange: TimeRange,
  defaultUPIName?: string
): InsightsMetrics {
  const filteredBills = filterBillsByTimeRange(bills, timeRange);

  // Total bills
  const totalBills = filteredBills.length;

  // Total spent (Vasooly amount)
  const totalSpentPaise = filteredBills.reduce((sum, bill) => {
    const vasoolyAmount = bill.participants
      .filter(p => !isCurrentUser(p.name, defaultUPIName))
      .reduce((s, p) => s + p.amountPaise, 0);
    return sum + vasoolyAmount;
  }, 0);

  // Average bill size
  const averageBillSizePaise = totalBills > 0 ? Math.round(totalSpentPaise / totalBills) : 0;

  // Settled bills (all non-user participants paid)
  const settledBills = filteredBills.filter(bill => {
    const nonUserParticipants = bill.participants.filter(p => !isCurrentUser(p.name, defaultUPIName));
    return nonUserParticipants.length > 0 && nonUserParticipants.every(p => p.status === PaymentStatus.PAID);
  }).length;

  // Settlement rate
  const settlementRate = totalBills > 0 ? (settledBills / totalBills) * 100 : 0;

  // Spending trend
  const spendingTrend = calculateSpendingTrend(bills, timeRange, defaultUPIName);

  return {
    averageBillSizePaise,
    totalBills,
    settledBills,
    settlementRate,
    spendingTrend,
    totalSpentPaise,
  };
}
