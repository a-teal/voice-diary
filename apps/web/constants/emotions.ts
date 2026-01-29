import { Emotion } from '@/types';

export const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; labelKo: string; color: string }> = {
  // 긍정
  happy: { emoji: '😊', label: 'Happy', labelKo: '행복', color: '#FFD93D' },
  grateful: { emoji: '🥰', label: 'Grateful', labelKo: '감사', color: '#FF6B8A' },
  excited: { emoji: '🤩', label: 'Excited', labelKo: '신남', color: '#FF9F43' },
  peaceful: { emoji: '😌', label: 'Peaceful', labelKo: '평온', color: '#55efc4' },
  // 중립
  neutral: { emoji: '😐', label: 'Neutral', labelKo: '무난', color: '#BDC3C7' },
  thoughtful: { emoji: '🤔', label: 'Thoughtful', labelKo: '고민', color: '#74b9ff' },
  // 부정
  sad: { emoji: '😢', label: 'Sad', labelKo: '슬픔', color: '#5f8cff' },
  angry: { emoji: '😡', label: 'Angry', labelKo: '화남', color: '#FF6B6B' },
  anxious: { emoji: '😰', label: 'Anxious', labelKo: '불안', color: '#a29bfe' },
  exhausted: { emoji: '😫', label: 'Exhausted', labelKo: '지침', color: '#95A5A6' },
};

export const EMOTIONS = Object.keys(EMOTION_MAP) as Emotion[];

// Mood values for chart (positive to negative scale, 1-10)
export const MOOD_VALUES: Record<Emotion, number> = {
  excited: 10,
  happy: 9,
  grateful: 8,
  peaceful: 7,
  neutral: 5,
  thoughtful: 4,
  anxious: 3,
  exhausted: 2,
  sad: 2,
  angry: 1,
};
