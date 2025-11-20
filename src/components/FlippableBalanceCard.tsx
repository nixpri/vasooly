/**
 * FlippableBalanceCard - Dashboard balance overview with flip animation
 *
 * Displays vasooly overview with tap-to-flip interaction:
 * - Front: Total vasooly, bill counts, settled/pending amounts
 * - Back: Detailed breakdown by category and payment status
 *
 * Uses 3D flip animation with Reanimated 3
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { ChevronRight, TrendingUp, Calendar, Percent, RotateCcw } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { springConfigs, platformHardwareProps, timingConfigs } from '../utils/animations';

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
  /** Average bill size (in paise) */
  averageBillSize?: number;
  /** Settlement rate percentage (0-100) */
  settlementRate?: number;
  /** Most active month */
  mostActiveMonth?: string;
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

export const FlippableBalanceCard: React.FC<BalanceCardProps> = ({
  totalExpenses,
  pendingBillCount,
  totalBillCount,
  settledAmount,
  pendingAmount,
  averageBillSize = 0,
  settlementRate = 0,
  mostActiveMonth = 'This month',
  onViewDetails,
  style,
  loading: _loading = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const frontOpacity = useSharedValue(1);
  const backOpacity = useSharedValue(0);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);

    if (Platform.OS === 'android') {
      // Android: Use simple opacity transition (Fabric-compatible)
      if (newFlipped) {
        frontOpacity.value = withTiming(0, timingConfigs.standard);
        backOpacity.value = withTiming(1, timingConfigs.standard);
      } else {
        frontOpacity.value = withTiming(1, timingConfigs.standard);
        backOpacity.value = withTiming(0, timingConfigs.standard);
      }
    } else {
      // iOS: Keep 3D flip animation
      rotation.value = newFlipped ? 180 : 0;
    }
  };

  // Front face animation (memoized for performance)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    'worklet';

    if (Platform.OS === 'android') {
      // Android: Simple opacity (Fabric-compatible, no 3D transforms)
      return {
        opacity: frontOpacity.value,
      };
    } else {
      // iOS: 3D flip with rotateY and overshootClamping for smooth motion
      const rotateY = withSpring(rotation.value, {
        ...springConfigs.smooth,
        overshootClamping: true,
      });
      const opacity = interpolate(
        rotation.value,
        [0, 90, 180],
        [1, 0, 0]
      );

      return {
        transform: [{ rotateY: `${rotateY}deg` }],
        opacity,
        backfaceVisibility: 'hidden' as const,
      };
    }
  }, [rotation, frontOpacity]);

  // Back face animation (memoized for performance)
  const backAnimatedStyle = useAnimatedStyle(() => {
    'worklet';

    if (Platform.OS === 'android') {
      // Android: Simple opacity (Fabric-compatible, no 3D transforms)
      return {
        opacity: backOpacity.value,
      };
    } else {
      // iOS: 3D flip with rotateY and overshootClamping for smooth motion
      const rotateY = withSpring(rotation.value - 180, {
        ...springConfigs.smooth,
        overshootClamping: true,
      });
      const opacity = interpolate(
        rotation.value,
        [0, 90, 180],
        [0, 0, 1]
      );

      return {
        transform: [{ rotateY: `${rotateY}deg` }],
        opacity,
        backfaceVisibility: 'hidden' as const,
      };
    }
  }, [rotation, backOpacity]);

  return (
    <View style={style}>
      {/* Front Face */}
      <Animated.View
        style={[styles.cardFace, frontAnimatedStyle]}
        {...platformHardwareProps}
      >
        <GlassCard borderRadius={tokens.radius.lg}>
          <Pressable onPress={handleFlip} style={styles.container}>
            {/* Flip hint icon */}
            <View style={styles.flipHint}>
              <RotateCcw size={16} color={tokens.colors.text.tertiary} strokeWidth={2} />
            </View>

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
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              style={styles.viewDetailsButton}
              hitSlop={8}
            >
              <View style={styles.viewDetailsContent}>
                <Text style={styles.viewDetailsText}>View All Bills</Text>
                <ChevronRight size={18} color={tokens.colors.sage[600]} strokeWidth={2.5} />
              </View>
            </Pressable>
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Back Face */}
      <Animated.View
        style={[styles.cardFace, styles.backFace, backAnimatedStyle]}
        {...platformHardwareProps}
      >
        <GlassCard borderRadius={tokens.radius.lg}>
          <Pressable onPress={handleFlip} style={styles.container}>
            {/* Flip hint icon */}
            <View style={styles.flipHint}>
              <RotateCcw size={16} color={tokens.colors.text.tertiary} strokeWidth={2} />
            </View>

            {/* Title */}
            <Text style={styles.title}>DETAILED BREAKDOWN</Text>

            {/* Insights Grid */}
            <View style={styles.insightsGrid}>
              {/* Average Bill Size */}
              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, { backgroundColor: tokens.colors.amber[100] }]}>
                  <TrendingUp size={20} color={tokens.colors.amber[600]} strokeWidth={2} />
                </View>
                <Text style={styles.insightValue}>{formatCurrency(averageBillSize)}</Text>
                <Text style={styles.insightLabel}>Avg Bill Size</Text>
              </View>

              {/* Settlement Rate */}
              <View style={styles.insightCard}>
                <View style={[styles.insightIcon, { backgroundColor: tokens.colors.sage[100] }]}>
                  <Percent size={20} color={tokens.colors.sage[600]} strokeWidth={2} />
                </View>
                <Text style={styles.insightValue}>{settlementRate.toFixed(0)}%</Text>
                <Text style={styles.insightLabel}>Settlement Rate</Text>
              </View>
            </View>

            {/* Most Active Period */}
            <View style={styles.activitySection}>
              <View style={[styles.insightIcon, { backgroundColor: tokens.colors.terracotta[100] }]}>
                <Calendar size={20} color={tokens.colors.terracotta[600]} strokeWidth={2} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityLabel}>Most Active Period</Text>
                <Text style={styles.activityValue}>{mostActiveMonth}</Text>
              </View>
            </View>

            {/* Tap to flip back hint */}
            <View style={styles.flipBackHint}>
              <Text style={styles.flipBackText}>Tap to flip back</Text>
            </View>
          </Pressable>
        </GlassCard>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardFace: {
    width: '100%',
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    padding: tokens.spacing['2xl'],
  },
  flipHint: {
    position: 'absolute',
    top: tokens.spacing.md,
    right: tokens.spacing.md,
    zIndex: 10,
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
    color: tokens.colors.brand.primary,
    marginBottom: tokens.spacing.xs,
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
    color: tokens.colors.sage[600],
  },
  statValueAmber: {
    color: tokens.colors.amber[600],
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
  // Back face styles
  insightsGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  insightCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.subtle,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  insightValue: {
    fontSize: tokens.typography.h2.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  insightLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  activitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.subtle,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border.subtle,
    gap: tokens.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  activityValue: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  flipBackHint: {
    alignItems: 'center',
  },
  flipBackText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
