// 감정 타입 (10가지: 긍정 4, 중립 1, 부정 4, 기타 1)
export type Emotion =
  // 긍정
  | 'happy'      // 😊 기쁨
  | 'excited'    // 🤩 설렘
  | 'proud'      // 🥰 뿌듯
  | 'peaceful'   // 😌 평온
  // 중립
  | 'neutral'    // 😐 무난
  // 부정
  | 'sad'        // 😢 슬픔
  | 'angry'      // 😡 분노
  | 'anxious'    // 😰 불안
  | 'exhausted'  // 😫 지침
  // 기타
  | 'surprised'; // 😲 놀람

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
