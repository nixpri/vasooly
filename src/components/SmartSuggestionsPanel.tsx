/**
 * Smart Suggestions Panel
 *
 * Shows intelligent participant suggestions:
 * - "Same as last time" option
 * - Recent participants
 * - Frequent participants
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Users, Clock, TrendingUp, Sparkles } from 'lucide-react-native';
import type { ParticipantSuggestion } from '@/hooks/useSmartSuggestions';
import { tokens } from '@/theme/ThemeProvider';

interface ParticipantInput {
  id: string;
  name: string;
  phone?: string;
}

interface SmartSuggestionsPanelProps {
  recentParticipants: ParticipantSuggestion[];
  frequentParticipants: ParticipantSuggestion[];
  lastBillParticipants: ParticipantSuggestion[];
  hasLastBill: boolean;
  currentParticipants: ParticipantInput[];
  onAddSuggestion: (name: string, phone?: string) => void;
  onUseSameAsLastTime: () => void;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  recentParticipants,
  frequentParticipants,
  lastBillParticipants,
  hasLastBill,
  currentParticipants,
  onAddSuggestion,
  onUseSameAsLastTime,
}) => {
  // Check if a participant is already added
  const isAlreadyAdded = (name: string) => {
    return currentParticipants.some(
      p => p.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // Show "Same as last time" if we have last bill participants
  const showSameAsLastTime = hasLastBill && lastBillParticipants.length > 0;

  // Filter suggestions to exclude already added participants
  const availableRecent = recentParticipants.filter(s => !isAlreadyAdded(s.name));
  const availableFrequent = frequentParticipants.filter(s => !isAlreadyAdded(s.name));

  // Don't show panel if no suggestions available
  if (!showSameAsLastTime && availableRecent.length === 0 && availableFrequent.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color={tokens.colors.brand.primary} strokeWidth={2} />
        <Text style={styles.headerText}>Smart Suggestions</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.suggestionsRow}>
          {/* Same as last time button */}
          {showSameAsLastTime && (
            <TouchableOpacity
              style={styles.sameAsLastButton}
              onPress={onUseSameAsLastTime}
              activeOpacity={0.7}
            >
              <Users size={16} color={tokens.colors.brand.primary} strokeWidth={2} />
              <Text style={styles.sameAsLastText}>Same as last time</Text>
              <Text style={styles.participantCount}>
                ({lastBillParticipants.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Recent participants */}
          {availableRecent.map((suggestion) => (
            <TouchableOpacity
              key={`recent-${suggestion.id}`}
              style={styles.suggestionChip}
              onPress={() => onAddSuggestion(suggestion.name, suggestion.phone)}
              activeOpacity={0.7}
            >
              <Clock size={14} color={tokens.colors.text.secondary} strokeWidth={2} />
              <Text style={styles.suggestionName}>{suggestion.name}</Text>
            </TouchableOpacity>
          ))}

          {/* Frequent participants (if different from recent) */}
          {availableFrequent
            .filter(f => !availableRecent.some(r => r.id === f.id))
            .map((suggestion) => (
              <TouchableOpacity
                key={`frequent-${suggestion.id}`}
                style={styles.suggestionChip}
                onPress={() => onAddSuggestion(suggestion.name, suggestion.phone)}
                activeOpacity={0.7}
              >
                <TrendingUp size={14} color={tokens.colors.sage[500]} strokeWidth={2} />
                <Text style={styles.suggestionName}>{suggestion.name}</Text>
                {suggestion.billCount && suggestion.billCount > 1 && (
                  <Text style={styles.billCountBadge}>
                    {suggestion.billCount}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sameAsLastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${tokens.colors.brand.primary}15`,
    borderWidth: 1.5,
    borderColor: tokens.colors.brand.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sameAsLastText: {
    fontSize: 13,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  participantCount: {
    fontSize: 11,
    color: tokens.colors.brand.primary,
    fontWeight: '500',
    opacity: 0.7,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.background.input,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestionName: {
    fontSize: 13,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  billCountBadge: {
    fontSize: 10,
    color: tokens.colors.text.tertiary,
    fontWeight: '600',
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 2,
  },
});
