/**
 * SwipeableKarzedaarCard - Karzedaar card with swipe-to-remind gesture
 *
 * Displays karzedaar information with swipe gesture:
 * - Swipe left to reveal "Send Reminder" action
 * - Quick access to remind functionality
 * - Smooth animation with haptic feedback
 *
 * Uses Reanimated 3 Gesture Handler
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { User, Phone, Send } from 'lucide-react-native';
import { tokens } from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { springConfigs } from '../utils/animations';
import type { Karzedaar, Bill } from '../types';
import { PaymentStatus } from '../types';
import * as Haptics from 'expo-haptics';

interface SwipeableKarzedaarCardProps {
  /** Karzedaar data */
  karzedaar: Karzedaar;
  /** Bills for calculating pending amounts */
  bills: Bill[];
  /** Callback on press */
  onPress: () => void;
  /** Callback when reminder is triggered */
  onRemind?: () => void;
  /** Optional style */
  style?: ViewStyle;
  /** Whether haptics are enabled */
  hapticsEnabled?: boolean;
}

const SWIPE_THRESHOLD = -80; // Minimum swipe distance to trigger
const MAX_SWIPE = -120; // Maximum swipe distance
const SNAP_POINT = -100; // Where the card snaps when released

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


export const SwipeableKarzedaarCard: React.FC<SwipeableKarzedaarCardProps> = ({
  karzedaar,
  bills,
  onPress,
  onRemind,
  style,
  hapticsEnabled = true,
}) => {
  const [pressed, setPressed] = useState(false);
  const translateX = useSharedValue(0);
  const [remindRevealed, setRemindRevealed] = useState(false);
  const hasTriggeredHaptic = useSharedValue(false);

  // Calculate pending amount from bills
  const pendingAmountPaise = useMemo(() => {
    let pending = 0;
    bills.forEach((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      if (participant && participant.status === PaymentStatus.PENDING) {
        pending += participant.amountPaise;
      }
    });
    return pending;
  }, [bills, karzedaar.name]);

  const hasPending = pendingAmountPaise > 0;

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleRemind = () => {
    // Reset position
    translateX.value = withSpring(0, springConfigs.smooth);
    setRemindRevealed(false);

    // Trigger haptic
    triggerHaptic();

    // Call reminder callback or show alert
    if (onRemind) {
      onRemind();
    } else {
      Alert.alert(
        'Send Reminder',
        `Send payment reminder to ${karzedaar.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: () => {
              // Handle reminder sending
              console.log('Sending reminder to', karzedaar.name);
            },
          },
        ]
      );
    }
  };

  const gestureHandler = (event: any) => {
    'worklet';
    const { translationX, state } = event.nativeEvent;

    if (state === 2) { // ACTIVE
      // Only allow left swipe (negative values) and cap at MAX_SWIPE
      if (translationX < 0) {
        translateX.value = Math.max(translationX, MAX_SWIPE);

        // Trigger haptic ONCE at threshold crossing
        if (translationX < SWIPE_THRESHOLD && !hasTriggeredHaptic.value && hapticsEnabled) {
          hasTriggeredHaptic.value = true;
          runOnJS(triggerHaptic)();
        }
      } else {
        translateX.value = 0;
      }
    } else if (state === 5) { // END
      // Reset haptic trigger
      hasTriggeredHaptic.value = false;

      // If swiped past threshold, snap to reveal state
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(SNAP_POINT, {
          ...springConfigs.smooth,
          overshootClamping: true,
        });
        runOnJS(setRemindRevealed)(true);
      } else {
        // Otherwise snap back
        translateX.value = withSpring(0, {
          ...springConfigs.smooth,
          overshootClamping: true,
        });
        runOnJS(setRemindRevealed)(false);
      }
    } else if (state === 1) { // BEGIN
      // Reset haptic trigger when gesture starts
      hasTriggeredHaptic.value = false;
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { scale: withSpring(pressed ? 0.98 : 1, springConfigs.gentle) },
      ],
    };
  });

  const actionAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = translateX.value < SWIPE_THRESHOLD ? 1 : 0.5;
    return {
      opacity: withSpring(opacity, springConfigs.snappy),
    };
  });

  const initials = getInitials(karzedaar.name);
  const hasContactInfo = karzedaar.phone || karzedaar.upiId;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Background Action Button */}
      <View style={styles.actionContainer}>
        <Animated.View style={[styles.actionButton, actionAnimatedStyle]}>
          <Pressable
            onPress={handleRemind}
            style={styles.actionPressable}
            disabled={!remindRevealed}
          >
            <Send size={24} color={tokens.colors.background.card} strokeWidth={2} />
            <Text style={styles.actionText}>Remind</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Swipeable Card */}
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        enabled={hasPending}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-10, 10]}
        maxPointers={1}
      >
        <Animated.View style={cardAnimatedStyle}>
          <Pressable
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            accessibilityLabel={`Karzedaar: ${karzedaar.name}`}
            accessibilityHint="Double tap to view details, swipe left to send reminder"
            accessibilityRole="button"
          >
            <GlassCard
              borderRadius={tokens.radius.md}
              style={hasPending ? styles.cardPending : styles.cardSettled}
            >
              <View style={styles.container}>
                {/* Horizontal Layout: Avatar Left, Info Right */}
                <View style={styles.contentRow}>
                  {/* Avatar with Initials */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  {/* Karzedaar Info */}
                  <View style={styles.infoContainer}>
                    {/* Name */}
                    <Text style={styles.name} numberOfLines={1}>
                      {karzedaar.name}
                    </Text>

                    {/* Contact Info Row */}
                    {hasContactInfo && (
                      <View style={styles.contactRow}>
                        {karzedaar.phone && (
                          <View style={styles.contactItem}>
                            <Phone size={12} color={tokens.colors.text.tertiary} />
                            <Text style={styles.contactText} numberOfLines={1}>
                              {karzedaar.phone}
                            </Text>
                          </View>
                        )}
                        {karzedaar.upiId && (
                          <View style={styles.contactItem}>
                            <User size={12} color={tokens.colors.text.tertiary} />
                            <Text style={styles.contactText} numberOfLines={1}>
                              {karzedaar.upiId}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{karzedaar.billCount}</Text>
                        <Text style={styles.statLabel}>
                          {karzedaar.billCount === 1 ? 'bill' : 'bills'}
                        </Text>
                      </View>

                      {karzedaar.totalAmountPaise > 0 && (
                        <>
                          <View style={styles.statDivider} />
                          <View style={styles.statItem}>
                            <Text style={hasPending ? styles.statValuePending : styles.statValue}>
                              {hasPending
                                ? `${formatCurrency(pendingAmountPaise)} pending of ${formatCurrency(karzedaar.totalAmountPaise)}`
                                : `${formatCurrency(karzedaar.totalAmountPaise)} (all paid)`}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Chevron or Swipe Hint */}
                  {hasPending ? (
                    <Text style={styles.swipeHint}>⟨⟨</Text>
                  ) : (
                    <Text style={styles.chevron}>→</Text>
                  )}
                </View>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  actionContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: tokens.spacing.sm,
  },
  actionButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  actionText: {
    ...tokens.typography.caption,
    color: tokens.colors.background.card,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  cardPending: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.amber[500],
  },
  cardSettled: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.sage[500],
  },
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
  statValuePending: {
    ...tokens.typography.caption,
    fontWeight: '600',
    color: tokens.colors.amber[700],
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
  chevron: {
    ...tokens.typography.h3,
    color: tokens.colors.text.tertiary,
    flexShrink: 0,
  },
  swipeHint: {
    ...tokens.typography.h3,
    color: tokens.colors.amber[500],
    flexShrink: 0,
    opacity: 0.5,
  },
});
