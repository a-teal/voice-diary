import { Emotion } from '@/types';

export const VALID_EMOTIONS: Emotion[] = [
  'happy', 'grateful', 'excited', 'peaceful',
  'neutral', 'thoughtful',
  'sad', 'angry', 'anxious', 'exhausted'
];

// 한글 감정명 → 영어 키 매핑
const EMOTION_KR_TO_EN: Record<string, Emotion> = {
  '행복': 'happy', '기쁨': 'happy', '즐거움': 'happy',
  '감사': 'grateful', '고마움': 'grateful',
  '신남': 'excited', '설렘': 'excited', '기대': 'excited',
  '평온': 'peaceful', '편안': 'peaceful', '안도': 'peaceful',
  '무난': 'neutral', '보통': 'neutral',
  '고민': 'thoughtful', '생각': 'thoughtful',
  '슬픔': 'sad', '우울': 'sad', '외로움': 'sad',
  '화남': 'angry', '짜증': 'angry', '분노': 'angry',
  '불안': 'anxious', '걱정': 'anxious', '초조': 'anxious',
  '지침': 'exhausted', '피곤': 'exhausted', '피로': 'exhausted',
};

export function isValidEmotion(emotion: string): emotion is Emotion {
  return VALID_EMOTIONS.includes(emotion as Emotion);
}

export function normalizeEmotion(emotion: string): Emotion {
  const lower = emotion.toLowerCase().trim();
  // 이미 유효한 영어 키인 경우
  if (VALID_EMOTIONS.includes(lower as Emotion)) {
    return lower as Emotion;
  }
  // 한글인 경우 매핑
  if (EMOTION_KR_TO_EN[emotion]) {
    return EMOTION_KR_TO_EN[emotion];
  }
  // 기본값
  return 'neutral';
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
