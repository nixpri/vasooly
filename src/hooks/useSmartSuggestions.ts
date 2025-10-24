/**
 * Smart Suggestions Hook
 *
 * Provides intelligent participant suggestions based on:
 * - Recent participants (from karzedaars)
 * - Frequent split patterns
 * - Last bill replication
 */

import { useMemo } from 'react';
import { useBillStore, useKarzedaarsStore } from '@/stores';

export interface ParticipantSuggestion {
  id: string;
  name: string;
  phone?: string;
  reason: 'recent' | 'frequent' | 'last-bill';
  billCount?: number;
}

export interface SmartSuggestions {
  recentParticipants: ParticipantSuggestion[];
  frequentParticipants: ParticipantSuggestion[];
  lastBillParticipants: ParticipantSuggestion[];
  hasLastBill: boolean;
}

export function useSmartSuggestions(currentUserName?: string): SmartSuggestions {
  const { bills } = useBillStore();
  const { karzedaars } = useKarzedaarsStore();

  return useMemo(() => {
    // Get last bill (most recent active bill)
    const lastBill = bills.length > 0 ? bills[0] : null;

    // Recent participants from karzedaars (sorted by most recent activity)
    const recentParticipants: ParticipantSuggestion[] = karzedaars
      .slice(0, 5)
      .map(k => ({
        id: k.id,
        name: k.name,
        phone: k.phone,
        reason: 'recent' as const,
        billCount: k.billCount,
      }));

    // Frequent participants (most bills together)
    const frequentParticipants: ParticipantSuggestion[] = karzedaars
      .filter(k => k.billCount > 0)
      .sort((a, b) => b.billCount - a.billCount)
      .slice(0, 5)
      .map(k => ({
        id: k.id,
        name: k.name,
        phone: k.phone,
        reason: 'frequent' as const,
        billCount: k.billCount,
      }));

    // Last bill participants (excluding current user)
    const lastBillParticipants: ParticipantSuggestion[] = lastBill
      ? lastBill.participants
          .filter(p => {
            const trimmedName = p.name.trim();
            // Filter out current user
            if (trimmedName === '' || trimmedName.toLowerCase() === 'you') {
              return false;
            }
            if (currentUserName && trimmedName.toLowerCase() === currentUserName.toLowerCase()) {
              return false;
            }
            return true;
          })
          .map((p, index) => ({
            id: `last-bill-${index}`,
            name: p.name,
            phone: p.phone,
            reason: 'last-bill' as const,
          }))
      : [];

    return {
      recentParticipants,
      frequentParticipants,
      lastBillParticipants,
      hasLastBill: !!lastBill && lastBillParticipants.length > 0,
    };
  }, [bills, karzedaars, currentUserName]);
}
