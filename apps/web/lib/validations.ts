import { Emotion } from '@/types';

export const VALID_EMOTIONS: Emotion[] = [
  'happy', 'excited', 'proud', 'peaceful',
  'neutral',
  'sad', 'angry', 'anxious', 'exhausted',
  'surprised'
];

// 한글 감정명 → 영어 키 매핑
const EMOTION_KR_TO_EN: Record<string, Emotion> = {
  '행복': 'happy', '기쁨': 'happy', '즐거움': 'happy',
  '신남': 'excited', '설렘': 'excited', '기대': 'excited',
  '뿌듯': 'proud', '성취': 'proud', '자랑': 'proud', '감사': 'proud',
  '평온': 'peaceful', '편안': 'peaceful', '안도': 'peaceful',
  '무난': 'neutral', '보통': 'neutral',
  '슬픔': 'sad', '우울': 'sad', '외로움': 'sad',
  '화남': 'angry', '짜증': 'angry', '분노': 'angry',
  '불안': 'anxious', '걱정': 'anxious', '초조': 'anxious', '고민': 'anxious',
  '지침': 'exhausted', '피곤': 'exhausted', '피로': 'exhausted',
  '놀람': 'surprised', '충격': 'surprised', '깜짝': 'surprised',
};

export function isValidEmotion(emotion: string): emotion is Emotion {
  return VALID_EMOTIONS.includes(emotion as Emotion);
}

export function normalizeEmotion(emotion: string): Emotion {
  if (!emotion) {
    console.warn('Empty emotion, fallback to neutral');
    return 'neutral';
  }

  const lower = emotion.toLowerCase().trim();

  // 1) 영어 키 체크 (exact match)
  if (VALID_EMOTIONS.includes(lower as Emotion)) {
    return lower as Emotion;
  }

  // 2) 한글 exact match
  if (EMOTION_KR_TO_EN[emotion]) {
    return EMOTION_KR_TO_EN[emotion];
  }

  // 3) 한글 부분 매칭 (startsWith/includes)
  for (const [kr, en] of Object.entries(EMOTION_KR_TO_EN)) {
    if (emotion.includes(kr)) {
      return en;
    }
  }

  // 4) 기본값 (로그 추가)
  console.warn('Unknown emotion, fallback to neutral:', emotion);
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
