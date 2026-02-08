import { DiaryEntry } from '@/types';
import {
  saveEntryToFirestore,
  updateEntryInFirestore,
  deleteEntryFromFirestore,
  getAllEntriesFromFirestore,
  migrateToFirestore,
  mergeEntries,
} from './firestore';

const STORAGE_KEY = 'voice-diary-entries';
const MIGRATION_KEY = 'voice-diary-migrated';

// 모든 일기 조회 (삭제된 항목 포함 - 내부용)
export function getAllEntriesRaw(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 모든 일기 조회 (삭제된 항목 제외)
export function getAllEntries(): DiaryEntry[] {
  return getAllEntriesRaw().filter(entry => !entry.deletedAt);
}

// 날짜별 일기 조회 (단일 - 하위 호환)
export function getEntryByDate(date: string): DiaryEntry | null {
  const entries = getAllEntries();
  return entries.find(entry => entry.date === date) || null;
}

// 날짜별 일기 조회 (복수)
export function getEntriesByDate(date: string): DiaryEntry[] {
  const entries = getAllEntries();
  return entries
    .filter(entry => entry.date === date)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 월별 일기 조회
export function getEntriesByMonth(year: number, month: number): DiaryEntry[] {
  const entries = getAllEntries();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return entries.filter(entry => entry.date.startsWith(prefix));
}

// 일기 저장
export function saveEntry(entry: DiaryEntry): void {
  const entries = getAllEntriesRaw();
  const existingIndex = entries.findIndex(e => e.id === entry.id);

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// 일기 수정
export function updateEntry(id: string, updates: Partial<DiaryEntry>): void {
  const entries = getAllEntriesRaw();
  const index = entries.findIndex(e => e.id === id);

  if (index >= 0) {
    entries[index] = { ...entries[index], ...updates, editedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

// 일기 삭제 (Soft Delete)
export function deleteEntry(id: string): void {
  const entries = getAllEntriesRaw();
  const index = entries.findIndex(e => e.id === id);

  if (index >= 0) {
    entries[index] = { ...entries[index], deletedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Firestore Sync Functions
// ============================================

// 일기 저장 (로컬 + Firestore)
export async function saveEntryWithSync(
  entry: DiaryEntry,
  uid: string | null
): Promise<void> {
  // Always save to localStorage first (offline support)
  saveEntry(entry);

  // Sync to Firestore if logged in
  if (uid) {
    try {
      await saveEntryToFirestore(uid, entry);
    } catch (error) {
      console.error('Failed to sync entry to Firestore:', error);
      // Entry is still saved locally, will sync later
    }
  }
}

// 일기 수정 (로컬 + Firestore)
export async function updateEntryWithSync(
  id: string,
  updates: Partial<DiaryEntry>,
  uid: string | null
): Promise<void> {
  // Update localStorage first
  updateEntry(id, updates);

  // Sync to Firestore if logged in
  if (uid) {
    try {
      await updateEntryInFirestore(uid, id, updates);
    } catch (error) {
      console.error('Failed to sync update to Firestore:', error);
    }
  }
}

// 일기 삭제 (로컬 + Firestore)
export async function deleteEntryWithSync(
  id: string,
  uid: string | null
): Promise<void> {
  // Delete from localStorage first
  deleteEntry(id);

  // Sync to Firestore if logged in
  if (uid) {
    try {
      await deleteEntryFromFirestore(uid, id);
    } catch (error) {
      console.error('Failed to sync delete to Firestore:', error);
    }
  }
}

// Firestore에서 동기화
export async function syncFromFirestore(uid: string): Promise<DiaryEntry[]> {
  try {
    const remoteEntries = await getAllEntriesFromFirestore(uid);
    const localEntries = getAllEntriesRaw();

    // Merge local and remote entries
    const mergedEntries = mergeEntries(localEntries, remoteEntries);

    // Save merged entries to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedEntries));

    return mergedEntries.filter((entry) => !entry.deletedAt);
  } catch (error) {
    console.error('Failed to sync from Firestore:', error);
    return getAllEntries();
  }
}

// 첫 로그인 시 localStorage → Firestore 마이그레이션
export async function migrateLocalToFirestore(uid: string): Promise<boolean> {
  // Check if already migrated for this user
  const migratedUsers = JSON.parse(localStorage.getItem(MIGRATION_KEY) || '[]');
  if (migratedUsers.includes(uid)) {
    return false; // Already migrated
  }

  const localEntries = getAllEntriesRaw();
  if (localEntries.length === 0) {
    // No local entries to migrate
    migratedUsers.push(uid);
    localStorage.setItem(MIGRATION_KEY, JSON.stringify(migratedUsers));
    return false;
  }

  try {
    await migrateToFirestore(uid, localEntries);

    // Mark as migrated
    migratedUsers.push(uid);
    localStorage.setItem(MIGRATION_KEY, JSON.stringify(migratedUsers));

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}
