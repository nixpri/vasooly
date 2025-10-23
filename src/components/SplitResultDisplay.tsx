import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatPaise } from '@/lib/business/splitEngine';
import type { DetailedSplitResult } from '@/lib/business/splitEngine';
import { GlassCard } from './GlassCard';
import { tokens } from '@/theme/ThemeProvider';

interface SplitResultDisplayProps {
  splitResult: DetailedSplitResult | null;
}

/**
 * SplitResultDisplay - Component for displaying split calculation results
 * Shows per-participant breakdown with visual clarity
 */
export const SplitResultDisplay: React.FC<SplitResultDisplayProps> = ({
  splitResult,
}) => {
  if (!splitResult) {
    return null;
  }

  const { splits, totalAmountPaise, isExactlySplit, remainderPaise } =
    splitResult;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Split Breakdown</Text>
        <Text style={styles.headerTotal}>
          Total: {formatPaise(totalAmountPaise)}
        </Text>
      </View>

      {/* Participant Splits */}
      <ScrollView style={styles.splitsContainer} nestedScrollEnabled>
        {splits.map((split, index) => (
          <GlassCard
            key={split.participantId}
            style={styles.splitRow}
            borderRadius={12}
          >
            <View style={styles.splitRowContent}>
              <View style={styles.participantInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {split.participantName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.participantName}>
                  {split.participantName}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>
                  {formatPaise(split.amountPaise)}
                </Text>
                {!isExactlySplit &&
                  index < remainderPaise &&
                  remainderPaise > 0 && (
                    <Text style={styles.remainderHint}>+1p</Text>
                  )}
              </View>
            </View>
          </GlassCard>
        ))}
      </ScrollView>

      {/* Footer with remainder info */}
      {!isExactlySplit && remainderPaise > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ℹ️ {remainderPaise} paise {remainderPaise === 1 ? 'was' : 'were'}{' '}
            distributed to first {remainderPaise}{' '}
            {remainderPaise === 1 ? 'participant' : 'participants'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.default,
  },
  headerLabel: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },
  headerTotal: {
    fontSize: 16,
    color: tokens.colors.text.primary,
    fontWeight: '700',
  },
  splitsContainer: {
    maxHeight: 240,
    marginBottom: 10,
  },
  splitRow: {
    marginBottom: 6,
  },
  splitRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.brand.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 14,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    color: tokens.colors.financial.positive,
    fontWeight: '700',
  },
  remainderHint: {
    fontSize: 9,
    color: tokens.colors.financial.positive,
    fontWeight: '600',
    backgroundColor: tokens.colors.financial.positiveLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  footer: {
    backgroundColor: tokens.colors.brand.primaryLight,
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 11,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  successText: {
    fontSize: 11,
    color: tokens.colors.financial.positive,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryContainer: {
    width: '100%',
  },
  summaryContent: {
    padding: 12,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 14,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
});
