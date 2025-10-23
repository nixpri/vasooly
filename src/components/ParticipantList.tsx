import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { tokens } from '@/theme/ThemeProvider';

interface ParticipantInput {
  id: string;
  name: string;
}

interface ParticipantListProps {
  participants: ParticipantInput[];
  onParticipantsChange: (participants: ParticipantInput[]) => void;
  minParticipants?: number;
  error?: string;
  showManualAdd?: boolean;
}

/**
 * ParticipantList - Component for managing bill participants
 * Allows adding, removing, and editing participant names
 */
export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  onParticipantsChange,
  minParticipants = 2,
  error,
  showManualAdd = true,
}) => {
  const [newParticipantName, setNewParticipantName] = useState('');

  const handleAddParticipant = () => {
    const trimmedName = newParticipantName.trim();
    if (trimmedName === '') return;

    // Check for duplicate names
    const isDuplicate = participants.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      // Could show error, but for now just ignore
      return;
    }

    const newParticipant: ParticipantInput = {
      id: `participant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: trimmedName,
    };

    onParticipantsChange([...participants, newParticipant]);
    setNewParticipantName('');
  };

  const handleRemoveParticipant = (id: string) => {
    // Enforce minimum participants
    if (participants.length <= minParticipants) return;

    onParticipantsChange(participants.filter((p) => p.id !== id));
  };

  const handleUpdateParticipantName = (id: string, newName: string) => {
    onParticipantsChange(
      participants.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>Participants</Text>
        <Text style={styles.count}>
          {participants.length} {participants.length === 1 ? 'person' : 'people'}
        </Text>
      </View>

      {/* Participant List */}
      <ScrollView style={styles.listContainer} nestedScrollEnabled>
        {participants.map((participant, index) => (
          <View key={participant.id} style={styles.participantRow}>
            <View style={styles.participantInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {participant.name.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <TextInput
                style={styles.participantNameInput}
                value={participant.name}
                onChangeText={(text) =>
                  handleUpdateParticipantName(participant.id, text)
                }
                placeholder={`Person ${index + 1}`}
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            {participants.length > minParticipants && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveParticipant(participant.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Add Participant Input - Only show if showManualAdd is true */}
      {showManualAdd && (
        <>
          <View style={styles.addParticipantContainer}>
            <TextInput
              style={styles.addInput}
              value={newParticipantName}
              onChangeText={setNewParticipantName}
              placeholder="Add participant name..."
              placeholderTextColor={tokens.colors.text.tertiary}
              returnKeyType="done"
              onSubmitEditing={handleAddParticipant}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                newParticipantName.trim() === '' && styles.addButtonDisabled,
              ]}
              onPress={handleAddParticipant}
              disabled={newParticipantName.trim() === ''}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Participant limit hint */}
          {participants.length <= minParticipants && (
            <Text style={styles.hintText}>
              Minimum {minParticipants} participants required
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    fontWeight: '400',
  },
  listContainer: {
    maxHeight: 200,
    marginBottom: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.brand.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    color: tokens.colors.brand.primary,
    fontWeight: '600',
  },
  participantNameInput: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.text.primary,
    fontWeight: '400',
    padding: 0,
  },
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tokens.colors.error.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    fontSize: 16,
    color: tokens.colors.error.main,
    fontWeight: '600',
  },
  addParticipantContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  addInput: {
    flex: 1,
    backgroundColor: tokens.colors.background.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: tokens.colors.text.primary,
  },
  addButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: tokens.colors.border.medium,
  },
  addButtonText: {
    fontSize: 13,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.error.main,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 11,
    color: tokens.colors.text.tertiary,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
