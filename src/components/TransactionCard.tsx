/**
 * TransactionCard - Individual bill/transaction display
 *
 * Displays bill information in activity feed:
 * - Bill title and description
 * - Timestamp (relative time)
 * - Amount breakdown (total, your share)
 * - Payment status badge
 * - Tap to view details
 *
 * Uses earthen design tokens with glass-morphism
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { Bill, BillStatus } from '../types';

interface TransactionCardProps {
  /** Bill data */
  bill: Bill;
  /** Callback on press */
  onPress: () => void;
  /** Optional style */
  style?: ViewStyle;
}

/**
 * Format paise to rupee string
 */
const formatCurrency = (paise: number): string => {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get relative time string
 */
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/**
 * Get status badge info
 */
const getStatusInfo = (status: BillStatus) => {
  if (status === BillStatus.SETTLED) {
    return {
      label: 'Settled',
      backgroundColor: tokens.colors.financial.positiveLight,
      textColor: tokens.colors.financial.settled,
      borderColor: tokens.colors.financial.settled,
    };
  }
  return {
    label: 'Pending',
    backgroundColor: tokens.colors.financial.negativeLight,
    textColor: tokens.colors.financial.pending,
    borderColor: tokens.colors.financial.pending,
  };
};

export const TransactionCard: React.FC<TransactionCardProps> = ({ bill, onPress, style }) => {
  const [pressed, setPressed] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed ? 0.98 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  const statusInfo = getStatusInfo(bill.status);
  const totalAmount = bill.totalAmountPaise;
  const participantCount = bill.participants.length;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
      accessibilityLabel={`Bill: ${bill.title}`}
      accessibilityHint="Double tap to view details"
      accessibilityRole="button"
    >
      <Animated.View style={animatedStyle}>
        <GlassCard borderRadius={tokens.radius.md}>
          <View style={styles.container}>
            {/* Header: Title and Time */}
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {bill.title}
              </Text>
              <Text style={styles.chevron}>→</Text>
            </View>

            {/* Metadata: Participants and Time */}
            <Text style={styles.metadata}>
              {participantCount} {participantCount === 1 ? 'person' : 'people'} •{' '}
              {getRelativeTime(bill.createdAt)}
            </Text>

            {/* Amount Info */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(totalAmount)}</Text>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusInfo.backgroundColor,
                    borderColor: statusInfo.borderColor,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  title: {
    ...tokens.typography.bodyLarge,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  chevron: {
    ...tokens.typography.h2,
    color: tokens.colors.text.tertiary,
  },
  metadata: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    marginBottom: tokens.spacing.md,
  },
  amountSection: {
    gap: tokens.spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  amountValue: {
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  statusText: {
    ...tokens.typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
