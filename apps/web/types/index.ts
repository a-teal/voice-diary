// 감정 타입 (7가지)
export type Emotion =
  | 'happy'     // 😊 기쁨/행복
  | 'sad'       // 😢 슬픔
  | 'angry'     // 😤 분노/짜증
  | 'anxious'   // 😰 불안/걱정
  | 'peaceful'  // 😌 평온/감사
  | 'tired'     // 😫 피곤/지침
  | 'neutral';  // 😐 무덤덤

// 일기 엔트리
export interface DiaryEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  createdAt: string;      // ISO timestamp

  transcript: string;     // 음성 → 텍스트

  keywords: string[];     // AI 추출 키워드
  emotion: Emotion;       // AI 분석 감정
  summary?: string;       // AI 한줄 요약

  editedAt?: string;
  syncedAt?: string;
}

// AI 분석 응답
export interface AnalysisResult {
  keywords: string[];
  emotion: Emotion;
  summary: string;
}

// 녹음 상태
export type RecordingStatus =
  | 'idle'        // 대기
  | 'recording'   // 녹음 중
  | 'processing'  // AI 분석 중
  | 'done'        // 완료
  | 'error';      // 에러
