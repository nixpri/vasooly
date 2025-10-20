/**
 * BalanceCard - Dashboard balance overview component
 *
 * Displays user's financial balance overview with:
 * - Total owed to you (positive)
 * - Total you owe (negative)
 * - Net balance calculation
 * - Settle up action button
 *
 * Uses glass-morphism design with earthen color tokens
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';

interface BalanceCardProps {
  /** Total amount user is owed (in paise) */
  owedTo: number;
  /** Total amount user owes (in paise) */
  owedBy: number;
  /** Callback when settle up pressed */
  onSettleUp: () => void;
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
  owedTo,
  owedBy,
  onSettleUp,
  style,
  loading: _loading = false,
}) => {
  // Calculate net balance (positive = owed to you, negative = you owe)
  const netBalance = owedTo - owedBy;
  const isPositive = netBalance >= 0;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15).stiffness(150)}
      style={style}
    >
      <GlassCard borderRadius={tokens.radius.lg}>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>YOUR BALANCE</Text>

          {/* Balance Rows */}
          <View style={styles.balanceSection}>
            {/* You're owed */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>You're owed</Text>
              <View style={styles.amountContainer}>
                <Text style={[styles.amountValue, styles.amountPositive]}>
                  {formatCurrency(owedTo)}
                </Text>
                <Text style={styles.arrow}>↑</Text>
              </View>
            </View>

            {/* You owe */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>You owe</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amountValue}>{formatCurrency(owedBy)}</Text>
                <Text style={styles.arrow}>↓</Text>
              </View>
            </View>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Net Balance */}
          <View style={styles.netBalanceRow}>
            <Text style={styles.netBalanceLabel}>Net Balance</Text>
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.netBalanceValue,
                  isPositive ? styles.netBalancePositive : styles.netBalanceNegative,
                ]}
              >
                {formatCurrency(Math.abs(netBalance))}
              </Text>
              <Text style={styles.arrow}>{isPositive ? '↑' : '↓'}</Text>
            </View>
          </View>

          {/* Settle Up Button */}
          <AnimatedButton onPress={onSettleUp} style={styles.settleButton} haptic>
            <Text style={styles.settleButtonText}>Settle Up</Text>
          </AnimatedButton>
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
    ...tokens.typography.h3,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
    letterSpacing: 0.5,
  },
  balanceSection: {
    marginBottom: tokens.spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  balanceLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  amountValue: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  amountPositive: {
    color: tokens.colors.financial.positive,
  },
  arrow: {
    ...tokens.typography.h2,
    color: tokens.colors.text.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
    marginVertical: tokens.spacing.lg,
  },
  netBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  netBalanceLabel: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  netBalanceValue: {
    ...tokens.typography.h1,
    fontWeight: '700',
  },
  netBalancePositive: {
    color: tokens.colors.financial.positive,
  },
  netBalanceNegative: {
    color: tokens.colors.financial.negative,
  },
  settleButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleButtonText: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
});
