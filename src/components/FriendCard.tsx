/**
 * FriendCard - Individual friend display component
 *
 * Displays friend information with:
 * - Avatar with initials
 * - Name and contact info
 * - Bill count and total amount stats
 * - Tap to view friend details
 *
 * Uses horizontal layout pattern (avatar left, info right)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { User, Phone, IndianRupee } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import type { Friend } from '../types';

interface FriendCardProps {
  /** Friend data */
  friend: Friend;
  /** Callback on press */
  onPress: () => void;
  /** Optional style */
  style?: ViewStyle;
}

/**
 * Get initials from name (max 2 characters)
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Format paise to rupee string
 */
const formatCurrency = (paise: number): string => {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onPress, style }) => {
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

  const initials = getInitials(friend.name);
  const hasContactInfo = friend.phone || friend.upiId;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
      accessibilityLabel={`Friend: ${friend.name}`}
      accessibilityHint="Double tap to view details"
      accessibilityRole="button"
    >
      <Animated.View style={animatedStyle}>
        <GlassCard borderRadius={tokens.radius.md}>
          <View style={styles.container}>
            {/* Horizontal Layout: Avatar Left, Info Right */}
            <View style={styles.contentRow}>
              {/* Avatar with Initials */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              {/* Friend Info */}
              <View style={styles.infoContainer}>
                {/* Name */}
                <Text style={styles.name} numberOfLines={1}>
                  {friend.name}
                </Text>

                {/* Contact Info Row */}
                {hasContactInfo && (
                  <View style={styles.contactRow}>
                    {friend.phone && (
                      <View style={styles.contactItem}>
                        <Phone size={12} color={tokens.colors.text.tertiary} />
                        <Text style={styles.contactText} numberOfLines={1}>
                          {friend.phone}
                        </Text>
                      </View>
                    )}
                    {friend.upiId && (
                      <View style={styles.contactItem}>
                        <User size={12} color={tokens.colors.text.tertiary} />
                        <Text style={styles.contactText} numberOfLines={1}>
                          {friend.upiId}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{friend.billCount}</Text>
                    <Text style={styles.statLabel}>
                      {friend.billCount === 1 ? 'bill' : 'bills'}
                    </Text>
                  </View>

                  {friend.totalAmountPaise > 0 && (
                    <>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <IndianRupee
                          size={12}
                          color={tokens.colors.brand.primary}
                          style={styles.rupeeIcon}
                        />
                        <Text style={styles.statValue}>
                          {formatCurrency(friend.totalAmountPaise)}
                        </Text>
                        <Text style={styles.statLabel}>total</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Chevron */}
              <Text style={styles.chevron}>→</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    ...tokens.typography.body,
    fontWeight: '700',
    color: tokens.colors.background.card,
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  name: {
    ...tokens.typography.bodyLarge,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  contactRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    flexWrap: 'wrap',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '48%',
  },
  contactText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...tokens.typography.caption,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: tokens.colors.border.light,
  },
  rupeeIcon: {
    marginRight: -2,
  },
  chevron: {
    ...tokens.typography.h3,
    color: tokens.colors.text.tertiary,
    flexShrink: 0,
  },
});
