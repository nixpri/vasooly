import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { BillAmountInput } from '@/components/BillAmountInput';
import { ParticipantList } from '@/components/ParticipantList';
import { SplitResultDisplay } from '@/components/SplitResultDisplay';
import {
  calculateDetailedSplit,
  validateSplitInputs,
  SplitValidationError,
} from '@/lib/business/splitEngine';
import type { DetailedSplitResult } from '@/lib/business/splitEngine';
import { createBill, updateBill } from '@/lib/data/billRepository';
import { BillStatus, PaymentStatus } from '@/types';
import type { Bill, Participant } from '@/types';

interface ParticipantInput {
  id: string;
  name: string;
}

interface BillCreateScreenProps {
  existingBill?: Bill; // If provided, edit mode
  onSuccess?: () => void; // Callback after create/edit
  onCancel?: () => void; // Callback for cancel in edit mode
  onViewHistory?: () => void; // Callback to view history
}

/**
 * BillCreateScreen - Main screen for creating/editing bills with split calculations
 * Integrates amount input, participant management, and split display
 */
export const BillCreateScreen: React.FC<BillCreateScreenProps> = ({
  existingBill,
  onSuccess,
  onCancel,
  onViewHistory,
}) => {
  const isEditMode = !!existingBill;

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
  const scrollViewRef = useRef<ScrollView>(null);

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
      Alert.alert('Missing Title', 'Please enter a bill title');
      return;
    }

    if (amountPaise === 0) {
      Alert.alert('Invalid Amount', 'Please enter a bill amount');
      return;
    }

    if (!splitResult) {
      Alert.alert(
        'Invalid Split',
        'Please ensure amount and participants are valid'
      );
      return;
    }

    // Filter out empty participant names
    const validParticipants = participants.filter((p) => p.name.trim() !== '');

    if (validParticipants.length < 2) {
      Alert.alert(
        'Not Enough Participants',
        'Please add at least 2 participants'
      );
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date();
      const timestamp = Date.now();

      // Map split result to Participant objects with NEW unique IDs
      const participantData: Participant[] = splitResult.splits.map(
        (split, index) => ({
          id: isEditMode && existingBill
            ? existingBill.participants[index]?.id || `participant-${timestamp}-${index}`
            : `participant-${timestamp}-${index}`,
          name: split.participantName,
          amountPaise: split.amountPaise,
          status: PaymentStatus.PENDING,
          phone: undefined,
        })
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

        await updateBill(updatedBill);

        // Success
        Alert.alert(
          'Bill Updated',
          `Bill "${updatedBill.title}" updated successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
              },
            },
          ]
        );
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

        await createBill(newBill);

        // Success
        Alert.alert(
          'Bill Created',
          `Bill "${newBill.title}" created successfully with ${newBill.participants.length} participants!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  // Reset form if no callback
                  setBillTitle('');
                  setAmountPaise(0);
                  setParticipants([
                    { id: `reset-1-${Date.now()}`, name: 'You' },
                  ]);
                  setSplitResult(null);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? -150 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      {/* Header */}
        <View style={styles.header}>
          {isEditMode && onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Cancel</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{isEditMode ? 'Edit Bill' : 'Create Bill'}</Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode ? 'Update bill details and participants' : 'Split your bill with friends'}
              </Text>
            </View>
            {!isEditMode && onViewHistory && (
              <TouchableOpacity
                onPress={onViewHistory}
                style={styles.viewHistoryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.viewHistoryButtonText}>History</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          enableOnAndroid={true}
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

        {/* Create Bill Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              !canCreateBill && styles.createButtonDisabled,
            ]}
            onPress={handleSaveBill}
            disabled={!canCreateBill}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {isSaving
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Bill'
                  : 'Create Bill & Generate UPI Link'}
            </Text>
          </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
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
    paddingBottom: Platform.OS === 'android' ? 300 : 20,
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
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
