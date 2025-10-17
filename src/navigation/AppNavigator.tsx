import React, { useState, useCallback } from 'react';
import {
  BillCreateScreen,
  BillHistoryScreen,
  BillDetailScreen,
} from '@/screens';
import { deleteBill, duplicateBill } from '@/lib/data/billRepository';
import type { Bill } from '@/types';
import { Alert } from 'react-native';

type Screen = 'history' | 'create' | 'detail' | 'edit';

interface NavigationState {
  screen: Screen;
  params?: {
    bill?: Bill;
  };
}

export const AppNavigator: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({
    screen: 'create', // Start with create screen for MVP
  });

  const navigateTo = useCallback((screen: Screen, params?: { bill?: Bill }) => {
    setNavState({ screen, params });
  }, []);

  const handleBillCreated = useCallback(() => {
    // After creating a bill, go to history
    navigateTo('history');
  }, [navigateTo]);

  const handleBillPress = useCallback(
    (bill: Bill) => {
      navigateTo('detail', { bill });
    },
    [navigateTo]
  );

  const handleEdit = useCallback(
    (bill: Bill) => {
      navigateTo('edit', { bill });
    },
    [navigateTo]
  );

  const handleDelete = useCallback(
    async (bill: Bill) => {
      Alert.alert(
        'Delete Bill',
        `Are you sure you want to delete "${bill.title}"? This action can be undone later.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteBill(bill.id);
                Alert.alert('Success', 'Bill deleted successfully', [
                  { text: 'OK', onPress: () => navigateTo('history') },
                ]);
              } catch (error) {
                console.error('Failed to delete bill:', error);
                Alert.alert('Error', 'Failed to delete bill. Please try again.');
              }
            },
          },
        ]
      );
    },
    [navigateTo]
  );

  const handleDuplicate = useCallback(
    async (bill: Bill) => {
      try {
        const newBillId = `bill-${Date.now()}`;
        const newParticipantIds = bill.participants.map((_, i) => `participant-${Date.now()}-${i}`);

        const duplicatedBill = await duplicateBill(bill.id, newBillId, newParticipantIds);

        Alert.alert('Success', 'Bill duplicated successfully', [
          {
            text: 'View',
            onPress: () => navigateTo('detail', { bill: duplicatedBill }),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
      } catch (error) {
        console.error('Failed to duplicate bill:', error);
        Alert.alert('Error', 'Failed to duplicate bill. Please try again.');
      }
    },
    [navigateTo]
  );

  const handleBillUpdate = useCallback((updatedBill: Bill) => {
    // Update the current bill in navigation state
    setNavState((prev) => ({
      ...prev,
      params: { bill: updatedBill },
    }));
  }, []);

  const handleBillEdited = useCallback(() => {
    // After editing, go back to history
    navigateTo('history');
  }, [navigateTo]);

  // Render current screen
  switch (navState.screen) {
    case 'history':
      return (
        <BillHistoryScreen
          onBillPress={handleBillPress}
          onCreatePress={() => navigateTo('create')}
        />
      );

    case 'create':
      return <BillCreateScreen onSuccess={handleBillCreated} onViewHistory={() => navigateTo('history')} />;

    case 'detail':
      if (!navState.params?.bill) {
        navigateTo('history');
        return null;
      }
      return (
        <BillDetailScreen
          bill={navState.params.bill}
          onBack={() => navigateTo('history')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onBillUpdate={handleBillUpdate}
        />
      );

    case 'edit':
      if (!navState.params?.bill) {
        navigateTo('history');
        return null;
      }
      return (
        <BillCreateScreen
          existingBill={navState.params.bill}
          onSuccess={handleBillEdited}
          onCancel={() => navigateTo('detail', { bill: navState.params!.bill! })}
        />
      );

    default:
      return <BillCreateScreen onSuccess={handleBillCreated} />;
  }
};
