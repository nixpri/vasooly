/**
 * Friends List Screen - Friend Management Hub
 *
 * Features:
 * - FlashList for performant friend list rendering
 * - Search functionality for quick friend lookup
 * - Add friends from contacts or manually
 * - View friend details and bill history
 * - Empty state for new users
 * - Pull-to-refresh for data updates
 *
 * Uses established patterns:
 * - FriendCard component (horizontal layout)
 * - Glass-morphism design system
 * - Lucide icons for consistency
 * - FlashList for 60fps scrolling
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Search, UserPlus, X, Users } from 'lucide-react-native';
import type { FriendsListScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';
import { FriendCard, GlassCard, LoadingSpinner, ScreenHeader } from '@/components';
import { pickContact, getContactErrorMessage } from '@/services/contactsService';
import type { Friend } from '@/types';

export const FriendsListScreen: React.FC<FriendsListScreenProps> = () => {
  // State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;

    const query = searchQuery.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(query) ||
        friend.phone?.toLowerCase().includes(query) ||
        friend.upiId?.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Load friends from database/store
    // For now, just simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  // Handle add friend from contacts
  const handleAddFromContacts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pickContact();

      if (!result.success) {
        const errorMessage = getContactErrorMessage(result);
        if (errorMessage) {
          Alert.alert('Unable to Add Friend', errorMessage);
        }
        return;
      }

      if (result.contacts && result.contacts.length > 0) {
        const contact = result.contacts[0];

        // Create new friend
        const newFriend: Friend = {
          id: `friend-${Date.now()}`,
          name: contact.name,
          phone: contact.phoneNumber,
          addedAt: new Date(),
          billCount: 0,
          totalAmountPaise: 0,
        };

        setFriends((prev) => [newFriend, ...prev]);
        Alert.alert('Success', `${contact.name} added to your friends!`);
      }
    } catch (error) {
      console.error('Error adding friend from contacts:', error);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle add friend manually (future feature)
  // const handleAddManually = useCallback(() => {
  //   Alert.alert(
  //     'Add Friend',
  //     'Manual friend addition coming soon!\n\nFor now, please use "Add from Contacts".',
  //     [{ text: 'OK' }]
  //   );
  // }, []);

  // Handle friend press
  const handleFriendPress = useCallback((friend: Friend) => {
    Alert.alert(
      friend.name,
      `Bill history and friend details coming soon!\n\n${friend.billCount} bills • ₹${(friend.totalAmountPaise / 100).toFixed(0)} total`,
      [{ text: 'OK' }]
    );
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Users size={64} color={tokens.colors.text.tertiary} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No Friends Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add friends to quickly create bills and track payments together
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={handleAddFromContacts}
        accessibilityLabel="Add your first friend"
        accessibilityRole="button"
      >
        <UserPlus size={20} color={tokens.colors.background.card} strokeWidth={2} />
        <Text style={styles.emptyButtonText}>Add Your First Friend</Text>
      </Pressable>
    </View>
  );

  // Search empty state
  const SearchEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Search size={48} color={tokens.colors.text.tertiary} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No Results Found</Text>
      <Text style={styles.emptySubtitle}>
        Try searching by name, phone number, or UPI ID
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.base} />

      <View style={styles.container}>
        {/* Header */}
        <ScreenHeader
          title="Friends"
          rightActions={
            <Pressable
              style={styles.iconButton}
              onPress={handleAddFromContacts}
              disabled={loading}
              accessibilityLabel="Add friend from contacts"
              accessibilityRole="button"
            >
              <UserPlus size={24} color={tokens.colors.brand.primary} strokeWidth={2} />
            </Pressable>
          }
        />

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <GlassCard borderRadius={tokens.radius.md} style={styles.searchCard}>
            <View style={styles.searchContainer}>
              <Search size={20} color={tokens.colors.text.tertiary} strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search friends..."
                placeholderTextColor={tokens.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <X size={20} color={tokens.colors.text.tertiary} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          </GlassCard>
        </View>

        {/* Friends List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={48} color={tokens.colors.brand.primary} />
          </View>
        ) : friends.length === 0 ? (
          <EmptyState />
        ) : filteredFriends.length === 0 ? (
          <SearchEmptyState />
        ) : (
          <FlashList
            data={filteredFriends}
            renderItem={({ item }) => (
              <FriendCard
                friend={item}
                onPress={() => handleFriendPress(item)}
                style={styles.friendCard}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={tokens.colors.brand.primary}
                colors={[tokens.colors.brand.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.base,
  },
  iconButton: {
    padding: tokens.spacing.xs,
    borderRadius: tokens.radius.md,
  },
  searchSection: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
  },
  searchCard: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    paddingVertical: tokens.spacing.xs,
  },
  clearButton: {
    padding: tokens.spacing.xs,
  },
  listContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  friendCard: {
    marginBottom: tokens.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  emptyTitle: {
    ...tokens.typography.h2,
    color: tokens.colors.text.primary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.brand.primary,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginTop: tokens.spacing.md,
  },
  emptyButtonText: {
    ...tokens.typography.body,
    fontWeight: '600',
    color: tokens.colors.background.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
