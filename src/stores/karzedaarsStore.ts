/**
 * Karzedaars Store - Karzedaar Management with AsyncStorage Persistence
 *
 * Features:
 * - Auto-add participants from bills as karzedaars
 * - Update karzedaar stats (bill count, total amount)
 * - AsyncStorage persistence for cross-session data
 * - Case-insensitive karzedaar matching
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Karzedaar } from '@/types';

const KARZEDAARS_STORAGE_KEY = '@vasooly/karzedaars';

interface KarzedaarsState {
  karzedaars: Karzedaar[];
  isLoading: boolean;

  // Actions
  loadKarzedaars: () => Promise<void>;
  addOrUpdateKarzedaar: (name: string, phone?: string) => Promise<Karzedaar>;
  updateKarzedaarStats: (name: string, billAmountPaise: number, increment: boolean) => Promise<void>;
  removeKarzedaar: (karzedaarId: string) => Promise<void>;
  clearAllKarzedaars: () => Promise<void>;
}

export const useKarzedaarsStore = create<KarzedaarsState>((set, get) => ({
  karzedaars: [],
  isLoading: false,

  /**
   * Load karzedaars from AsyncStorage
   */
  loadKarzedaars: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(KARZEDAARS_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const karzedaars = parsed.map((k: Karzedaar) => ({
          ...k,
          addedAt: new Date(k.addedAt),
        }));
        set({ karzedaars });
      }
    } catch (error) {
      console.error('Failed to load karzedaars:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Add a new karzedaar or return existing one (case-insensitive match by name)
   */
  addOrUpdateKarzedaar: async (name: string, phone?: string): Promise<Karzedaar> => {
    const { karzedaars } = get();

    // Check if karzedaar already exists (case-insensitive)
    const existingKarzedaar = karzedaars.find(
      k => k.name.toLowerCase() === name.toLowerCase()
    );

    if (existingKarzedaar) {
      // Update phone if provided and not already set
      if (phone && !existingKarzedaar.phone) {
        const updatedKarzedaar = { ...existingKarzedaar, phone };
        const updatedKarzedaars = karzedaars.map(k =>
          k.id === existingKarzedaar.id ? updatedKarzedaar : k
        );
        set({ karzedaars: updatedKarzedaars });
        await AsyncStorage.setItem(KARZEDAARS_STORAGE_KEY, JSON.stringify(updatedKarzedaars));
        return updatedKarzedaar;
      }
      return existingKarzedaar;
    }

    // Create new karzedaar
    const newKarzedaar: Karzedaar = {
      id: `karzedaar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      phone,
      addedAt: new Date(),
      billCount: 0,
      totalAmountPaise: 0,
    };

    const updatedKarzedaars = [newKarzedaar, ...karzedaars];
    set({ karzedaars: updatedKarzedaars });
    await AsyncStorage.setItem(KARZEDAARS_STORAGE_KEY, JSON.stringify(updatedKarzedaars));

    return newKarzedaar;
  },

  /**
   * Update karzedaar's bill count and total amount
   * @param name - Karzedaar's name (case-insensitive)
   * @param billAmountPaise - Amount from the bill in paise
   * @param increment - true to add stats, false to subtract (when deleting bill)
   */
  updateKarzedaarStats: async (name: string, billAmountPaise: number, increment: boolean = true) => {
    const { karzedaars } = get();

    const karzedaar = karzedaars.find(
      k => k.name.toLowerCase() === name.toLowerCase()
    );

    if (!karzedaar) {
      console.warn(`Karzedaar "${name}" not found for stats update`);
      return;
    }

    const updatedKarzedaars = karzedaars.map(k => {
      if (k.id === karzedaar.id) {
        return {
          ...k,
          billCount: increment ? k.billCount + 1 : Math.max(0, k.billCount - 1),
          totalAmountPaise: increment
            ? k.totalAmountPaise + billAmountPaise
            : Math.max(0, k.totalAmountPaise - billAmountPaise),
        };
      }
      return k;
    });

    set({ karzedaars: updatedKarzedaars });
    await AsyncStorage.setItem(KARZEDAARS_STORAGE_KEY, JSON.stringify(updatedKarzedaars));
  },

  /**
   * Remove a karzedaar
   */
  removeKarzedaar: async (karzedaarId: string) => {
    const { karzedaars } = get();
    const updatedKarzedaars = karzedaars.filter(k => k.id !== karzedaarId);
    set({ karzedaars: updatedKarzedaars });
    await AsyncStorage.setItem(KARZEDAARS_STORAGE_KEY, JSON.stringify(updatedKarzedaars));
  },

  /**
   * Clear all karzedaars (for testing/reset)
   */
  clearAllKarzedaars: async () => {
    set({ karzedaars: [] });
    await AsyncStorage.removeItem(KARZEDAARS_STORAGE_KEY);
  },
}));
