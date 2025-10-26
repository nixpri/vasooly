/**
 * Karzedaar Detail Screen - Individual Karzedaar Overview
 *
 * Features:
 * - Karzedaar information card (name, contact, balance)
 * - Transaction history with this karzedaar
 * - Net balance visualization
 * - Settle Up button
 * - Remind button (if they owe you)
 *
 * Design patterns:
 * - Glass-morphism design system
 * - FlashList for performant bill history
 * - Lucide icons for consistency
 * - Type-safe navigation
 */

import React, { useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
  StatusBar,
  InteractionManager,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Phone,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import type { KarzedaarDetailScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';
import { GlassCard, LoadingSpinner, ScreenHeader, AnimatedButton } from '@/components';
import { useKarzedaarsStore, useBillStore, useSettingsStore } from '@/stores';
import { formatPaise } from '@/lib/business/splitEngine';
import type { Bill } from '@/types';
import { BillStatus, PaymentStatus } from '@/types';
import { sendPaymentReminder, isWhatsAppInstalled, showWhatsAppNotInstalledError } from '@/services/whatsappService';

export const KarzedaarDetailScreen: React.FC<KarzedaarDetailScreenProps> = ({ route, navigation }) => {
  const { karzedaarId } = route.params;

  // State
  const { karzedaars, loadKarzedaars } = useKarzedaarsStore();
  const { bills, loadAllBills, isLoading } = useBillStore();
  const { defaultVPA, defaultUPIName } = useSettingsStore();
  const hasNavigatedRef = useRef(false);

  // Load data on mount only (not on focus) - deferred after animations complete
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadKarzedaars();
      loadAllBills();
    });

    return () => task.cancel();
  }, []); // Run once on mount

  // Reset navigation ref on focus (for back navigation logic)
  useFocusEffect(
    useCallback(() => {
      hasNavigatedRef.current = false;
    }, [])
  );

  // Find karzedaar
  const karzedaar = useMemo(
    () => karzedaars.find((k) => k.id === karzedaarId),
    [karzedaars, karzedaarId]
  );

  // Get bills involving this karzedaar
  const karzedaarBills = useMemo(() => {
    if (!karzedaar) return [];
    return bills.filter((bill) =>
      bill.participants.some(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      )
    );
  }, [bills, karzedaar]);

  // Calculate net balance (positive = they owe you, negative = you owe them)
  const netBalancePaise = useMemo(() => {
    if (!karzedaar) return 0;

    let balance = 0;
    karzedaarBills.forEach((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      if (participant && participant.status === PaymentStatus.PENDING) {
        balance += participant.amountPaise;
      }
    });

    return balance;
  }, [karzedaar, karzedaarBills]);

  // Get pending bills count (where THIS karzedaar's participant is PENDING)
  const pendingBillsCount = useMemo(() => {
    if (!karzedaar) return 0;
    return karzedaarBills.filter((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      return participant?.status === PaymentStatus.PENDING;
    }).length;
  }, [karzedaar, karzedaarBills]);

  // Get settled bills count (where THIS karzedaar's participant is PAID)
  const settledBillsCount = useMemo(() => {
    if (!karzedaar) return 0;
    return karzedaarBills.filter((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      return participant?.status === PaymentStatus.PAID;
    }).length;
  }, [karzedaar, karzedaarBills]);

  // Navigate back if karzedaar not found (silently, without alert)
  useEffect(() => {
    if (!karzedaar && !isLoading && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      // Silently navigate back when karzedaar is removed (e.g., after deleting last bill)
      navigation.goBack();
    }
  }, [karzedaar, isLoading, navigation]);

  // Handle settle up
  const handleSettleUp = useCallback(() => {
    if (!karzedaar) return;
    navigation.navigate('SettleUp', { karzedaarId: karzedaar.id });
  }, [karzedaar, navigation]);

  // Handle remind
  const handleRemind = useCallback(async () => {
    if (!karzedaar) return;

    // Check if UPI ID is configured
    if (!defaultVPA || !defaultUPIName) {
      Alert.alert(
        'UPI ID Required',
        'Please configure your UPI ID in Settings before sending payment requests.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Get pending bills for this karzedaar
    const pendingBills = karzedaarBills.filter((bill) => {
      const participant = bill.participants.find(
        (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
      );
      return participant?.status === PaymentStatus.PENDING;
    });

    if (pendingBills.length === 0) {
      Alert.alert(
        'No Pending Payments',
        `${karzedaar.name} has no pending payments.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if WhatsApp is installed
    const whatsappAvailable = await isWhatsAppInstalled();
    if (!whatsappAvailable) {
      showWhatsAppNotInstalledError();
      return;
    }

    // Check if phone number is available
    if (!karzedaar.phone) {
      Alert.alert(
        'Phone Number Required',
        `No phone number found for ${karzedaar.name}. Please add their phone number from contacts.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Send reminder
    const result = await sendPaymentReminder(
      karzedaar.name,
      karzedaar.phone,
      pendingBills,
      defaultVPA,
      defaultUPIName
    );

    if (result.success) {
      Alert.alert(
        'Reminder Sent',
        `Payment reminder sent to ${karzedaar.name} via WhatsApp`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Failed to Send',
        result.error || 'Could not send payment reminder',
        [{ text: 'OK' }]
      );
    }
  }, [karzedaar, karzedaarBills, defaultVPA, defaultUPIName]);

  // Handle bill press (cross-tab navigation)
  const handleBillPress = useCallback(
    (bill: Bill) => {
      // Navigate to Activity tab's VasoolyDetail screen
      navigation.getParent()?.navigate('Activity', {
        screen: 'VasoolyDetail',
        params: { billId: bill.id },
      });
    },
    [navigation]
  );

  if (!karzedaar) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} color={tokens.colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasBalance = netBalancePaise !== 0;
  const theyOweYou = netBalancePaise > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.base} />

      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader title={karzedaar.name} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Karzedaar Info Card */}
          <GlassCard borderRadius={tokens.radius.lg} style={styles.infoCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {karzedaar.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {karzedaar.phone && (
                <View style={styles.contactRow}>
                  <Phone size={16} color={tokens.colors.text.secondary} strokeWidth={2} />
                  <Text style={styles.contactText}>{karzedaar.phone}</Text>
                </View>
              )}
              {karzedaar.upiId && (
                <View style={styles.contactRow}>
                  <CreditCard size={16} color={tokens.colors.text.secondary} strokeWidth={2} />
                  <Text style={styles.contactText}>{karzedaar.upiId}</Text>
                </View>
              )}
            </View>

            {/* Net Balance */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Net Balance</Text>
              <View style={styles.balanceRow}>
                {hasBalance ? (
                  theyOweYou ? (
                    <TrendingUp size={24} color={tokens.colors.success.main} strokeWidth={2} />
                  ) : (
                    <TrendingDown size={24} color={tokens.colors.error.main} strokeWidth={2} />
                  )
                ) : (
                  <Check size={24} color={tokens.colors.sage[500]} strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.balanceAmount,
                    hasBalance && theyOweYou && styles.balancePositive,
                    hasBalance && !theyOweYou && styles.balanceNegative,
                  ]}
                >
                  {formatPaise(Math.abs(netBalancePaise))}
                </Text>
              </View>
              {hasBalance && (
                <Text style={styles.balanceSubtext}>
                  {theyOweYou ? 'They owe you' : 'You owe them'}
                </Text>
              )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{pendingBillsCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{settledBillsCount}</Text>
                <Text style={styles.statLabel}>Settled</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{karzedaarBills.length}</Text>
                <Text style={styles.statLabel}>Total Vasoolies</Text>
              </View>
            </View>
          </GlassCard>

          {/* Action Buttons */}
          {hasBalance && (
            <View style={styles.actionButtons}>
              {theyOweYou && (
                <AnimatedButton
                  onPress={handleRemind}
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  haptic
                >
                  <MessageCircle size={20} color={tokens.colors.text.primary} strokeWidth={2} />
                  <Text style={styles.actionButtonTextSecondary}>Remind</Text>
                </AnimatedButton>
              )}
              <AnimatedButton
                onPress={handleSettleUp}
                style={[styles.actionButton, styles.actionButtonPrimary]}
                haptic
              >
                <Check size={20} color={tokens.colors.background.card} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Settle Up</Text>
              </AnimatedButton>
            </View>
          )}

          {/* Transaction History */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Transaction History</Text>

            {karzedaarBills.length === 0 ? (
              <GlassCard borderRadius={tokens.radius.md} style={styles.emptyCard}>
                <Text style={styles.emptyText}>No bills with {karzedaar.name} yet</Text>
              </GlassCard>
            ) : (
              <View style={styles.billsList}>
                {karzedaarBills.map((bill) => {
                  const participant = bill.participants.find(
                    (p) => p.name.toLowerCase() === karzedaar.name.toLowerCase()
                  );
                  const isPaid = participant?.status === PaymentStatus.PAID;
                  const isSettled = bill.status === BillStatus.SETTLED;

                  return (
                    <Pressable key={bill.id} onPress={() => handleBillPress(bill)}>
                      <GlassCard
                        borderRadius={tokens.radius.md}
                        style={[
                          styles.billCard,
                          (isPaid || isSettled) && styles.billCardPaid,
                          !isPaid && !isSettled && styles.billCardPending,
                        ] as any}
                      >
                        <View style={styles.billContent}>
                          {/* Left Side - Bill Info */}
                          <View style={styles.billTextContainer}>
                            <Text style={styles.billTitle} numberOfLines={1}>
                              {bill.title}
                            </Text>
                            <Text style={styles.billDate}>
                              {bill.createdAt.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Text>
                          </View>

                          {/* Right Side - Amount & Status */}
                          <View style={styles.billRightContainer}>
                            <Text style={styles.billAmount}>
                              {formatPaise(participant?.amountPaise || 0)}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                (isPaid || isSettled) && styles.statusBadgePaid,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  (isPaid || isSettled) && styles.statusTextPaid,
                                ]}
                              >
                                {isPaid || isSettled ? 'Paid' : 'Pending'}
                              </Text>
                            </View>
                          </View>

                          {/* Arrow Icon */}
                          <ArrowRight
                            size={20}
                            color={tokens.colors.text.tertiary}
                            strokeWidth={2}
                            style={styles.arrowIcon}
                          />
                        </View>
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            )}
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
    paddingTop: tokens.spacing.xl, // Breathing room from header divider
    paddingBottom: 120, // Extra padding for bottom tab bar
  },
  infoCard: {
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${tokens.colors.brand.primary}26`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...tokens.typography.h1,
    color: tokens.colors.brand.primary,
    fontWeight: '700',
  },
  contactInfo: {
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
    alignItems: 'center', // Center align phone and UPI
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  contactText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: `${tokens.colors.text.tertiary}26`,
    borderBottomWidth: 1,
    borderBottomColor: `${tokens.colors.text.tertiary}26`,
    marginBottom: tokens.spacing.lg,
  },
  balanceLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the icon and amount together
    gap: tokens.spacing.sm,
  },
  balanceAmount: {
    ...tokens.typography.display,
    color: tokens.colors.text.primary,
    fontWeight: '700',
    textAlign: 'center', // Ensure text is centered
  },
  balancePositive: {
    color: tokens.colors.success.main,
  },
  balanceNegative: {
    color: tokens.colors.error.main,
  },
  balanceSubtext: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: `${tokens.colors.text.tertiary}26`,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  actionButtonPrimary: {
    backgroundColor: tokens.colors.amber[500],
  },
  actionButtonSecondary: {
    backgroundColor: tokens.colors.background.elevated,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
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
  historySection: {
    marginBottom: tokens.spacing.xl,
  },
  historyTitle: {
    ...tokens.typography.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  billsList: {
    gap: tokens.spacing.md,
  },
  billCard: {
    width: '100%',
  },
  billCardPaid: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.sage[500],
  },
  billCardPending: {
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.amber[500],
  },
  billContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  billTextContainer: {
    flex: 1, // KEY: This fills available space
    gap: 2,
  },
  billTitle: {
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  billDate: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },
  billRightContainer: {
    alignItems: 'flex-end',
    gap: 2,
    marginRight: tokens.spacing.xs,
  },
  billAmount: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.sm,
    backgroundColor: `${tokens.colors.warning.main}26`, // Pending - amber
  },
  statusBadgePaid: {
    backgroundColor: `${tokens.colors.brand.secondary}26`, // Paid - sage green
  },
  statusText: {
    ...tokens.typography.caption,
    color: tokens.colors.warning.main,
    fontWeight: '600',
    fontSize: 11,
  },
  statusTextPaid: {
    color: tokens.colors.brand.secondary,
  },
  arrowIcon: {
    flexShrink: 0, // Prevent arrow from shrinking
  },
  emptyCard: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
});
