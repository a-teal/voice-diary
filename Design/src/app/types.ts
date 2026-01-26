export type Mood = 'happy' | 'sad' | 'angry' | 'anxious' | 'peaceful' | 'tired' | 'thinking' | 'confident' | 'love' | 'neutral';

export interface DiaryEntry {
  id: string;
  audioUrl: string;
  createdAt: string; // ISO string for easier serialization
  duration: number;
  text: string;
  mood: Mood;
  keywords: string[];
}

export const MOODS: Record<Mood, { emoji: string; color: string; label: string }> = {
  happy: { emoji: '😊', color: '#FFD93D', label: 'Happy' },
  sad: { emoji: '😢', color: '#6BCB77', label: 'Sad' },
  angry: { emoji: '😤', color: '#FF6B6B', label: 'Angry' },
  anxious: { emoji: '😰', color: '#9B59B6', label: 'Anxious' },
  peaceful: { emoji: '😌', color: '#4ECDC4', label: 'Peaceful' },
  tired: { emoji: '😫', color: '#95A5A6', label: 'Tired' },
  thinking: { emoji: '🤔', color: '#3498DB', label: 'Thinking' },
  confident: { emoji: '😎', color: '#F39C12', label: 'Confident' },
  love: { emoji: '🥰', color: '#E91E63', label: 'Love' },
  neutral: { emoji: '😐', color: '#BDC3C7', label: 'Neutral' },
};

export const MOCK_KEYWORDS = [
  "Work", "Family", "Weather", "Food", "Exercise", "Sleep", "Dream", "Traffic", 
  "Meeting", "Coffee", "Friend", "Movie", "Book", "Walk", "Idea"
];
