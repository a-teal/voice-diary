import { Emotion } from '@/types';

export const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; labelKo: string; color: string }> = {
  // 긍정
  happy: { emoji: '😊', label: 'Happy', labelKo: '기쁨', color: '#FFD93D' },
  excited: { emoji: '🤩', label: 'Excited', labelKo: '설렘', color: '#FF9F43' },
  proud: { emoji: '🥰', label: 'Proud', labelKo: '뿌듯', color: '#FF6B8A' },
  peaceful: { emoji: '😌', label: 'Peaceful', labelKo: '평온', color: '#55efc4' },
  // 중립
  neutral: { emoji: '😐', label: 'Neutral', labelKo: '무난', color: '#BDC3C7' },
  // 부정
  sad: { emoji: '😢', label: 'Sad', labelKo: '슬픔', color: '#5f8cff' },
  angry: { emoji: '😡', label: 'Angry', labelKo: '분노', color: '#FF6B6B' },
  anxious: { emoji: '😰', label: 'Anxious', labelKo: '불안', color: '#a29bfe' },
  exhausted: { emoji: '😫', label: 'Exhausted', labelKo: '지침', color: '#95A5A6' },
  // 기타
  surprised: { emoji: '😲', label: 'Surprised', labelKo: '놀람', color: '#74b9ff' },
};

export const EMOTIONS = Object.keys(EMOTION_MAP) as Emotion[];

// Mood values for chart (positive to negative scale, 1-10)
export const MOOD_VALUES: Record<Emotion, number> = {
  excited: 10,
  happy: 9,
  proud: 8,
  peaceful: 7,
  surprised: 6,
  neutral: 5,
  anxious: 3,
  exhausted: 2,
  sad: 2,
  angry: 1,
};
