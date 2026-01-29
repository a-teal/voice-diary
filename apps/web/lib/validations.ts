import { Emotion } from '@/types';

export const VALID_EMOTIONS: Emotion[] = [
  'happy', 'grateful', 'excited', 'peaceful',
  'neutral', 'thoughtful',
  'sad', 'angry', 'anxious', 'exhausted'
];

export function isValidEmotion(emotion: string): emotion is Emotion {
  return VALID_EMOTIONS.includes(emotion as Emotion);
}

export function sanitizeTranscript(text: string): string {
  if (typeof text !== 'string') return '';

  // Remove potentially harmful content
  return text
    .trim()
    .slice(0, 10000) // Max 10000 characters
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function validateTranscript(transcript: unknown): { valid: boolean; error?: string } {
  if (!transcript || typeof transcript !== 'string') {
    return { valid: false, error: '텍스트가 필요합니다.' };
  }

  const trimmed = transcript.trim();

  if (trimmed.length < 5) {
    return { valid: false, error: '텍스트가 너무 짧습니다. (최소 5자)' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: '텍스트가 너무 깁니다. (최대 10000자)' };
  }

  return { valid: true };
}
