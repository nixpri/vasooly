import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { formatPaise } from '@/lib/business/splitEngine';
import type { DetailedSplitResult } from '@/lib/business/splitEngine';
import { GlassCard } from './GlassCard';

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
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Enter amount and add participants to see split
        </Text>
      </View>
    );
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

      {/* Exact split indicator */}
      {isExactlySplit && (
        <View style={styles.footer}>
          <Text style={styles.successText}>
            ✓ Amount splits exactly ({splits.length} participants)
          </Text>
        </View>
      )}

      {/* Summary Stats */}
      <GlassCard style={styles.summaryContainer} borderRadius={12}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Per Person (avg)</Text>
            <Text style={styles.summaryValue}>
              {formatPaise(splitResult.averageAmountPaise)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Participants</Text>
            <Text style={styles.summaryValue}>{splits.length}</Text>
          </View>
        </View>
      </GlassCard>
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  headerTotal: {
    fontSize: 16,
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  participantName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    color: '#4ADE80',
    fontWeight: '700',
  },
  remainderHint: {
    fontSize: 9,
    color: 'rgba(74, 222, 128, 0.7)',
    fontWeight: '600',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  footer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  successText: {
    fontSize: 11,
    color: '#4ADE80',
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
