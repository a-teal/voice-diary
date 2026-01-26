import { Emotion } from '@/types';

export const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😊', label: 'Happy', color: '#FFD93D' },
  sad: { emoji: '😢', label: 'Sad', color: '#6BCB77' },
  angry: { emoji: '😤', label: 'Angry', color: '#FF6B6B' },
  anxious: { emoji: '😰', label: 'Anxious', color: '#9B59B6' },
  peaceful: { emoji: '😌', label: 'Peaceful', color: '#4ECDC4' },
  tired: { emoji: '😫', label: 'Tired', color: '#95A5A6' },
  thinking: { emoji: '🤔', label: 'Thinking', color: '#3498DB' },
  confident: { emoji: '😎', label: 'Confident', color: '#F39C12' },
  love: { emoji: '🥰', label: 'Love', color: '#E91E63' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#BDC3C7' },
};

export const EMOTIONS = Object.keys(EMOTION_MAP) as Emotion[];

// Mood values for chart (positive to negative scale)
export const MOOD_VALUES: Record<Emotion, number> = {
  happy: 5,
  confident: 5,
  love: 5,
  peaceful: 4,
  thinking: 3,
  neutral: 3,
  tired: 2,
  anxious: 2,
  sad: 1,
  angry: 1,
};
