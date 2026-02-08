'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getAllEntries,
  getEntriesByDate,
  getEntriesByMonth,
  saveEntryWithSync,
  updateEntryWithSync,
  deleteEntryWithSync,
  syncFromFirestore,
  migrateLocalToFirestore,
} from '@/lib/storage';
import { DiaryEntry } from '@/types';

export function useDiarySync() {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Initial sync on login
  useEffect(() => {
    if (user && !hasSynced) {
      performInitialSync();
    }
  }, [user, hasSynced]);

  const performInitialSync = async () => {
    if (!user) return;

    setIsSyncing(true);
    try {
      // First, migrate local entries to Firestore (if not already done)
      await migrateLocalToFirestore(user.uid);

      // Then sync from Firestore
      await syncFromFirestore(user.uid);

      setHasSynced(true);
    } catch (error) {
      console.error('Initial sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync
  const sync = useCallback(async () => {
    if (!user) return;

    setIsSyncing(true);
    try {
      await syncFromFirestore(user.uid);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Save entry with sync
  const saveEntry = useCallback(
    async (entry: DiaryEntry) => {
      await saveEntryWithSync(entry, user?.uid || null);
    },
    [user]
  );

  // Update entry with sync
  const updateEntry = useCallback(
    async (id: string, updates: Partial<DiaryEntry>) => {
      await updateEntryWithSync(id, updates, user?.uid || null);
    },
    [user]
  );

  // Delete entry with sync
  const deleteEntry = useCallback(
    async (id: string) => {
      await deleteEntryWithSync(id, user?.uid || null);
    },
    [user]
  );

  return {
    isSyncing,
    hasSynced,
    sync,
    saveEntry,
    updateEntry,
    deleteEntry,
    // Read functions (from localStorage, already synced)
    getAllEntries,
    getEntriesByDate,
    getEntriesByMonth,
  };
}
