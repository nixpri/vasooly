/**
 * Receipt Scanner Component
 *
 * Basic receipt scanning with camera integration:
 * - Camera capture
 * - Manual amount extraction (OCR placeholder for future enhancement)
 * - Amount correction flow
 *
 * Future enhancement: Integrate OCR library for automatic amount detection
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Check } from 'lucide-react-native';
import { tokens } from '@/theme/ThemeProvider';
import { useHaptics } from '@/hooks';

interface ReceiptScannerProps {
  onScanComplete: (amountPaise: number, receiptUri: string) => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onScanComplete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedUri, setScannedUri] = useState<string | null>(null);
  const [extractedAmount, setExtractedAmount] = useState('');
  const haptics = useHaptics();

  const handleStartScan = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to scan receipts');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Don't edit for receipt scanning
      quality: 1.0, // High quality for better OCR (future)
    });

    if (!result.canceled && result.assets[0]) {
      setScannedUri(result.assets[0].uri);
      setIsModalVisible(true);
      haptics.success();

      // TODO: Future enhancement - implement actual OCR here
      // For now, user will manually enter the amount
    }
  }, [haptics]);

  const handleConfirmAmount = useCallback(() => {
    const amount = parseFloat(extractedAmount);

    if (isNaN(amount) || amount <= 0) {
      haptics.warning();
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!scannedUri) {
      return;
    }

    const amountPaise = Math.round(amount * 100);
    haptics.success();
    onScanComplete(amountPaise, scannedUri);

    // Reset state
    setIsModalVisible(false);
    setScannedUri(null);
    setExtractedAmount('');
  }, [extractedAmount, scannedUri, onScanComplete, haptics]);

  const handleCancel = useCallback(() => {
    haptics.light();
    setIsModalVisible(false);
    setScannedUri(null);
    setExtractedAmount('');
  }, [haptics]);

  return (
    <>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleStartScan}
        activeOpacity={0.7}
      >
        <Camera size={20} color={tokens.colors.brand.primary} strokeWidth={2} />
        <Text style={styles.scanButtonText}>Scan Receipt</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Receipt Amount</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <X size={24} color={tokens.colors.text.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.instructionText}>
              Receipt captured! Please enter the total amount:
            </Text>

            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={extractedAmount}
                onChangeText={setExtractedAmount}
                placeholder="0.00"
                placeholderTextColor={tokens.colors.text.tertiary}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmAmount}
                activeOpacity={0.7}
              >
                <Check size={20} color={tokens.colors.text.inverse} strokeWidth={2.5} />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>
              💡 Tip: Future updates will include automatic amount detection!
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${tokens.colors.brand.primary}15`,
    borderWidth: 1.5,
    borderColor: tokens.colors.brand.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scanButtonText: {
    fontSize: 14,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: tokens.colors.background.elevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing['4xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.lg,
  },
  modalTitle: {
    fontSize: tokens.typography.h3.fontSize,
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  instructionText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.input,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.colors.brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: tokens.spacing.xl,
  },
  currencySymbol: {
    fontSize: 24,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    padding: 0,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: tokens.spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: tokens.colors.background.input,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  cancelButtonText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: tokens.colors.brand.primary,
    shadowColor: tokens.colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 14,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
