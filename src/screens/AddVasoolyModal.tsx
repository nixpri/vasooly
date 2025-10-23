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
  Modal,
  Platform,
  Dimensions,
  Pressable,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Contacts from 'expo-contacts';
import {
  X,
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

interface ParticipantInput {
  id: string;
  name: string;
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

interface AddVasoolyModalProps {
  isVisible: boolean;
  onClose: () => void;
  existingBill?: Bill;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 100;

export const AddVasoolyModal: React.FC<AddVasoolyModalProps> = ({
  isVisible,
  onClose,
  existingBill,
}) => {
  const isEditMode = !!existingBill;
  const { createBill: createBillInStore, updateBill: updateBillInStore } = useBillStore();
  const { defaultUPIName } = useSettingsStore();
  const { addOrUpdateKarzedaar, updateKarzedaarStats } = useKarzedaarsStore();
  const haptics = useHaptics();

  // Animation values for bottom sheet
  const translateY = useSharedValue(BOTTOM_SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const bottomSheetHeight = useSharedValue(BOTTOM_SHEET_HEIGHT);

  // Helper function to check if participant is the current user
  const isCurrentUser = (participantName: string): boolean => {
    if (!defaultUPIName) return false;
    return participantName.toLowerCase() === defaultUPIName.toLowerCase();
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
      ? existingBill.participants.map((p) => ({ id: p.id, name: p.name }))
      : [{ id: 'default-1', name: defaultUPIName || 'You' }]
  );
  const [splitResult, setSplitResult] = useState<DetailedSplitResult | null>(null);
  const [amountError, setAmountError] = useState<string>('');
  const [participantError, setParticipantError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard listeners to dynamically resize bottom sheet when keyboard appears
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        // Shrink bottom sheet to fit available space
        bottomSheetHeight.value = withTiming(SCREEN_HEIGHT - keyboardHeight, { duration: 250 });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        // Restore bottom sheet to original height
        bottomSheetHeight.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Animate bottom sheet open/close
  useEffect(() => {
    if (isVisible) {
      // Animate in
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      // Animate out
      translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  // Reset form state when modal opens for a new bill
  useEffect(() => {
    if (isVisible && !existingBill) {
      setBillTitle('');
      setAmountPaise(0);
      setSelectedCategory(ExpenseCategory.FOOD);
      setReceiptPhoto(null);
      setParticipants([{ id: 'default-1', name: defaultUPIName || 'You' }]);
      setSplitResult(null);
      setAmountError('');
      setParticipantError('');
    }
  }, [isVisible, existingBill, defaultUPIName]);

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

  // Gesture handler for swipe-to-dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // Dismiss if swiped down past threshold or with sufficient velocity
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 500) {
        translateY.value = withTiming(BOTTOM_SHEET_HEIGHT, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        runOnJS(onClose)();
      } else {
        // Snap back to top
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  // Animated styles
  const bottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bottomSheetHeightStyle = useAnimatedStyle(() => ({
    height: bottomSheetHeight.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

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
        const newParticipant: ParticipantInput = {
          id: `participant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: result.name,
        };
        setParticipants((prev) => [...prev, newParticipant]);
      }
    } catch (error) {
      console.error('Error picking contact:', error);
    }
  }, [haptics]);

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
            ? existingBill.participants.find((p) => p.name === split.participantName)
            : undefined;

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
          phone: existingParticipant?.phone,
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
        onClose();
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
          if (!isCurrentUser(participant.name)) {
            // Add participant as karzedaar
            await addOrUpdateKarzedaar(participant.name, participant.phone);
            // Update karzedaar stats with their split amount
            await updateKarzedaarStats(participant.name, participant.amountPaise, true);
          }
        }

        haptics.success();
        onClose();
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
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalOverlay}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.bottomSheet, bottomSheetStyle, bottomSheetHeightStyle]}>
          {/* Drag Handle */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
          </GestureDetector>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Edit Vasooly' : "Let's Vasooly!"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={tokens.colors.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: keyboardHeight > 0 ? keyboardHeight : tokens.spacing.xl }]}
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
              <>
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
                </View>
                <TouchableOpacity
                  style={styles.documentButton}
                  onPress={handlePickDocument}
                  activeOpacity={0.7}
                >
                  <File size={20} color={tokens.colors.text.secondary} strokeWidth={2} />
                  <Text style={styles.photoButtonText}>Upload PDF</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Participant List */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Split With</Text>
            <ParticipantList
              participants={participants}
              onParticipantsChange={setParticipants}
              minParticipants={2}
              error={participantError}
              showManualAdd={false}
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

          {/* Save Button */}
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
                    : 'Add Vasooly'}
              </Text>
            </View>
          </AnimatedButton>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // height is controlled by bottomSheetHeightStyle animation
    backgroundColor: tokens.colors.background.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetContent: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: tokens.colors.border.medium,
    borderRadius: 3,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 8,
    paddingBottom: tokens.spacing.md,
    backgroundColor: tokens.colors.background.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    // paddingBottom is controlled dynamically based on keyboard height
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
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingVertical: 14,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.subtle,
  },
  saveButton: {
    backgroundColor: tokens.colors.amber[500],
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: tokens.colors.amber[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    fontWeight: '700',
  },
});
