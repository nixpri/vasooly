import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share as RNShare,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import {
  ChevronLeft,
  PartyPopper,
  IndianRupee,
  Share2,
  Check,
  Lock,
  RotateCcw,
  Trash2
} from 'lucide-react-native';
import { GlassCard, AnimatedGlassCard, AnimatedButton } from '@/components';
import { formatPaise } from '@/lib/business/splitEngine';
import { generateUPILink } from '@/lib/business/upiGenerator';
import { PaymentStatus } from '@/types';
import type { Participant } from '@/types';
import { useBillStore, useSettingsStore } from '@/stores';
import type { HomeVasoolyDetailScreenProps } from '@/navigation/types';
import { useHaptics } from '@/hooks';
import { springConfigs } from '@/utils/animations';
import { tokens } from '@/theme/ThemeProvider';

export const VasoolyDetailScreen: React.FC<HomeVasoolyDetailScreenProps> = ({ route, navigation }) => {
  const { billId } = route.params;
  const { getBillById, markParticipantPaid, markParticipantPending, deleteBill } = useBillStore();
  const { defaultVPA, defaultUPIName } = useSettingsStore();
  const haptics = useHaptics();

  // Helper function to check if participant is the current user (bill creator)
  const isCurrentUser = (participantName: string): boolean => {
    const trimmedName = participantName.trim();

    // Handle legacy "You" participant name OR empty string (when no UPI name was set)
    if (trimmedName === '' || trimmedName.toLowerCase() === 'you') {
      return true;
    }

    // If UPI name is set, check against that
    if (defaultUPIName) {
      return trimmedName.toLowerCase() === defaultUPIName.toLowerCase();
    }

    return false;
  };

  const [bill, setBill] = useState(getBillById(billId));

  // Animated values for progress bar and celebration
  const progressWidth = useSharedValue(0);
  const celebrationScale = useSharedValue(1);
  const celebrationRotation = useSharedValue(0);

  // Update local state when store changes (initial load)
  useEffect(() => {
    setBill(getBillById(billId));
  }, [billId, getBillById]);

  // Auto-refresh bill when screen gains focus (e.g., after updating payment status)
  useFocusEffect(
    useCallback(() => {
      const updatedBill = getBillById(billId);
      setBill(updatedBill);
    }, [billId, getBillById])
  );

  const vpaToUse = defaultVPA || 'merchant@paytm'; // Fallback VPA

  if (!bill) {
    // Bill not found, navigate back
    useEffect(() => {
      navigation.goBack();
    }, [navigation]);
    return null;
  }

  const handleTogglePaymentStatus = async (participant: Participant) => {
    try {
      const wasPaid = participant.status === PaymentStatus.PAID;

      if (wasPaid) {
        haptics.medium(); // Medium haptic for toggle
        await markParticipantPending(billId, participant.id);
      } else {
        haptics.success(); // Success haptic for payment marked
        await markParticipantPaid(billId, participant.id);
      }

      // Immediately update local state to reflect the change
      const updatedBill = getBillById(billId);
      setBill(updatedBill);

      // Check if bill is now fully settled for celebration
      if (!wasPaid && updatedBill) {
        const allPaid = updatedBill.participants.every((p) => p.status === PaymentStatus.PAID);
        if (allPaid) {
          // Trigger celebration animation
          celebrationScale.value = withSequence(
            withSpring(1.15, springConfigs.bouncy),
            withSpring(1, springConfigs.smooth)
          );
          celebrationRotation.value = withSequence(
            withSpring(10, springConfigs.bouncy),
            withSpring(-10, springConfigs.bouncy),
            withSpring(0, springConfigs.smooth)
          );
          haptics.success(); // Additional celebration haptic
        }
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      haptics.error(); // Error haptic
      Alert.alert('Error', 'Failed to update payment status. Please try again.');
    }
  };

  const handleGenerateUPILink = (participant: Participant): string => {
    const result = generateUPILink({
      pa: vpaToUse,
      pn: 'Vasooly',
      am: participant.amountPaise / 100, // Convert paise to rupees
      tn: `Payment for ${bill.title} - ${participant.name}`,
    });
    return result.standardUri;
  };

  const handleShareUPILink = async (participant: Participant) => {
    try {
      const upiLink = handleGenerateUPILink(participant);
      await RNShare.share({
        message: `Hi ${participant.name}! 👋\n\nPayment request for: ${bill.title}\nAmount: ${formatPaise(participant.amountPaise)}\n\nPay via UPI: ${upiLink}\n\nPowered by Vasooly 💜`,
      });
    } catch (error) {
      console.error('Failed to share UPI link:', error);
    }
  };

  const handleShareAllPending = async () => {
    try {
      const pendingParticipants = bill.participants.filter(
        p => p.status === PaymentStatus.PENDING
      );

      if (pendingParticipants.length === 0) {
        Alert.alert('All Paid! 🎉', 'All participants have already paid.');
        return;
      }

      // Generate message with all payment links
      let message = `💸 Payment Request: ${bill.title}\n\n`;

      pendingParticipants.forEach((p, index) => {
        const upiLink = handleGenerateUPILink(p);
        message += `${index + 1}. ${p.name} - ${formatPaise(p.amountPaise)}\n`;
        message += `   Pay: ${upiLink}\n\n`;
      });

      message += `Powered by Vasooly 💜`;

      await RNShare.share({ message });
      haptics.success();
    } catch (error) {
      console.error('Failed to share all pending links:', error);
    }
  };

  const calculateProgress = (): number => {
    if (bill.participants.length === 0) return 0;
    const paidCount = bill.participants.filter((p) => p.status === 'PAID').length;
    return (paidCount / bill.participants.length) * 100;
  };

  const getProgressText = (): string => {
    const paidCount = bill.participants.filter((p) => p.status === 'PAID').length;
    const totalCount = bill.participants.length;
    return `${paidCount}/${totalCount} paid`;
  };

  const getPaymentSummary = (): { paid: number; pending: number } => {
    return bill.participants.reduce(
      (acc, p) => {
        if (p.status === 'PAID') {
          acc.paid += p.amountPaise;
        } else {
          acc.pending += p.amountPaise;
        }
        return acc;
      },
      { paid: 0, pending: 0 }
    );
  };

  const progress = calculateProgress();
  const isFullySettled = progress === 100;
  const progressText = getProgressText();
  const { paid, pending } = getPaymentSummary();

  // Count pending participants for Share All button
  const pendingCount = bill.participants.filter(p => p.status === PaymentStatus.PENDING).length;

  // Animate progress bar when progress changes
  useEffect(() => {
    progressWidth.value = withSpring(progress, springConfigs.smooth);
  }, [progress, progressWidth]);

  // Animated styles for progress bar
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: isFullySettled ? tokens.colors.financial.settled : tokens.colors.amber[500],
  }));

  // Animated styles for celebration
  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: celebrationScale.value },
      { rotate: `${celebrationRotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <View style={styles.backButtonContent}>
            <ChevronLeft size={16} color={tokens.colors.brand.primary} strokeWidth={2.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{bill.title}</Text>
          <Text style={styles.headerDate}>
            Created {new Date(bill.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <AnimatedGlassCard
          style={isFullySettled ? styles.settledSummaryCard : styles.pendingSummaryCard}
          borderRadius={tokens.radius.lg}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryAmount}>{formatPaise(bill.totalAmountPaise)}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Payment Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, progressBarStyle]} />
              </View>
              <Text style={styles.progressText}>{progressText}</Text>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Paid</Text>
                <Text style={[styles.statValue, styles.statPaid]}>{formatPaise(paid)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={[styles.statValue, styles.statPending]}>{formatPaise(pending)}</Text>
              </View>
            </View>

            {isFullySettled && (
              <Animated.View style={[styles.settledBanner, celebrationStyle]}>
                <View style={styles.settledBannerContent}>
                  <PartyPopper size={16} color={tokens.colors.financial.positive} strokeWidth={2} />
                  <Text style={styles.settledBannerText}>All payments received!</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </AnimatedGlassCard>

        {/* Share All Pending Button */}
        {pendingCount > 0 && (
          <AnimatedButton
            onPress={() => {
              haptics.light();
              handleShareAllPending();
            }}
            style={styles.shareAllButton}
            haptic
            hapticIntensity="light"
          >
            <View style={styles.shareAllButtonContent}>
              <Share2 size={20} color={tokens.colors.text.inverse} strokeWidth={2.5} />
              <Text style={styles.shareAllButtonText}>
                Send Vasoolis to All Pending ({pendingCount})
              </Text>
            </View>
          </AnimatedButton>
        )}

        {/* Participants */}
        <Text style={styles.sectionTitle}>
          Participants ({bill.participants.length})
        </Text>
        <View style={styles.participantsList}>
          {bill.participants.map((participant) => {
            const isPaid = participant.status === PaymentStatus.PAID;
            const isCreator = isCurrentUser(participant.name);

            return (
              <GlassCard
                key={participant.id}
                style={[
                  styles.participantCard,
                  isPaid ? styles.participantCardPaid : styles.participantCardPending
                ]}
                borderRadius={tokens.radius.md}
              >
                <View style={styles.participantContent}>
                  {/* Top Row: Avatar + Name + Amount */}
                  <View style={styles.participantTopRow}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {participant.name.trim() ? participant.name.charAt(0).toUpperCase() : 'Y'}
                      </Text>
                    </View>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.name.trim() ? `${participant.name}${isCreator ? ' (You)' : ''}` : 'You'}
                      </Text>
                      <Text style={styles.participantAmount}>
                        {formatPaise(participant.amountPaise)}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.participantDivider} />

                  {/* Action Row: Status + Actions */}
                  <View style={styles.participantActionRow}>
                    {/* Status Badge */}
                    <View style={isPaid ? styles.statusBadgePaid : styles.statusBadgePending}>
                      {isPaid && <Check size={12} color={tokens.colors.financial.positive} strokeWidth={3} />}
                      <Text style={isPaid ? styles.statusBadgeTextPaid : styles.statusBadgeTextPending}>
                        {isPaid ? 'PAID' : 'PENDING'}
                      </Text>
                    </View>

                    {/* Action Buttons - Show locked state for creator */}
                    {isCreator ? (
                      <View style={styles.lockedIndicator}>
                        <Lock size={16} color={tokens.colors.text.secondary} strokeWidth={2} />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                    ) : (
                      <View style={styles.actionButtons}>
                        <AnimatedButton
                          onPress={() => handleTogglePaymentStatus(participant)}
                          style={isPaid ? styles.actionButtonPaid : styles.actionButtonPending}
                          haptic
                          hapticIntensity="medium"
                        >
                          <View style={styles.actionButtonContent}>
                            {isPaid ? (
                              <RotateCcw size={16} color={tokens.colors.terracotta[700]} strokeWidth={2.5} />
                            ) : (
                              <Check size={16} color={tokens.colors.text.inverse} strokeWidth={3} />
                            )}
                            <Text style={isPaid ? styles.actionButtonUndoText : styles.actionButtonText}>
                              {isPaid ? 'Undo' : 'Mark Paid'}
                            </Text>
                          </View>
                        </AnimatedButton>

                        {!isPaid && (
                          <AnimatedButton
                            onPress={() => {
                              haptics.light();
                              handleShareUPILink(participant);
                            }}
                            style={styles.actionButtonShare}
                            haptic
                            hapticIntensity="light"
                          >
                            <View style={styles.actionButtonContent}>
                              <Share2 size={16} color={tokens.colors.text.inverse} strokeWidth={2.5} />
                              <Text style={styles.actionButtonShareText}>Share</Text>
                            </View>
                          </AnimatedButton>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </GlassCard>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <AnimatedButton
            onPress={async () => {
              haptics.warning();
              Alert.alert(
                'Delete Bill',
                `Are you sure you want to delete "${bill.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        haptics.heavy();
                        await deleteBill(billId);
                        navigation.goBack();
                      } catch (error) {
                        console.error('Failed to delete bill:', error);
                        haptics.error();
                        Alert.alert('Error', 'Failed to delete bill. Please try again.');
                      }
                    },
                  },
                ]
              );
            }}
            style={styles.deleteButton}
            haptic
            hapticIntensity="medium"
          >
            <View style={styles.deleteButtonContent}>
              <Trash2 size={18} color={tokens.colors.error.main} strokeWidth={2} />
              <Text style={styles.deleteButtonText}>Delete Bill</Text>
            </View>
          </AnimatedButton>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 52,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 13,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  headerContent: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  headerDate: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.xl,
    paddingBottom: 120, // Extra padding for bottom navigation and safe area
    gap: tokens.spacing.xl,
  },
  summaryCard: {
    width: '100%',
  },
  pendingSummaryCard: {
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.amber[500],  // Amber left border for pending bills
  },
  settledSummaryCard: {
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.sage[500],  // Sage/green left border for settled bills
  },
  summaryContent: {
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: tokens.colors.text.primary,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  progressBackground: {
    height: 5,
    backgroundColor: tokens.colors.border.default,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flex: 1,
    gap: 3,
  },
  statLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statPaid: {
    color: tokens.colors.financial.positive,
  },
  statPending: {
    color: tokens.colors.financial.pending,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: tokens.colors.border.light,
  },
  settledBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: tokens.colors.financial.positiveLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.colors.financial.positive,
  },
  settledBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  settledBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.financial.positive,
  },
  shareAllButton: {
    width: '100%',
    backgroundColor: tokens.colors.sage[600],
    paddingVertical: 14,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.colors.sage[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shareAllButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareAllButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.text.inverse,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  participantsList: {
    gap: 8,
  },
  participantCard: {
    width: '100%',
  },
  participantCardPaid: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.sage[500],
  },
  participantCardPending: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.amber[500],
  },
  participantContent: {
    padding: 10,
    gap: 8,
  },
  // Modern Horizontal Layout - Top Row
  participantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.brand.primaryLight,
    borderWidth: 2,
    borderColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.brand.primary,
  },
  participantInfo: {
    flex: 1,
    gap: 2,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  participantAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.text.primary,
  },

  // Divider
  participantDivider: {
    height: 1,
    backgroundColor: tokens.colors.border.subtle,
    marginVertical: 2,
  },

  // Modern Horizontal Layout - Action Row
  participantActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  // Status Badges (compact)
  statusBadgePaid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: tokens.colors.financial.positiveLight,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.financial.positive,
  },
  statusBadgePending: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: tokens.colors.financial.pendingLight,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.financial.pending,
  },
  statusBadgeTextPaid: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.financial.positive,
    letterSpacing: 0.5,
  },
  statusBadgeTextPending: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.colors.amber[800],
    letterSpacing: 0.5,
  },

  // Action Buttons (horizontal side-by-side)
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonPaid: {
    backgroundColor: tokens.colors.terracotta[100],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.terracotta[300],
  },
  actionButtonPending: {
    backgroundColor: tokens.colors.amber[500],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.sm,
    shadowColor: tokens.colors.amber[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.text.inverse,
    letterSpacing: 0.2,
  },
  actionButtonUndoText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.terracotta[700],
    letterSpacing: 0.2,
  },
  actionButtonShare: {
    backgroundColor: tokens.colors.sage[600],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.colors.sage[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonShareText: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.colors.text.inverse,
    letterSpacing: 0.2,
  },
  // Locked Indicator for Creator
  lockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    letterSpacing: 0.2,
  },
  actionsContainer: {
    paddingTop: 8,
  },
  deleteButton: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: tokens.colors.error.light,
    borderWidth: 1,
    borderColor: tokens.colors.error.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.error.main,
    letterSpacing: 0.3,
  },
});
