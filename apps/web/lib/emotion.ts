/**
 * Emotion Module for Voice Diary
 *
 * 감정 상수, 매핑, 검증 로직을 통합 관리
 * - 10가지 감정 타입 정의
 * - 이모지/라벨/색상 매핑
 * - 한글→영어 정규화
 * - 차트용 수치 매핑
 */

import { Emotion } from '@/types';

// ============================================================
// 감정 상수 및 매핑
// ============================================================

/**
 * 감정별 메타데이터
 */
export const EMOTION_MAP: Record<Emotion, {
  emoji: string;
  label: string;
  labelKo: string;
  color: string;
}> = {
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

/**
 * 감정 키 배열
 */
export const EMOTIONS = Object.keys(EMOTION_MAP) as Emotion[];

/**
 * 유효한 감정 목록 (검증용)
 */
export const VALID_EMOTIONS: Emotion[] = [
  'happy', 'excited', 'proud', 'peaceful',
  'neutral',
  'sad', 'angry', 'anxious', 'exhausted',
  'surprised'
];

/**
 * 차트용 감정 수치 (1-10, 긍정→부정)
 */
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

// ============================================================
// 감정 정규화 (한글→영어)
// ============================================================

/**
 * 한글 감정명 → 영어 키 매핑
 */
const EMOTION_KR_TO_EN: Record<string, Emotion> = {
  // 긍정
  '행복': 'happy', '기쁨': 'happy', '즐거움': 'happy',
  '신남': 'excited', '설렘': 'excited', '기대': 'excited',
  '뿌듯': 'proud', '성취': 'proud', '자랑': 'proud', '감사': 'proud',
  '평온': 'peaceful', '편안': 'peaceful', '안도': 'peaceful',
  // 중립
  '무난': 'neutral', '보통': 'neutral',
  // 부정
  '슬픔': 'sad', '우울': 'sad', '외로움': 'sad',
  '화남': 'angry', '짜증': 'angry', '분노': 'angry',
  '불안': 'anxious', '걱정': 'anxious', '초조': 'anxious', '고민': 'anxious',
  '지침': 'exhausted', '피곤': 'exhausted', '피로': 'exhausted',
  // 기타
  '놀람': 'surprised', '충격': 'surprised', '깜짝': 'surprised',
};

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 감정 문자열이 유효한지 검사
 */
export function isValidEmotion(emotion: string): emotion is Emotion {
  return VALID_EMOTIONS.includes(emotion as Emotion);
}

/**
 * 감정 문자열을 영어 키로 정규화
 *
 * @param emotion 감정 문자열 (영어 또는 한글)
 * @returns 정규화된 Emotion 키 (기본값: neutral)
 */
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

/**
 * 감정에서 이모지 반환
 */
export function getEmoji(emotion: Emotion): string {
  return EMOTION_MAP[emotion]?.emoji || '😐';
}

/**
 * 감정에서 한글 라벨 반환
 */
export function getLabelKo(emotion: Emotion): string {
  return EMOTION_MAP[emotion]?.labelKo || '무난';
}

/**
 * 감정에서 색상 반환
 */
export function getColor(emotion: Emotion): string {
  return EMOTION_MAP[emotion]?.color || '#BDC3C7';
}

// ============================================================
// 입력 검증 (validations.ts에서 이동)
// ============================================================

/**
 * 텍스트 새니타이징 (보안)
 */
export function sanitizeTranscript(text: string): string {
  if (typeof text !== 'string') return '';

  return text
    .trim()
    .slice(0, 10000) // Max 10000 characters
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * 텍스트 유효성 검증
 */
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
