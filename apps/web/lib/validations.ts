import { Emotion } from '@/types';

export const VALID_EMOTIONS: Emotion[] = [
  'happy', 'sad', 'angry', 'anxious', 'peaceful',
  'tired', 'thinking', 'confident', 'love', 'neutral'
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

export type ValidationErrorKey =
  | 'errors.textRequired'
  | 'errors.textTooShort'
  | 'errors.textTooLong';

export function validateTranscript(transcript: unknown): { valid: boolean; errorKey?: ValidationErrorKey } {
  if (!transcript || typeof transcript !== 'string') {
    return { valid: false, errorKey: 'errors.textRequired' };
  }

  const trimmed = transcript.trim();

  if (trimmed.length < 5) {
    return { valid: false, errorKey: 'errors.textTooShort' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, errorKey: 'errors.textTooLong' };
  }

  return { valid: true };
}
