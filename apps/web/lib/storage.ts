import { DiaryEntry } from '@/types';

const STORAGE_KEY = 'voice-diary-entries';

// 모든 일기 조회
export function getAllEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 날짜별 일기 조회
export function getEntryByDate(date: string): DiaryEntry | null {
  const entries = getAllEntries();
  return entries.find(entry => entry.date === date) || null;
}

// 월별 일기 조회
export function getEntriesByMonth(year: number, month: number): DiaryEntry[] {
  const entries = getAllEntries();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return entries.filter(entry => entry.date.startsWith(prefix));
}

// 일기 저장
export function saveEntry(entry: DiaryEntry): void {
  const entries = getAllEntries();
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
  const entries = getAllEntries();
  const index = entries.findIndex(e => e.id === id);

  if (index >= 0) {
    entries[index] = { ...entries[index], ...updates, editedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

// 일기 삭제
export function deleteEntry(id: string): void {
  const entries = getAllEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// 고유 ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get local date string (YYYY-MM-DD) in user's timezone
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
