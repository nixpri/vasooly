/**
 * Settle Up Screen - Mark Received Payments as Settled
 *
 * Purpose: This is a COLLECTION app - user receives money from karzedaars
 *
 * Features:
 * - Settlement summary with amount breakdown
 * - Settlement method selection (how karzedaar paid you: UPI, Cash, Other)
 * - Mark all pending payments from karzedaar as settled
 * - Success celebration when payment is received
 *
 * Design patterns:
 * - Glass-morphism design system
 * - Type-safe navigation
 * - Optimistic updates with rollback
 *
 * Note: Payment happens OUTSIDE the app. This screen just records that
 * the user has received payment from their karzedaar.
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  CreditCard,
  Banknote,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react-native';
import type { SettleUpScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';
import { GlassCard, LoadingSpinner, ScreenHeader, AnimatedButton } from '@/components';
import { useKarzedaarsStore, useBillStore } from '@/stores';
import { formatPaise } from '@/lib/business/splitEngine';
import { BillStatus, PaymentStatus } from '@/types';

enum SettlementMethod {
  UPI = 'UPI',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export const SettleUpScreen: React.FC<SettleUpScreenProps> = ({ route, navigation }) => {
  const { karzedaarId } = route.params;

  // State
  const { karzedaars } = useKarzedaarsStore();
  const { bills, markParticipantPaid, isLoading: billsLoading } = useBillStore();
  const [selectedMethod, setSelectedMethod] = useState<SettlementMethod>(SettlementMethod.UPI);
  const [settling, setSettling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Find karzedaar
  const karzedaar = useMemo(
    () => karzedaars.find((k) => k.id === karzedaarId),
    [karzedaars, karzedaarId]
  );

  // Get bills involving this karzedaar with pending payments
  const pendingBills = useMemo(() => {
    if (!karzedaar) return [];
    return bills
      .filter((bill) => bill.status === BillStatus.ACTIVE)
      .filter((bill) =>
        bill.participants.some(
          (p) =>
            p.name.toLowerCase() === karzedaar.name.toLowerCase() &&
            p.status === PaymentStatus.PENDING
        )
      );
  }, [bills, karzedaar]);

  // Calculate total pending amount
  const totalPendingPaise = useMemo(() => {
    if (!karzedaar) return 0;

    let total = 0;
    pendingBills.forEach((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      if (participant && participant.status === PaymentStatus.PENDING) {
        total += participant.amountPaise;
      }
    });

    return total;
  }, [karzedaar, pendingBills]);

  // Navigate back silently if karzedaar removed or no pending amount (after settlement)
  useEffect(() => {
    if (!billsLoading && !settling && !showSuccess && !hasNavigatedRef.current) {
      if (!karzedaar || totalPendingPaise === 0) {
        hasNavigatedRef.current = true;
        // Silently navigate back - user has either settled or karzedaar was removed
        navigation.goBack();
      }
    }
  }, [karzedaar, totalPendingPaise, billsLoading, settling, showSuccess, navigation]);

  // Handle settlement confirmation
  const handleConfirmSettlement = useCallback(async () => {
    if (!karzedaar) return;

    const methodText =
      selectedMethod === SettlementMethod.UPI
        ? 'via UPI'
        : selectedMethod === SettlementMethod.CASH
        ? 'in cash'
        : 'by other means';

    Alert.alert(
      'Confirm Receipt',
      `Confirm you received ${formatPaise(totalPendingPaise)} from ${karzedaar.name} ${methodText}?\n\nThis will mark all pending payments as settled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setSettling(true);
            try {
              // Mark all pending participants as paid
              for (const bill of pendingBills) {
                const participant = bill.participants.find(
                  (p) =>
                    p.name.toLowerCase() === karzedaar.name.toLowerCase() &&
                    p.status === PaymentStatus.PENDING
                );
                if (participant) {
                  await markParticipantPaid(bill.id, participant.id);
                }
              }

              // Show success
              setShowSuccess(true);

              // Navigate back to detail screen after a delay
              setTimeout(() => {
                navigation.navigate('KarzedaarDetail', { karzedaarId });
              }, 2000);
            } catch (error) {
              console.error('Error settling payments:', error);
              Alert.alert('Error', 'Failed to mark payments as settled. Please try again.');
            } finally {
              setSettling(false);
            }
          },
        },
      ]
    );
  }, [karzedaar, selectedMethod, totalPendingPaise, pendingBills, markParticipantPaid, navigation]);

  if (!karzedaar || totalPendingPaise === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} color={tokens.colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Show success screen
  if (showSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.base} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={80} color={tokens.colors.brand.secondary} strokeWidth={2} />
          </View>
          <Text style={styles.successTitle}>Payment Received!</Text>
          <Text style={styles.successSubtitle}>
            You've successfully collected {formatPaise(totalPendingPaise)} from {karzedaar.name}.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.base} />

      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader title="Settle Up" subtitle={`with ${karzedaar.name}`} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Settlement Summary */}
          <GlassCard borderRadius={tokens.radius.lg} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryAmount}>{formatPaise(totalPendingPaise)}</Text>
            <Text style={styles.summarySubtext}>
              {pendingBills.length} {pendingBills.length === 1 ? 'bill' : 'bills'} pending
            </Text>
          </GlassCard>

          {/* Bill Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Breakdown</Text>
            <View style={styles.billsList}>
              {pendingBills.map((bill) => {
                const participant = bill.participants.find(
                  (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
                );

                return (
                  <GlassCard key={bill.id} borderRadius={tokens.radius.md} style={styles.billCard}>
                    <View style={styles.billCardContent}>
                      <View style={styles.billInfo}>
                        <Text style={styles.billTitle}>{bill.title}</Text>
                        <Text style={styles.billDate}>{bill.createdAt.toLocaleDateString()}</Text>
                      </View>
                      <Text style={styles.billAmount}>
                        {formatPaise(participant?.amountPaise || 0)}
                      </Text>
                    </View>
                  </GlassCard>
                );
              })}
            </View>
          </View>

          {/* Settlement Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settlement Method</Text>
            <View style={styles.methodsList}>
              {/* UPI */}
              <Pressable
                onPress={() => setSelectedMethod(SettlementMethod.UPI)}
                style={({ pressed }) => [
                  styles.methodCard,
                  selectedMethod === SettlementMethod.UPI && styles.methodCardSelected,
                  pressed && styles.methodCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.methodIcon,
                    selectedMethod === SettlementMethod.UPI && styles.methodIconSelected,
                  ]}
                >
                  <CreditCard
                    size={24}
                    color={
                      selectedMethod === SettlementMethod.UPI
                        ? tokens.colors.background.card
                        : tokens.colors.brand.primary
                    }
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>UPI Payment</Text>
                  <Text style={styles.methodSubtitle}>Instant digital payment</Text>
                </View>
                {selectedMethod === SettlementMethod.UPI && (
                  <CheckCircle size={20} color={tokens.colors.brand.primary} strokeWidth={2} />
                )}
              </Pressable>

              {/* Cash */}
              <Pressable
                onPress={() => setSelectedMethod(SettlementMethod.CASH)}
                style={({ pressed }) => [
                  styles.methodCard,
                  selectedMethod === SettlementMethod.CASH && styles.methodCardSelected,
                  pressed && styles.methodCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.methodIcon,
                    selectedMethod === SettlementMethod.CASH && styles.methodIconSelected,
                  ]}
                >
                  <Banknote
                    size={24}
                    color={
                      selectedMethod === SettlementMethod.CASH
                        ? tokens.colors.background.card
                        : tokens.colors.brand.primary
                    }
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Cash</Text>
                  <Text style={styles.methodSubtitle}>Physical payment</Text>
                </View>
                {selectedMethod === SettlementMethod.CASH && (
                  <CheckCircle size={20} color={tokens.colors.brand.primary} strokeWidth={2} />
                )}
              </Pressable>

              {/* Other */}
              <Pressable
                onPress={() => setSelectedMethod(SettlementMethod.OTHER)}
                style={({ pressed }) => [
                  styles.methodCard,
                  selectedMethod === SettlementMethod.OTHER && styles.methodCardSelected,
                  pressed && styles.methodCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.methodIcon,
                    selectedMethod === SettlementMethod.OTHER && styles.methodIconSelected,
                  ]}
                >
                  <MoreHorizontal
                    size={24}
                    color={
                      selectedMethod === SettlementMethod.OTHER
                        ? tokens.colors.background.card
                        : tokens.colors.brand.primary
                    }
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>Other</Text>
                  <Text style={styles.methodSubtitle}>Bank transfer, cheque, etc.</Text>
                </View>
                {selectedMethod === SettlementMethod.OTHER && (
                  <CheckCircle size={20} color={tokens.colors.brand.primary} strokeWidth={2} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionButtons}>
            <AnimatedButton
              onPress={handleConfirmSettlement}
              style={styles.actionButton}
              disabled={settling}
              haptic
            >
              {settling ? (
                <LoadingSpinner size={20} color={tokens.colors.background.card} />
              ) : (
                <>
                  <CheckCircle size={20} color={tokens.colors.background.card} strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Confirm Payment Received</Text>
                </>
              )}
            </AnimatedButton>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 120, // Extra padding for bottom tab bar
  },
  summaryCard: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  summaryLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  summaryAmount: {
    ...tokens.typography.display,
    color: tokens.colors.text.primary,
    fontWeight: '700',
    marginBottom: tokens.spacing.xs,
  },
  summarySubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
  },
  section: {
    marginBottom: tokens.spacing.lg,
  },
  sectionTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  billsList: {
    gap: tokens.spacing.sm,
  },
  billCard: {
    padding: tokens.spacing.md,
  },
  billCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  billDate: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
  },
  billAmount: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  methodsList: {
    gap: tokens.spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    backgroundColor: `${tokens.colors.background.card}CC`,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: tokens.colors.brand.primary,
    backgroundColor: `${tokens.colors.brand.primary}0D`, // 5% opacity
  },
  methodCardPressed: {
    opacity: 0.7,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${tokens.colors.brand.primary}1A`, // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  methodIconSelected: {
    backgroundColor: tokens.colors.brand.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  methodSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  noticeContent: {
    flex: 1,
  },
  noticeText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  actionButtons: {
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.amber[500],
  },
  actionButtonText: {
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.background.card,
  },
  actionButtonTextSecondary: {
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  successIcon: {
    marginBottom: tokens.spacing.xl,
  },
  successTitle: {
    ...tokens.typography.h1,
    color: tokens.colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  successSubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
