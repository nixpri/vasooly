/**
 * Navigation Type Definitions
 *
 * Type-safe navigation structure for Vasooly app.
 * Uses hybrid navigation: Bottom Tabs + Stack Navigators for each tab.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { Bill } from '@/types';

/**
 * Bottom Tab Navigator Params
 *
 * 4 main tabs: Dashboard, Activity, Friends, Profile
 * Add Expense is modal presentation (not in tab bar)
 */
export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Activity: NavigatorScreenParams<ActivityStackParamList> | undefined;
  Friends: NavigatorScreenParams<FriendsStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/**
 * Home Stack Navigator Params
 *
 * Dashboard → Bill Detail
 */
export type HomeStackParamList = {
  Dashboard: undefined;
  BillDetail: { billId: string };
};

/**
 * Activity Stack Navigator Params
 *
 * Activity (renamed from BillHistory) → Bill Detail
 */
export type ActivityStackParamList = {
  ActivityScreen: undefined;
  BillDetail: { billId: string };
};

/**
 * Friends Stack Navigator Params
 *
 * Friends List → Friend Detail (placeholder for now)
 */
export type FriendsStackParamList = {
  FriendsList: undefined;
  // FriendDetail: { friendId: string };  // Week 13
};

/**
 * Profile Stack Navigator Params
 *
 * Profile → Settings
 */
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
};

/**
 * Root Navigator Params
 *
 * Contains onboarding, main tabs, and modal screens
 */
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  BillCreate: { bill?: Bill } | undefined;
};

/**
 * Screen Props Types
 */

// Onboarding
export type OnboardingScreenProps = StackScreenProps<RootStackParamList, 'Onboarding'>;

// Home Stack - Use composite props to enable navigation to root modals
export type DashboardScreenProps = StackScreenProps<HomeStackParamList, 'Dashboard'>;
export type HomeBillDetailScreenProps = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, 'BillDetail'>,
  StackScreenProps<RootStackParamList>
>;

// Activity Stack - Use composite props to enable navigation to root modals
export type ActivityScreenProps = CompositeScreenProps<
  StackScreenProps<ActivityStackParamList, 'ActivityScreen'>,
  StackScreenProps<RootStackParamList>
>;
export type ActivityBillDetailScreenProps = CompositeScreenProps<
  StackScreenProps<ActivityStackParamList, 'BillDetail'>,
  StackScreenProps<RootStackParamList>
>;

// Friends Stack
export type FriendsListScreenProps = StackScreenProps<FriendsStackParamList, 'FriendsList'>;

// Profile Stack
export type ProfileScreenProps = StackScreenProps<ProfileStackParamList, 'ProfileScreen'>;
export type SettingsScreenProps = StackScreenProps<ProfileStackParamList, 'Settings'>;

// Modal Screens
export type BillCreateScreenProps = StackScreenProps<RootStackParamList, 'BillCreate'>;

/**
 * Tab Screen Props (Composite types for nested navigation)
 */
export type HomeTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export type ActivityTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Activity'>,
  StackScreenProps<RootStackParamList>
>;

export type FriendsTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Friends'>,
  StackScreenProps<RootStackParamList>
>;

export type ProfileTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  StackScreenProps<RootStackParamList>
>;

/**
 * Navigation Prop Helpers
 *
 * Use these with useNavigation hook for type-safe navigation
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
