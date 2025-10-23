/**
 * Karzedaars List Screen - Karzedaar Management Hub
 *
 * Features:
 * - FlashList for performant karzedaar list rendering
 * - Search functionality for quick karzedaar lookup
 * - Add karzedaars from contacts or manually
 * - View karzedaar details and bill history
 * - Empty state for new users
 * - Pull-to-refresh for data updates
 *
 * Uses established patterns:
 * - KarzedaarCard component (horizontal layout)
 * - Glass-morphism design system
 * - Lucide icons for consistency
 * - FlashList for 60fps scrolling
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import type { KarzedaarsListScreenProps } from '@/navigation/types';
import { tokens } from '@/theme/ThemeProvider';
import { KarzedaarCard, GlassCard, LoadingSpinner, ScreenHeader } from '@/components';
import { pickContact, getContactErrorMessage } from '@/services/contactsService';
import { useKarzedaarsStore } from '@/stores';
import type { Karzedaar } from '@/types';

export const KarzedaarsListScreen: React.FC<KarzedaarsListScreenProps> = () => {
  // State
  const { karzedaars, loadKarzedaars, addOrUpdateKarzedaar, isLoading } = useKarzedaarsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);

  // Load karzedaars on mount
  useEffect(() => {
    loadKarzedaars();
  }, [loadKarzedaars]);

  // Filter karzedaars based on search query
  const filteredKarzedaars = useMemo(() => {
    if (!searchQuery.trim()) return karzedaars;

    const query = searchQuery.toLowerCase();
    return karzedaars.filter(
      (karzedaar) =>
        karzedaar.name.toLowerCase().includes(query) ||
        karzedaar.phone?.toLowerCase().includes(query) ||
        karzedaar.upiId?.toLowerCase().includes(query)
    );
  }, [karzedaars, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadKarzedaars();
    setRefreshing(false);
  }, [loadKarzedaars]);

  // Handle add karzedaar from contacts
  const handleAddFromContacts = useCallback(async () => {
    setAdding(true);
    try {
      const result = await pickContact();

      if (!result.success) {
        const errorMessage = getContactErrorMessage(result);
        if (errorMessage) {
          Alert.alert('Unable to Add Karzedaar', errorMessage);
        }
        return;
      }

      if (result.contacts && result.contacts.length > 0) {
        const contact = result.contacts[0];
        await addOrUpdateKarzedaar(contact.name, contact.phoneNumber);
        Alert.alert('Success', `${contact.name} added to your karzedaars!`);
      }
    } catch (error) {
      console.error('Error adding karzedaar from contacts:', error);
      Alert.alert('Error', 'Failed to add karzedaar. Please try again.');
    } finally {
      setAdding(false);
    }
  }, [addOrUpdateKarzedaar]);

  // Handle karzedaar press
  const handleKarzedaarPress = useCallback((karzedaar: Karzedaar) => {
    Alert.alert(
      karzedaar.name,
      `Bill history and karzedaar details coming soon!\n\n${karzedaar.billCount} bills • ₹${(karzedaar.totalAmountPaise / 100).toFixed(0)} total`,
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
      <Text style={styles.emptyTitle}>No Karzedaars Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add karzedaars to quickly create bills and track payments together
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={handleAddFromContacts}
        accessibilityLabel="Add your first karzedaar"
        accessibilityRole="button"
      >
        <UserPlus size={20} color={tokens.colors.background.card} strokeWidth={2} />
        <Text style={styles.emptyButtonText}>Add Your First Karzedaar</Text>
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
          title="Karzedaars"
          rightActions={
            <Pressable
              style={styles.iconButton}
              onPress={handleAddFromContacts}
              disabled={adding}
              accessibilityLabel="Add karzedaar from contacts"
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
                placeholder="Search karzedaars..."
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

        {/* Karzedaars List */}
        {isLoading && karzedaars.length === 0 ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size={48} color={tokens.colors.brand.primary} />
          </View>
        ) : karzedaars.length === 0 ? (
          <EmptyState />
        ) : filteredKarzedaars.length === 0 ? (
          <SearchEmptyState />
        ) : (
          <FlashList
            data={filteredKarzedaars}
            renderItem={({ item }) => (
              <KarzedaarCard
                karzedaar={item}
                onPress={() => handleKarzedaarPress(item)}
                style={styles.karzedaarCard}
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
    paddingBottom: 120, // Extra padding for bottom tab bar
  },
  karzedaarCard: {
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
