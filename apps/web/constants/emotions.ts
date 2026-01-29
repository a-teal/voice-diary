import { Emotion } from '@/types';

export const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; labelKo: string; color: string }> = {
  happy: { emoji: '😊', label: 'Happy', labelKo: '기쁨', color: '#FFD93D' },
  sad: { emoji: '😢', label: 'Sad', labelKo: '슬픔', color: '#74b9ff' },
  angry: { emoji: '😤', label: 'Angry', labelKo: '화남', color: '#FF6B6B' },
  anxious: { emoji: '😰', label: 'Anxious', labelKo: '불안', color: '#a29bfe' },
  peaceful: { emoji: '😌', label: 'Peaceful', labelKo: '평온', color: '#55efc4' },
  tired: { emoji: '😫', label: 'Tired', labelKo: '피곤', color: '#95A5A6' },
  neutral: { emoji: '😐', label: 'Neutral', labelKo: '무덤덤', color: '#BDC3C7' },
};

export const EMOTIONS = Object.keys(EMOTION_MAP) as Emotion[];

// Mood values for chart (positive to negative scale, 1-5)
export const MOOD_VALUES: Record<Emotion, number> = {
  happy: 5,
  peaceful: 4,
  neutral: 3,
  tired: 2,
  anxious: 2,
  sad: 1,
  angry: 1,
};
