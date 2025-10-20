import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
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
import { useBillStore } from '@/stores';
import { BillStatus, PaymentStatus } from '@/types';
import type { Bill, Participant } from '@/types';
import type { BillCreateScreenProps } from '@/navigation/AppNavigator';
import { useHaptics } from '@/hooks';

interface ParticipantInput {
  id: string;
  name: string;
}

/**
 * BillCreateScreen - Main screen for creating/editing bills with split calculations
 * Integrates amount input, participant management, and split display
 */
export const BillCreateScreen: React.FC<BillCreateScreenProps> = ({ route, navigation }) => {
  const existingBill = route.params?.bill;
  const isEditMode = !!existingBill;
  const { createBill: createBillInStore, updateBill: updateBillInStore } = useBillStore();
  const haptics = useHaptics();

  // Initialize state from existingBill if in edit mode
  const [billTitle, setBillTitle] = useState(existingBill?.title ?? '');
  const [amountPaise, setAmountPaise] = useState(existingBill?.totalAmountPaise ?? 0);
  const [participants, setParticipants] = useState<ParticipantInput[]>(
    existingBill
      ? existingBill.participants.map((p) => ({ id: p.id, name: p.name }))
      : [{ id: 'default-1', name: 'You' }]
  );
  const [splitResult, setSplitResult] = useState<DetailedSplitResult | null>(
    null
  );
  const [amountError, setAmountError] = useState<string>('');
  const [participantError, setParticipantError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate split whenever amount or participants change
  useEffect(() => {
    // Reset errors
    setAmountError('');
    setParticipantError('');

    // Don't calculate if amount is 0 or no participants
    if (amountPaise === 0 || participants.length === 0) {
      setSplitResult(null);
      return;
    }

    // Filter out participants with empty names for validation
    const namedParticipants = participants.filter(
      (p) => p.name.trim() !== ''
    );

    if (namedParticipants.length === 0) {
      setSplitResult(null);
      return;
    }

    try {
      // Validate inputs
      validateSplitInputs(amountPaise, namedParticipants);

      // Calculate split
      const result = calculateDetailedSplit(amountPaise, namedParticipants);
      setSplitResult(result);
    } catch (error) {
      setSplitResult(null);

      if (error instanceof SplitValidationError) {
        // Determine if it's an amount or participant error
        if (error.message.includes('amount')) {
          setAmountError(error.message);
        } else {
          setParticipantError(error.message);
        }
      }
    }
  }, [amountPaise, participants]);

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
      Alert.alert(
        'Invalid Split',
        'Please ensure amount and participants are valid'
      );
      return;
    }

    // Filter out empty participant names
    const validParticipants = participants.filter((p) => p.name.trim() !== '');

    if (validParticipants.length < 2) {
      haptics.warning();
      Alert.alert(
        'Not Enough Participants',
        'Please add at least 2 participants'
      );
      return;
    }

    haptics.medium(); // Haptic feedback for starting save
    setIsSaving(true);

    try {
      const now = new Date();
      const timestamp = Date.now();

      // Map split result to Participant objects
      // In edit mode, preserve payment status for existing participants
      const participantData: Participant[] = splitResult.splits.map(
        (split, index) => {
          // Find existing participant by name to preserve payment status
          const existingParticipant = isEditMode && existingBill
            ? existingBill.participants.find((p) => p.name === split.participantName)
            : undefined;

          return {
            id: existingParticipant?.id || `participant-${timestamp}-${index}`,
            name: split.participantName,
            amountPaise: split.amountPaise,
            status: existingParticipant?.status || PaymentStatus.PENDING,
            phone: existingParticipant?.phone,
          };
        }
      );

      if (isEditMode && existingBill) {
        // Update existing bill
        const updatedBill: Bill = {
          ...existingBill,
          title: billTitle.trim(),
          totalAmountPaise: amountPaise,
          participants: participantData,
          updatedAt: now,
        };

        await updateBillInStore(updatedBill); // Use updateBill for edit mode

        haptics.success(); // Success haptic
        // Success - navigate back
        navigation.goBack();
      } else {
        // Create new bill
        const billId = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const newBill: Bill = {
          id: billId,
          title: billTitle.trim(),
          totalAmountPaise: amountPaise,
          status: BillStatus.ACTIVE,
          participants: participantData,
          createdAt: now,
          updatedAt: now,
        };

        await createBillInStore(newBill); // Use createBill for new bills

        haptics.success(); // Success haptic
        // Success - navigate back to history
        navigation.goBack();
      }
    } catch (error) {
      haptics.error(); // Error haptic
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} bill`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canCreateBill =
    billTitle.trim() !== '' &&
    amountPaise > 0 &&
    splitResult !== null &&
    !isSaving;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← {isEditMode ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{isEditMode ? 'Edit Bill' : 'Create Bill'}</Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode ? 'Update bill details and participants' : 'Split your bill with friends'}
              </Text>
            </View>
          </View>
        </View>

        {/* KeyboardAvoidingView wraps only ScrollView */}
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior="padding"
        >
          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Bill Title Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bill Title</Text>
              <View style={styles.titleInputContainer}>
                <Text style={styles.titleIcon}>📝</Text>
                <TextInput
                  style={styles.titleInput}
                  value={billTitle}
                  onChangeText={setBillTitle}
                  placeholder="e.g., Dinner at Taj, Movie tickets..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <BillAmountInput
                amount={amountPaise}
                onAmountChange={setAmountPaise}
                error={amountError}
              />
            </View>

            {/* Participant List */}
            <View style={styles.section}>
              <ParticipantList
                participants={participants}
                onParticipantsChange={setParticipants}
                minParticipants={2}
                error={participantError}
              />
            </View>

            {/* Split Result Display */}
            <View style={styles.section}>
              <SplitResultDisplay splitResult={splitResult} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Create Bill Button - Outside KeyboardAvoidingView */}
        <View style={styles.footer}>
            <AnimatedButton
              style={[
                styles.createButton,
                !canCreateBill && styles.createButtonDisabled,
              ]}
              onPress={handleSaveBill}
              disabled={!canCreateBill}
              haptic
              hapticIntensity="medium"
            >
              <View style={styles.createButtonContent}>
                {isSaving && <LoadingSpinner size={18} color="#FFFFFF" />}
                <Text style={styles.createButtonText}>
                  {isSaving
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Update Bill'
                      : 'Create Bill'}
                </Text>
              </View>
            </AnimatedButton>
          </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  viewHistoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#6C5CE7',
    borderRadius: 6,
  },
  viewHistoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    fontWeight: '500',
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  titleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  titleInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  createButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
