/**
 * Add Vasooly Screen - Create or Edit Bill/Expense
 *
 * Features:
 * - Bill title and amount input
 * - Category selection
 * - Receipt photo upload (camera, gallery, PDF)
 * - Participant management with contacts integration
 * - Split calculation and preview
 * - Keyboard-aware scrolling
 *
 * Design patterns:
 * - Glass-morphism design system
 * - Standard screen with keyboard handling
 * - Type-safe navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Contacts from 'expo-contacts';
import {
  FileText,
  Camera,
  Image as ImageIcon,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  MoreHorizontal,
  Check,
  File,
  UserPlus,
  X,
} from 'lucide-react-native';
import { AnimatedButton, LoadingSpinner } from '@/components';
import { BillAmountInput } from '@/components/BillAmountInput';
import { ParticipantList } from '@/components/ParticipantList';
import { SplitResultDisplay } from '@/components/SplitResultDisplay';
import {
  calculateDetailedSplit,
  validateSplitInputs,
  SplitValidationError,
} from '@/lib/business/splitEngine';
import type { DetailedSplitResult } from '@/lib/business/splitEngine';
import { useBillStore, useSettingsStore, useKarzedaarsStore } from '@/stores';
import { BillStatus, PaymentStatus, ExpenseCategory } from '@/types';
import type { Bill, Participant } from '@/types';
import { useHaptics } from '@/hooks';
import { tokens } from '@/theme/ThemeProvider';
import type { AddVasoolyScreenProps } from '@/navigation/types';
import { sendPaymentRequestsToAll, isWhatsAppInstalled, showWhatsAppNotInstalledError } from '@/services/whatsappService';

interface ParticipantInput {
  id: string;
  name: string;
  phone?: string;
}

interface CategoryConfig {
  icon: typeof Utensils;
  color: string;
  bgColor: string;
  label: string;
}

const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  [ExpenseCategory.FOOD]: {
    icon: Utensils,
    color: tokens.colors.brand.primary,
    bgColor: `${tokens.colors.brand.primary}15`,
    label: 'Food & Drinks',
  },
  [ExpenseCategory.TRAVEL]: {
    icon: Car,
    color: tokens.colors.sage[500],
    bgColor: `${tokens.colors.sage[500]}15`,
    label: 'Travel',
  },
  [ExpenseCategory.SHOPPING]: {
    icon: ShoppingBag,
    color: tokens.colors.amber[500],
    bgColor: `${tokens.colors.amber[500]}15`,
    label: 'Shopping',
  },
  [ExpenseCategory.ENTERTAINMENT]: {
    icon: Film,
    color: '#8B5CF6',
    bgColor: '#8B5CF615',
    label: 'Entertainment',
  },
  [ExpenseCategory.OTHER]: {
    icon: MoreHorizontal,
    color: tokens.colors.text.secondary,
    bgColor: `${tokens.colors.text.secondary}15`,
    label: 'Other',
  },
};

export const AddVasoolyScreen: React.FC<AddVasoolyScreenProps> = ({ navigation, route }) => {
  const existingBill = route.params?.bill;
  const isEditMode = !!existingBill;

  const { createBill: createBillInStore, updateBill: updateBillInStore } = useBillStore();
  const { defaultUPIName, defaultVPA } = useSettingsStore();
  const { addOrUpdateKarzedaar, updateKarzedaarStats } = useKarzedaarsStore();
  const haptics = useHaptics();

  // Helper function to check if participant is the current user
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

  // State
  const [billTitle, setBillTitle] = useState(existingBill?.title ?? '');
  const [amountPaise, setAmountPaise] = useState(existingBill?.totalAmountPaise ?? 0);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(
    existingBill?.category ?? ExpenseCategory.FOOD
  );
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantInput[]>(
    existingBill
      ? existingBill.participants.map((p: any) => ({ id: p.id, name: p.name }))
      : [{ id: 'default-1', name: defaultUPIName || 'You' }]
  );
  const [splitResult, setSplitResult] = useState<DetailedSplitResult | null>(null);
  const [amountError, setAmountError] = useState<string>('');
  const [participantError, setParticipantError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate split whenever amount or participants change
  useEffect(() => {
    setAmountError('');
    setParticipantError('');

    if (amountPaise === 0 || participants.length === 0) {
      setSplitResult(null);
      return;
    }

    const namedParticipants = participants.filter((p) => p.name.trim() !== '');

    if (namedParticipants.length === 0) {
      setSplitResult(null);
      return;
    }

    try {
      validateSplitInputs(amountPaise, namedParticipants);
      const result = calculateDetailedSplit(amountPaise, namedParticipants);
      setSplitResult(result);
    } catch (error) {
      setSplitResult(null);
      if (error instanceof SplitValidationError) {
        if (error.message.includes('amount')) {
          setAmountError(error.message);
        } else {
          setParticipantError(error.message);
        }
      }
    }
  }, [amountPaise, participants]);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      haptics.success();
      setReceiptPhoto(result.assets[0].uri);
    }
  }, [haptics]);

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      haptics.success();
      setReceiptPhoto(result.assets[0].uri);
    }
  }, [haptics]);

  const handleRemovePhoto = useCallback(() => {
    haptics.medium();
    setReceiptPhoto(null);
  }, [haptics]);

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        haptics.success();
        setReceiptPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  }, [haptics]);

  const handlePickFromContacts = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Contacts permission is needed to add participants');
      return;
    }

    try {
      const result = await Contacts.presentContactPickerAsync();
      if (result && result.name) {
        haptics.success();

        // Get phone number from contact if available
        const phoneNumber = result.phoneNumbers && result.phoneNumbers.length > 0
          ? result.phoneNumbers[0].number
          : undefined;

        const newParticipant: ParticipantInput = {
          id: `participant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: result.name,
          phone: phoneNumber,
        };
        setParticipants((prev) => [...prev, newParticipant]);
      }
    } catch (error) {
      console.error('Error picking contact:', error);
    }
  }, [haptics]);

  const handleSendPaymentRequests = useCallback(async (bill: Bill) => {
    // Check if UPI ID is configured
    if (!defaultVPA || !defaultUPIName) {
      Alert.alert(
        'UPI ID Required',
        'Please set up your UPI ID in Settings to send payment requests',
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

    // Get participants who need to pay (excluding current user)
    const pendingParticipants = bill.participants.filter(
      (p) => p.status === PaymentStatus.PENDING && !isCurrentUser(p.name)
    );

    if (pendingParticipants.length === 0) {
      Alert.alert(
        'No Pending Payments',
        'There are no participants who need to pay',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Send payment requests to all pending participants
      const result = await sendPaymentRequestsToAll(
        pendingParticipants,
        bill,
        defaultVPA,
        defaultUPIName
      );

      // Show results
      if (result.totalSent > 0) {
        haptics.success();
        Alert.alert(
          'Payment Requests Sent',
          `Successfully sent ${result.totalSent} payment request${result.totalSent > 1 ? 's' : ''} via WhatsApp!${
            result.totalFailed > 0 ? `\n\n${result.totalFailed} request${result.totalFailed > 1 ? 's' : ''} failed.` : ''
          }`,
          [{ text: 'OK' }]
        );
      } else {
        haptics.warning();
        Alert.alert(
          'Failed to Send',
          'Could not send payment requests. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      haptics.error();
      Alert.alert(
        'Error',
        'Failed to send payment requests. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error sending payment requests:', error);
    }
  }, [defaultVPA, defaultUPIName, isCurrentUser, haptics]);

  const handleSaveBill = async () => {
    // Validation
    if (!billTitle.trim()) {
      haptics.warning();
      Alert.alert('Missing Title', 'Please enter a bill title');
      return;
    }

    if (amountPaise === 0) {
      haptics.warning();
      Alert.alert('Invalid Amount', 'Please enter a bill amount');
      return;
    }

    if (!splitResult) {
      haptics.warning();
      Alert.alert('Invalid Split', 'Please ensure amount and participants are valid');
      return;
    }

    const validParticipants = participants.filter((p) => p.name.trim() !== '');

    if (validParticipants.length < 2) {
      haptics.warning();
      Alert.alert('Not Enough Participants', 'Please add at least 2 participants');
      return;
    }

    haptics.medium();
    setIsSaving(true);

    try {
      const now = new Date();
      const timestamp = Date.now();

      // Map split result to Participant objects
      const participantData: Participant[] = splitResult.splits.map((split, index) => {
        const existingParticipant =
          isEditMode && existingBill
            ? existingBill.participants.find((p: any) => p.name === split.participantName)
            : undefined;

        // Find phone from current participants input
        const participantInput = participants.find(
          (p) => p.name === split.participantName
        );

        let paymentStatus: PaymentStatus;
        if (isCurrentUser(split.participantName)) {
          paymentStatus = PaymentStatus.PAID;
        } else {
          paymentStatus = existingParticipant?.status || PaymentStatus.PENDING;
        }

        return {
          id: existingParticipant?.id || `participant-${timestamp}-${index}`,
          name: split.participantName,
          amountPaise: split.amountPaise,
          status: paymentStatus,
          phone: participantInput?.phone || existingParticipant?.phone,
        };
      });

      if (isEditMode && existingBill) {
        const updatedBill: Bill = {
          ...existingBill,
          title: billTitle.trim(),
          totalAmountPaise: amountPaise,
          participants: participantData,
          category: selectedCategory,
          receiptPhoto: receiptPhoto || undefined,
          updatedAt: now,
        };

        await updateBillInStore(updatedBill);
        haptics.success();
        navigation.goBack();
      } else {
        const billId = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const newBill: Bill = {
          id: billId,
          title: billTitle.trim(),
          totalAmountPaise: amountPaise,
          status: BillStatus.ACTIVE,
          participants: participantData,
          category: selectedCategory,
          receiptPhoto: receiptPhoto || undefined,
          createdAt: now,
          updatedAt: now,
        };

        await createBillInStore(newBill);

        // Auto-add all participants to karzedaars (except current user)
        for (const participant of participantData) {
          // Add participant as karzedaar (store will filter out current user as safety check)
          await addOrUpdateKarzedaar(participant.name, participant.phone, defaultUPIName || undefined);
          // Update karzedaar stats with their split amount (only if not current user)
          if (!isCurrentUser(participant.name)) {
            await updateKarzedaarStats(participant.name, participant.amountPaise, true);
          }
        }

        haptics.success();

        // Show confirmation dialog to send payment requests via WhatsApp
        const pendingCount = participantData.filter(
          (p) => p.status === PaymentStatus.PENDING && !isCurrentUser(p.name)
        ).length;

        if (pendingCount > 0) {
          Alert.alert(
            'Send Payment Requests?',
            `Send payment requests via WhatsApp to ${pendingCount} friend${pendingCount > 1 ? 's' : ''}?`,
            [
              {
                text: 'Skip',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Send Now',
                onPress: async () => {
                  await handleSendPaymentRequests(newBill);
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      haptics.error();
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} bill`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSaveBill =
    billTitle.trim() !== '' && amountPaise > 0 && splitResult !== null && !isSaving;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.base} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Vasooly' : "Let's Vasooly!"}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <X size={24} color={tokens.colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
            {/* Bill Title */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Title</Text>
              <View style={styles.titleInputContainer}>
                <FileText size={20} color={tokens.colors.text.secondary} strokeWidth={2} />
                <TextInput
                  style={styles.titleInput}
                  value={billTitle}
                  onChangeText={setBillTitle}
                  placeholder="e.g., Dinner at Taj, Movie tickets..."
                  placeholderTextColor={tokens.colors.text.tertiary}
                />
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryList}>
                  {Object.entries(CATEGORIES).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedCategory === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.categoryChip,
                          { backgroundColor: isSelected ? config.bgColor : tokens.colors.background.input },
                        ]}
                        onPress={() => {
                          haptics.light();
                          setSelectedCategory(key as ExpenseCategory);
                        }}
                        activeOpacity={0.7}
                      >
                        <Icon size={18} color={config.color} strokeWidth={2} />
                        <Text
                          style={[
                            styles.categoryLabel,
                            { color: isSelected ? config.color : tokens.colors.text.secondary },
                          ]}
                        >
                          {config.label}
                        </Text>
                        {isSelected && (
                          <Check size={16} color={config.color} strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <BillAmountInput
                amount={amountPaise}
                onAmountChange={setAmountPaise}
                error={amountError}
              />
            </View>

            {/* Receipt Photo Upload */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Receipt (Optional)</Text>
              {receiptPhoto ? (
                <View style={styles.photoPreviewContainer}>
                  {receiptPhoto.endsWith('.pdf') ? (
                    <View style={styles.pdfPreview}>
                      <File size={48} color={tokens.colors.text.secondary} strokeWidth={1.5} />
                      <Text style={styles.pdfPreviewText}>PDF Receipt</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: receiptPhoto }} style={styles.photoPreview} />
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={tokens.colors.text.inverse} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoButtons}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                  >
                    <Camera size={20} color={tokens.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.photoButtonText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={handlePickPhoto}
                    activeOpacity={0.7}
                  >
                    <ImageIcon size={20} color={tokens.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.photoButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={handlePickDocument}
                    activeOpacity={0.7}
                  >
                    <File size={20} color={tokens.colors.text.secondary} strokeWidth={2} />
                    <Text style={styles.photoButtonText}>PDF</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Participant List */}
            <View style={styles.section}>
              <ParticipantList
                participants={participants}
                onParticipantsChange={setParticipants}
                minParticipants={2}
                error={participantError}
                showManualAdd={false}
                currentUserName={defaultUPIName || 'You'}
              />

              {/* Add Participant Actions */}
              <View style={styles.addParticipantActions}>
                <TouchableOpacity
                  style={styles.addFromContactsButton}
                  onPress={handlePickFromContacts}
                  activeOpacity={0.8}
                >
                  <UserPlus size={20} color={tokens.colors.text.inverse} strokeWidth={2.5} />
                  <Text style={styles.addFromContactsText}>Add from Contacts</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Split Result Display */}
            <View style={styles.section}>
              <SplitResultDisplay splitResult={splitResult} />
            </View>
          </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button - Fixed at bottom above tab bar */}
      <View style={styles.footer}>
        <AnimatedButton
          style={[styles.saveButton, !canSaveBill && styles.saveButtonDisabled]}
          onPress={handleSaveBill}
          disabled={!canSaveBill}
          haptic
          hapticIntensity="medium"
        >
          <View style={styles.saveButtonContent}>
            {isSaving && <LoadingSpinner size={20} color={tokens.colors.text.inverse} />}
            <Text style={styles.saveButtonText}>
              {isSaving
                ? isEditMode
                  ? 'Updating...'
                  : 'Saving...'
                : isEditMode
                  ? 'Update Vasooly'
                  : 'Add Vasooly!'}
            </Text>
          </View>
        </AnimatedButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 52,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.subtle,
  },
  headerTitle: {
    fontSize: tokens.typography.h2.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: 170, // Extra space for fixed footer button + tab bar
  },
  section: {
    marginBottom: tokens.spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  addParticipantActions: {
    marginTop: 12,
  },
  addFromContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: tokens.colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addFromContactsText: {
    fontSize: 14,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  titleInput: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.text.primary,
    fontWeight: '500',
    padding: 0,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingVertical: 14,
  },
  photoButtonText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  pdfPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: tokens.colors.background.input,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  pdfPreviewText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 96, // Position above tab bar with padding (tab bar ~88px + 8px gap)
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: 12,
    backgroundColor: tokens.colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
    zIndex: 999,
    elevation: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.amber[500],
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: tokens.colors.amber[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: tokens.colors.border.medium,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
