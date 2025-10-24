/**
 * AppNavigator - Hybrid Navigation (Bottom Tabs + Stack)
 *
 * Main navigation structure for the app using:
 * - Bottom tabs for main sections (Home, Activity, Friends, Profile)
 * - Stack navigators within each tab for screen hierarchy
 * - Modal presentation for Add Expense
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  ActivityScreen,
  VasoolyDetailScreen,
  SettingsScreen,
  OnboardingScreen,
  DashboardScreen,
  KarzedaarsListScreen,
  KarzedaarDetailScreen,
  SettleUpScreen,
  ProfileScreen,
  AddVasoolyScreen,
  InsightsScreen,
} from '@/screens';
import { TabBar } from '@/components/TabBar';
import { useBillStore, useHistoryStore, useSettingsStore } from '@/stores';
import { tokens } from '@/theme/ThemeProvider';
import type {
  RootStackParamList,
  TabParamList,
  HomeStackParamList,
  ActivityStackParamList,
  InsightsStackParamList,
  KarzedaarsStackParamList,
  ProfileStackParamList,
} from './types';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ActivityStack = createStackNavigator<ActivityStackParamList>();
const InsightsStack = createStackNavigator<InsightsStackParamList>();
const KarzedaarsStack = createStackNavigator<KarzedaarsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

/**
 * Home Stack Navigator
 *
 * Dashboard → Bill Detail
 */
const HomeNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: tokens.colors.background.base },
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen
        name="VasoolyDetail"
        component={VasoolyDetailScreen}
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
        }}
      />
      <HomeStack.Screen
        name="AddVasooly"
        component={AddVasoolyScreen}
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
    </HomeStack.Navigator>
  );
};

/**
 * Activity Stack Navigator
 *
 * Activity Feed → Bill Detail
 */
const ActivityNavigator: React.FC = () => {
  return (
    <ActivityStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: tokens.colors.background.base },
      }}
    >
      <ActivityStack.Screen
        name="ActivityScreen"
        component={ActivityScreen}
        options={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />
      <ActivityStack.Screen
        name="VasoolyDetail"
        component={VasoolyDetailScreen}
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
        }}
      />
    </ActivityStack.Navigator>
  );
};

/**
 * Insights Stack Navigator
 *
 * Single screen for analytics and insights
 */
const InsightsNavigator: React.FC = () => {
  return (
    <InsightsStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: tokens.colors.background.base },
      }}
    >
      <InsightsStack.Screen name="InsightsScreen" component={InsightsScreen} />
    </InsightsStack.Navigator>
  );
};

/**
 * Karzedaars Stack Navigator
 *
 * Karzedaars List → Karzedaar Detail → Settle Up
 */
const KarzedaarsNavigator: React.FC = () => {
  return (
    <KarzedaarsStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: tokens.colors.background.base },
      }}
    >
      <KarzedaarsStack.Screen name="KarzedaarsList" component={KarzedaarsListScreen} />
      <KarzedaarsStack.Screen
        name="KarzedaarDetail"
        component={KarzedaarDetailScreen}
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
        }}
      />
      <KarzedaarsStack.Screen
        name="SettleUp"
        component={SettleUpScreen}
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
        }}
      />
    </KarzedaarsStack.Navigator>
  );
};

/**
 * Profile Stack Navigator
 *
 * Profile → Settings
 */
const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: tokens.colors.background.base },
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
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
        }}
      />
    </ProfileStack.Navigator>
  );
};

/**
 * Main Tab Navigator
 *
 * 5 tabs: Home, Activity, Insights, Karzedaars, Profile
 */
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root screen if already on this tab
            const state = navigation.getState();
            const route = state.routes.find((r) => r.name === 'Home');
            if (route?.state?.index && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate('Home', { screen: 'Dashboard' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root screen if already on this tab
            const state = navigation.getState();
            const route = state.routes.find((r) => r.name === 'Activity');
            if (route?.state?.index && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate('Activity', { screen: 'ActivityScreen' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root screen if already on this tab
            const state = navigation.getState();
            const route = state.routes.find((r) => r.name === 'Insights');
            if (route?.state?.index && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate('Insights', { screen: 'InsightsScreen' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Karzedaars"
        component={KarzedaarsNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root screen if already on this tab
            const state = navigation.getState();
            const route = state.routes.find((r) => r.name === 'Karzedaars');
            if (route?.state?.index && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate('Karzedaars', { screen: 'KarzedaarsList' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root screen if already on this tab
            const state = navigation.getState();
            const route = state.routes.find((r) => r.name === 'Profile');
            if (route?.state?.index && route.state.index > 0) {
              e.preventDefault();
              navigation.navigate('Profile', { screen: 'ProfileScreen' });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { loadAllBills } = useBillStore();
  const { loadBills } = useHistoryStore();
  const { loadSettings, onboardingCompleted } = useSettingsStore();

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
      <RootStack.Navigator
        initialRouteName={onboardingCompleted ? 'MainTabs' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyle: { backgroundColor: tokens.colors.background.base },
        }}
      >
        {/* Onboarding Screen */}
        <RootStack.Screen
          name="Onboarding"
          options={{
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
            gestureEnabled: false,
          }}
        >
          {({ navigation }) => (
            <OnboardingScreen onComplete={() => navigation.replace('MainTabs')} />
          )}
        </RootStack.Screen>

        {/* Main Tab Navigator (5 tabs with stacks) */}
        <RootStack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
