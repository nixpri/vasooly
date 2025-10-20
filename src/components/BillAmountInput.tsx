import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { rupeesToPaise } from '@/lib/business/splitEngine';
import { tokens } from '@/theme/ThemeProvider';

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
          placeholderTextColor={tokens.colors.text.tertiary}
          keyboardType="decimal-pad"
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
    fontSize: 13,
    color: tokens.colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 24,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    padding: 0,
  },
  inputError: {
    color: tokens.colors.error.main,
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.error.main,
    marginTop: 6,
    marginLeft: 4,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 6,
  },
  quickButton: {
    flex: 1,
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingVertical: 9,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
});
