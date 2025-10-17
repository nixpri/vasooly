import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
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
import { createBill } from '@/lib/data/billRepository';
import { BillStatus, PaymentStatus } from '@/types';
import type { Bill, Participant } from '@/types';

interface ParticipantInput {
  id: string;
  name: string;
}

/**
 * BillCreateScreen - Main screen for creating bills with split calculations
 * Integrates amount input, participant management, and split display
 */
export const BillCreateScreen: React.FC = () => {
  // State
  const [billTitle, setBillTitle] = useState('');
  const [amountPaise, setAmountPaise] = useState(0);
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { id: 'default-1', name: 'You' },
  ]);
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

  const handleCreateBill = async () => {
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
      // Map split result to Participant objects
      const participantData: Participant[] = splitResult.splits.map(
        (split) => ({
          id: split.participantId,
          name: split.participantName,
          amountPaise: split.amountPaise,
          status: PaymentStatus.PENDING,
          phone: undefined,
        })
      );

      // Create bill in database
      const billId = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date();

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
              // Reset form
              setBillTitle('');
              setAmountPaise(0);
              setParticipants([
                { id: `reset-1-${Date.now()}`, name: 'You' },
              ]);
              setSplitResult(null);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create bill'
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Bill</Text>
          <Text style={styles.headerSubtitle}>
            Split your bill with friends
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            onPress={handleCreateBill}
            disabled={!canCreateBill}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {isSaving ? 'Creating...' : 'Create Bill & Generate UPI Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: 'rgba(20, 20, 30, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '500',
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0,
  },
  footer: {
    padding: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
