/**
 * AppNavigator - React Navigation Stack Navigator
 *
 * Main navigation structure for the app using @react-navigation/native-stack
 * with Reanimated-powered transitions.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  BillCreateScreen,
  BillHistoryScreen,
  BillDetailScreen,
  SettingsScreen,
} from '@/screens';
import type { Bill } from '@/types';
import { useBillStore, useHistoryStore, useSettingsStore } from '@/stores';
import { tokens } from '@/theme/ThemeProvider';

// Navigation types
export type RootStackParamList = {
  BillHistory: undefined;
  BillCreate: { bill?: Bill } | undefined;
  BillDetail: { billId: string };
  Settings: undefined;
};

export type BillHistoryScreenProps = StackScreenProps<RootStackParamList, 'BillHistory'>;
export type BillCreateScreenProps = StackScreenProps<RootStackParamList, 'BillCreate'>;
export type BillDetailScreenProps = StackScreenProps<RootStackParamList, 'BillDetail'>;
export type SettingsScreenProps = StackScreenProps<RootStackParamList, 'Settings'>;

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { loadAllBills } = useBillStore();
  const { loadBills } = useHistoryStore();
  const { loadSettings } = useSettingsStore();

  // Load initial data on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        await Promise.all([
          loadAllBills(),
          loadBills(),
          loadSettings(),
        ]);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };

    initializeStores();
  }, [loadAllBills, loadBills, loadSettings]);

  // Earthen theme for navigation
  const navigationTheme = {
    dark: false,
    colors: {
      primary: tokens.colors.brand.primary,
      background: tokens.colors.background.base,
      card: tokens.colors.background.base,
      text: tokens.colors.text.primary,
      border: tokens.colors.border.subtle,
      notification: tokens.colors.brand.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as '900',
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="BillHistory"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyle: { backgroundColor: tokens.colors.background.base },
        }}
      >
        <Stack.Screen
          name="BillHistory"
          component={BillHistoryScreen}
          options={{
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
            detachPreviousScreen: false,
          }}
        />
        <Stack.Screen
          name="BillCreate"
          component={BillCreateScreen}
          options={{
            presentation: 'modal',
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />
        <Stack.Screen
          name="BillDetail"
          component={BillDetailScreen}
          options={{
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            }),
            cardOverlayEnabled: true,
            cardStyle: { backgroundColor: tokens.colors.background.base },
            detachPreviousScreen: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'modal',
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
