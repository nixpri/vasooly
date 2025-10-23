/**
 * BalanceCard - Dashboard balance overview component
 *
 * Displays vasooly overview:
 * - Total vasooly amount left to collect
 * - Number of bills (pending and total)
 * - Settled and pending amounts
 * - View details action
 *
 * Uses glass-morphism design with earthen color tokens
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';

interface BalanceCardProps {
  /** Total vasooly amount left to collect across all bills (in paise) */
  totalExpenses: number;
  /** Number of bills with pending payments */
  pendingBillCount: number;
  /** Total number of all bills */
  totalBillCount: number;
  /** Amount settled/paid (in paise) */
  settledAmount: number;
  /** Amount still pending (in paise) */
  pendingAmount: number;
  /** Callback when view details pressed */
  onViewDetails: () => void;
  /** Optional style override */
  style?: ViewStyle;
  /** Loading state */
  loading?: boolean;
}

/**
 * Format paise to rupee string with symbol
 */
const formatCurrency = (paise: number): string => {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalExpenses,
  pendingBillCount,
  totalBillCount,
  settledAmount,
  pendingAmount,
  onViewDetails,
  style,
  loading: _loading = false,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15).stiffness(150)}
      style={style}
    >
      <GlassCard borderRadius={tokens.radius.lg}>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>TOTAL VASOOLY LEFT</Text>

          {/* Main Amount Display */}
          <View style={styles.amountSection}>
            <Text style={styles.amountValue}>
              {formatCurrency(totalExpenses)}
            </Text>
            <Text style={styles.amountLabel}>
              to collect across {pendingBillCount} {pendingBillCount === 1 ? 'bill' : 'bills'}
            </Text>
          </View>

          {/* Stats Row - Financial Breakdown */}
          <View style={styles.statsRow}>
            <View style={styles.statItemSmall}>
              <Text style={styles.statValue}>{totalBillCount}</Text>
              <Text style={styles.statLabel}>Bills</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueSage]}>
                {formatCurrency(settledAmount)}
              </Text>
              <Text style={styles.statLabel}>Vasooled</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueAmber]}>
                {formatCurrency(pendingAmount)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* View Details Link */}
          <Pressable onPress={onViewDetails} style={styles.viewDetailsButton} hitSlop={8}>
            <View style={styles.viewDetailsContent}>
              <Text style={styles.viewDetailsText}>View All Bills</Text>
              <ChevronRight size={18} color={tokens.colors.sage[600]} strokeWidth={2.5} />
            </View>
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing['2xl'],
  },
  title: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    marginBottom: tokens.spacing.lg,
    letterSpacing: 1.2,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  amountSection: {
    marginBottom: tokens.spacing['2xl'],
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 48,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.brand.primary,  // Keep terracotta for main amount
    marginBottom: tokens.spacing.xs,
    // Subtle amber glow for visual interest
    textShadowColor: tokens.colors.amber[200],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  amountLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border.subtle,
  },
  statItem: {
    flex: 1.2,
    alignItems: 'center',
  },
  statItemSmall: {
    flex: 0.6,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: tokens.colors.border.subtle,
    marginHorizontal: tokens.spacing.md,
  },
  statValue: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  statValueSage: {
    color: tokens.colors.sage[600],  // Sage for settled amounts
  },
  statValueAmber: {
    color: tokens.colors.amber[600],  // Amber for pending amounts
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
  },
  viewDetailsButton: {
    marginTop: tokens.spacing.xs,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    backgroundColor: tokens.colors.sage[50],
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.sage[200],
  },
  viewDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
  },
  viewDetailsText: {
    fontSize: 15,
    color: tokens.colors.sage[700],
    fontWeight: tokens.typography.fontWeight.bold,
    letterSpacing: 0.2,
  },
});
