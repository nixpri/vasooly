import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { rupeesToPaise } from '@/lib/business/splitEngine';

interface BillAmountInputProps {
  amount: number; // in paise
  onAmountChange: (paise: number) => void;
  error?: string;
}

/**
 * BillAmountInput - Component for entering bill amounts
 * Handles rupee to paise conversion and validation
 */
export const BillAmountInput: React.FC<BillAmountInputProps> = ({
  amount,
  onAmountChange,
  error,
}) => {
  // Display value in rupees (convert from paise)
  const [displayValue, setDisplayValue] = useState(
    amount > 0 ? (amount / 100).toFixed(2) : ''
  );

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;

    setDisplayValue(formatted);

    // Convert to paise and notify parent
    if (formatted === '' || formatted === '.') {
      onAmountChange(0);
    } else {
      const rupees = parseFloat(formatted);
      if (!isNaN(rupees) && rupees >= 0) {
        try {
          const paise = rupeesToPaise(rupees);
          onAmountChange(paise);
        } catch {
          // Invalid amount, keep display but don't update paise
        }
      }
    }
  };

  // Quick amount buttons for common values
  const quickAmounts = [100, 500, 1000, 2000];

  const handleQuickAmount = (rupees: number) => {
    setDisplayValue(rupees.toFixed(2));
    onAmountChange(rupeesToPaise(rupees));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bill Amount</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={displayValue}
          onChangeText={handleAmountChange}
          placeholder="0.00"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          keyboardType="decimal-pad"
          autoFocus
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Quick amount buttons */}
      <View style={styles.quickAmountContainer}>
        {quickAmounts.map((rupees) => (
          <TouchableOpacity
            key={rupees}
            style={styles.quickButton}
            onPress={() => handleQuickAmount(rupees)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickButtonText}>₹{rupees}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '600',
    padding: 0,
  },
  inputError: {
    color: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
    marginLeft: 4,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});
