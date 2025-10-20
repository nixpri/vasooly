import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share as RNShare,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { GlassCard, AnimatedGlassCard, AnimatedButton } from '@/components';
import { formatPaise } from '@/lib/business/splitEngine';
import { generateUPILink } from '@/lib/business/upiGenerator';
import { PaymentStatus } from '@/types';
import type { Participant } from '@/types';
import { useBillStore, useSettingsStore } from '@/stores';
import type { BillDetailScreenProps } from '@/navigation/AppNavigator';
import { useHaptics } from '@/hooks';
import { springConfigs } from '@/utils/animations';

export const BillDetailScreen: React.FC<BillDetailScreenProps> = ({ route, navigation }) => {
  const { billId } = route.params;
  const { getBillById, markParticipantPaid, markParticipantPending, deleteBill } = useBillStore();
  const { defaultVPA } = useSettingsStore();
  const haptics = useHaptics();

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

  const handleOpenUPILink = async (participant: Participant) => {
    try {
      const upiLink = handleGenerateUPILink(participant);
      const canOpen = await Linking.canOpenURL(upiLink);
      if (canOpen) {
        await Linking.openURL(upiLink);
      } else {
        Alert.alert('Error', 'No UPI app found. Please install a UPI app to continue.');
      }
    } catch (error) {
      console.error('Failed to open UPI link:', error);
      Alert.alert('Error', 'Failed to open UPI app. Please try again.');
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

  // Animate progress bar when progress changes
  useEffect(() => {
    progressWidth.value = withSpring(progress, springConfigs.smooth);
  }, [progress, progressWidth]);

  // Animated styles for progress bar
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: isFullySettled ? '#10B981' : '#6C5CE7',
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
          <Text style={styles.backButtonText}>← Back</Text>
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
        <AnimatedGlassCard style={styles.summaryCard} borderRadius={16}>
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
                <Text style={styles.settledBannerText}>🎉 All payments received!</Text>
              </Animated.View>
            )}
          </View>
        </AnimatedGlassCard>

        {/* Participants */}
        <Text style={styles.sectionTitle}>Participants</Text>
        <View style={styles.participantsList}>
          {bill.participants.map((participant) => {
            const isPaid = participant.status === PaymentStatus.PAID;

            return (
              <GlassCard key={participant.id} style={styles.participantCard} borderRadius={12}>
                <View style={styles.participantContent}>
                  {/* Participant Info */}
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {participant.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      <Text style={styles.participantAmount}>
                        {formatPaise(participant.amountPaise)}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <AnimatedButton
                    onPress={() => handleTogglePaymentStatus(participant)}
                    style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}
                    haptic
                    hapticIntensity="medium"
                  >
                    <Text style={[styles.statusText, isPaid && styles.statusTextPaid]}>
                      {isPaid ? '✓ Paid' : 'Pending'}
                    </Text>
                  </AnimatedButton>

                  {/* UPI Actions (only show for pending) */}
                  {!isPaid && (
                    <View style={styles.upiActions}>
                      <AnimatedButton
                        onPress={() => {
                          haptics.light();
                          handleOpenUPILink(participant);
                        }}
                        style={[styles.upiButton, styles.upiButtonPrimary]}
                        haptic
                        hapticIntensity="light"
                      >
                        <Text style={styles.upiButtonText}>Pay Now</Text>
                      </AnimatedButton>
                      <AnimatedButton
                        onPress={() => {
                          haptics.light();
                          handleShareUPILink(participant);
                        }}
                        style={[styles.upiButton, styles.upiButtonSecondary]}
                        haptic
                        hapticIntensity="light"
                      >
                        <Text style={styles.upiButtonTextSecondary}>Share Link</Text>
                      </AnimatedButton>
                    </View>
                  )}
                </View>
              </GlassCard>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <AnimatedButton
            onPress={() => {
              haptics.light();
              navigation.navigate('BillCreate', { bill });
            }}
            style={[styles.actionButton, styles.actionButtonSecondary]}
            haptic
            hapticIntensity="light"
          >
            <Text style={styles.actionButtonTextSecondary}>✏️ Edit</Text>
          </AnimatedButton>
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
            style={[styles.actionButton, styles.actionButtonDanger]}
            haptic
            hapticIntensity="medium"
          >
            <Text style={styles.actionButtonTextDanger}>🗑️ Delete</Text>
          </AnimatedButton>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  headerContent: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
    gap: 20,
  },
  summaryCard: {
    width: '100%',
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
    color: 'rgba(255, 255, 255, 0.6)',
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBackground: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.6)',
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
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statPaid: {
    color: '#10B981',
  },
  statPending: {
    color: '#F59E0B',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  settledBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  settledBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  participantsList: {
    gap: 8,
  },
  participantCard: {
    width: '100%',
  },
  participantContent: {
    padding: 12,
    gap: 10,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(108, 92, 231, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  participantDetails: {
    flex: 1,
    gap: 3,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusPaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statusTextPaid: {
    color: '#10B981',
  },
  upiActions: {
    flexDirection: 'row',
    gap: 6,
  },
  upiButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiButtonPrimary: {
    backgroundColor: '#6C5CE7',
  },
  upiButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upiButtonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionButtonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionButtonTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
