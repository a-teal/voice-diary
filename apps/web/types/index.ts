// 감정 타입 (10가지: 긍정 4, 중립 2, 부정 4)
export type Emotion =
  // 긍정
  | 'happy'      // 😊 행복/기쁨
  | 'grateful'   // 🥰 감사/사랑
  | 'excited'    // 🤩 신남/설렘
  | 'peaceful'   // 😌 평온/여유
  // 중립
  | 'neutral'    // 😐 무난/보통
  | 'thoughtful' // 🤔 고민/생각
  // 부정
  | 'sad'        // 😢 슬픔/우울
  | 'angry'      // 😡 화남/짜증
  | 'anxious'    // 😰 불안/걱정
  | 'exhausted'; // 😫 지침/스트레스

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
