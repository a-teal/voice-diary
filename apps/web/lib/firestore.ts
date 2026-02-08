import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DiaryEntry } from '@/types';

// Firestore paths
const getUserEntriesPath = (uid: string) => `users/${uid}/entries`;

// Save entry to Firestore
export async function saveEntryToFirestore(
  uid: string,
  entry: DiaryEntry
): Promise<void> {
  if (!db) return;

  const ref = doc(db, getUserEntriesPath(uid), entry.id);
  await setDoc(ref, {
    ...entry,
    syncedAt: new Date().toISOString(),
  });
}

// Get single entry from Firestore
export async function getEntryFromFirestore(
  uid: string,
  entryId: string
): Promise<DiaryEntry | null> {
  if (!db) return null;

  const ref = doc(db, getUserEntriesPath(uid), entryId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;
  return snapshot.data() as DiaryEntry;
}

// Get all entries from Firestore (excluding deleted)
export async function getAllEntriesFromFirestore(
  uid: string
): Promise<DiaryEntry[]> {
  if (!db) return [];

  const q = query(
    collection(db, getUserEntriesPath(uid)),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => doc.data() as DiaryEntry);

  // Filter out soft-deleted entries
  return entries.filter((entry) => !entry.deletedAt);
}

// Get entries by date from Firestore
export async function getEntriesByDateFromFirestore(
  uid: string,
  date: string
): Promise<DiaryEntry[]> {
  if (!db) return [];

  const q = query(
    collection(db, getUserEntriesPath(uid)),
    where('date', '==', date),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => doc.data() as DiaryEntry);

  return entries.filter((entry) => !entry.deletedAt);
}

// Get entries by month from Firestore
export async function getEntriesByMonthFromFirestore(
  uid: string,
  year: number,
  month: number
): Promise<DiaryEntry[]> {
  if (!db) return [];

  // Month format: YYYY-MM
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const q = query(
    collection(db, getUserEntriesPath(uid)),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  const entries = snapshot.docs
    .map((doc) => doc.data() as DiaryEntry)
    .filter((entry) => entry.date.startsWith(monthPrefix) && !entry.deletedAt);

  return entries;
}

// Update entry in Firestore
export async function updateEntryInFirestore(
  uid: string,
  entryId: string,
  updates: Partial<DiaryEntry>
): Promise<void> {
  if (!db) return;

  const ref = doc(db, getUserEntriesPath(uid), entryId);
  await updateDoc(ref, {
    ...updates,
    syncedAt: new Date().toISOString(),
  });
}

// Soft delete entry in Firestore
export async function deleteEntryFromFirestore(
  uid: string,
  entryId: string
): Promise<void> {
  if (!db) return;

  const ref = doc(db, getUserEntriesPath(uid), entryId);
  await updateDoc(ref, {
    deletedAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  });
}

// Migrate all localStorage entries to Firestore
export async function migrateToFirestore(
  uid: string,
  entries: DiaryEntry[]
): Promise<void> {
  if (!db || entries.length === 0) return;

  // Save each entry (batch would be more efficient but simpler this way)
  for (const entry of entries) {
    await saveEntryToFirestore(uid, entry);
  }
}

// Sync entries: merge local and remote, resolve conflicts by latest syncedAt
export function mergeEntries(
  localEntries: DiaryEntry[],
  remoteEntries: DiaryEntry[]
): DiaryEntry[] {
  const merged = new Map<string, DiaryEntry>();

  // Add all local entries first
  for (const entry of localEntries) {
    merged.set(entry.id, entry);
  }

  // Merge remote entries, preferring newer ones
  for (const remoteEntry of remoteEntries) {
    const localEntry = merged.get(remoteEntry.id);

    if (!localEntry) {
      // Entry only exists remotely
      merged.set(remoteEntry.id, remoteEntry);
    } else {
      // Both exist - keep the newer one based on editedAt or syncedAt
      const localTime = new Date(localEntry.editedAt || localEntry.createdAt).getTime();
      const remoteTime = new Date(remoteEntry.syncedAt || remoteEntry.createdAt).getTime();

      if (remoteTime > localTime) {
        merged.set(remoteEntry.id, remoteEntry);
      }
    }
  }

  return Array.from(merged.values());
}
