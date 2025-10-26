/**
 * SkeletonLoader - Skeleton loading placeholders with shimmer effect
 *
 * Provides loading skeletons for various UI elements:
 * - Card skeletons
 * - List item skeletons
 * - Text skeletons
 * - Image skeletons
 *
 * Features shimmer animation using Reanimated 3
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { tokens } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  /** Width of skeleton (can be number or percentage string) */
  width?: number | string;
  /** Height of skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Optional style override */
  style?: ViewStyle;
}

/**
 * Base Skeleton component with shimmer effect
 */
export const Skeleton: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = tokens.radius.md,
  style,
}) => {
  const shimmerTranslate = useSharedValue(-SCREEN_WIDTH);

  React.useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [shimmerTranslate]);

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerTranslate.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [0.3, 0.7, 0.3]
    );

    return {
      transform: [{ translateX: shimmerTranslate.value }],
      opacity,
    };
  });

  const skeletonWidth = typeof width === 'string' ? width : width;

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <View style={styles.shimmerGradient} />
      </Animated.View>
    </View>
  );
};

/**
 * Balance Card Skeleton
 */
export const BalanceCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.balanceCard, style]}>
    <Skeleton width="60%" height={14} style={styles.mb8} />
    <Skeleton width="80%" height={48} style={styles.mb16} />
    <Skeleton width="50%" height={14} style={styles.mb24} />

    <View style={styles.statsRow}>
      <Skeleton width="25%" height={32} />
      <Skeleton width="30%" height={32} />
      <Skeleton width="30%" height={32} />
    </View>

    <Skeleton width="100%" height={44} style={styles.mt16} />
  </View>
);

/**
 * Karzedaar Card Skeleton
 */
export const KarzedaarCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.karzedaarCard, style]}>
    <View style={styles.karzedaarRow}>
      <Skeleton width={48} height={48} borderRadius={tokens.radius.full} />
      <View style={styles.karzedaarInfo}>
        <Skeleton width="70%" height={16} style={styles.mb8} />
        <Skeleton width="50%" height={12} style={styles.mb8} />
        <Skeleton width="60%" height={12} />
      </View>
    </View>
  </View>
);

/**
 * Activity Card Skeleton
 */
export const ActivityCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.activityCard, style]}>
    <View style={styles.activityRow}>
      <Skeleton width={40} height={40} borderRadius={tokens.radius.full} />
      <View style={styles.activityInfo}>
        <Skeleton width="80%" height={16} style={styles.mb8} />
        <Skeleton width="60%" height={12} style={styles.mb4} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={60} height={32} borderRadius={tokens.radius.md} />
    </View>
  </View>
);

/**
 * Transaction Card Skeleton
 */
export const TransactionCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.transactionCard, style]}>
    <View style={styles.transactionRow}>
      <View style={styles.transactionInfo}>
        <Skeleton width="70%" height={16} style={styles.mb8} />
        <Skeleton width="50%" height={12} />
      </View>
      <Skeleton width={80} height={32} borderRadius={tokens.radius.md} />
    </View>
  </View>
);

/**
 * Insight Card Skeleton (for charts/metrics)
 */
export const InsightCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.insightCard, style]}>
    <Skeleton width="60%" height={16} style={styles.mb16} />
    <Skeleton width="100%" height={200} style={styles.mb16} borderRadius={tokens.radius.lg} />
    <View style={styles.legendRow}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="30%" height={12} />
      <Skeleton width="30%" height={12} />
    </View>
  </View>
);

/**
 * List Skeleton - multiple items
 */
export const ListSkeleton: React.FC<{
  count?: number;
  itemHeight?: number;
  ItemSkeleton?: React.FC<{ style?: ViewStyle }>;
  style?: ViewStyle;
}> = ({ count = 5, itemHeight = 80, ItemSkeleton = KarzedaarCardSkeleton, style }) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, index) => (
      <ItemSkeleton key={index} style={{ marginBottom: tokens.spacing.md, height: itemHeight }} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: tokens.colors.background.subtle,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.colors.background.card,
    opacity: 0.3,
  },
  // Card layouts
  balanceCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing['2xl'],
  },
  karzedaarCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  activityCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  transactionCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  insightCard: {
    backgroundColor: tokens.colors.background.card,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
  },
  // Layout helpers
  karzedaarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  karzedaarInfo: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: tokens.colors.border.subtle,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Spacing helpers
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  mb24: {
    marginBottom: 24,
  },
  mt16: {
    marginTop: 16,
  },
});
