/**
 * ActivityCard Component - Activity timeline item with type icons and color coding
 *
 * Features:
 * - Activity type icons (Lucide React Native)
 * - Color coding based on activity type
 * - Timestamp display with relative formatting
 * - Glass-morphism design
 * - Press interaction for navigation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, CheckCircle, Edit2, DollarSign } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { tokens } from '@/theme/ThemeProvider';
import { formatPaise } from '@/lib/business/splitEngine';
import type { Bill } from '@/types';
import { ActivityType, PaymentStatus } from '@/types';

interface ActivityCardProps {
  bill: Bill;
  activityType: ActivityType;
  onPress?: () => void;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.BILL_CREATED:
      return FileText;
    case ActivityType.PAYMENT_MADE:
      return DollarSign;
    case ActivityType.BILL_SETTLED:
      return CheckCircle;
    case ActivityType.BILL_UPDATED:
      return Edit2;
    default:
      return FileText;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case ActivityType.BILL_CREATED:
      return tokens.colors.text.tertiary;
    case ActivityType.PAYMENT_MADE:
      return tokens.colors.amber[500];
    case ActivityType.BILL_SETTLED:
      return tokens.colors.sage[500];
    case ActivityType.BILL_UPDATED:
      return tokens.colors.text.secondary;
    default:
      return tokens.colors.text.tertiary;
  }
};

const getActivityDescription = (type: ActivityType, bill: Bill): string => {
  const paidCount = bill.participants.filter((p) => p.status === PaymentStatus.PAID).length;
  const totalCount = bill.participants.length;

  switch (type) {
    case ActivityType.BILL_CREATED:
      return `Created bill with ${totalCount} ${totalCount === 1 ? 'participant' : 'participants'}`;
    case ActivityType.PAYMENT_MADE:
      return `Payment received - ${paidCount}/${totalCount} paid`;
    case ActivityType.BILL_SETTLED:
      return 'All payments received';
    case ActivityType.BILL_UPDATED:
      return 'Bill details updated';
    default:
      return 'Activity';
  }
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ bill, activityType, onPress }) => {
  const Icon = getActivityIcon(activityType);
  const iconColor = getActivityColor(activityType);
  const description = getActivityDescription(activityType, bill);
  const relativeTime = formatRelativeTime(bill.updatedAt);

  const isSettled = bill.status === 'SETTLED';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <GlassCard style={styles.card} borderRadius={12}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Icon size={18} color={iconColor} strokeWidth={2} />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {bill.title}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          </View>

          {/* Right Side */}
          <View style={styles.rightContainer}>
            <Text style={styles.amount}>{formatPaise(bill.totalAmountPaise)}</Text>
            <Text style={styles.time}>{relativeTime}</Text>
          </View>
        </View>

        {/* Settled Badge */}
        {isSettled && (
          <View style={styles.settledBadge}>
            <CheckCircle size={12} color={tokens.colors.sage[500]} strokeWidth={2.5} />
            <Text style={styles.settledText}>Settled</Text>
          </View>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.sm,
  },
  card: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  description: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.secondary,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontSize: tokens.typography.body.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  time: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    color: tokens.colors.text.tertiary,
  },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.sm,
  },
  settledText: {
    fontSize: tokens.typography.caption.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.sage[500],
  },
});
