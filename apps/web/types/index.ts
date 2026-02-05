// 감정 타입 (10가지: 긍정 4, 중립 2, 부정 4)
export type Emotion =
  // 긍정
  | 'happy'      // 😊 기쁨
  | 'grateful'   // 🥰 감사
  | 'excited'    // 🤩 설렘
  | 'peaceful'   // 😌 평온
  // 중립
  | 'neutral'    // 😐 무난
  | 'thoughtful' // 🤔 고민
  // 부정
  | 'sad'        // 😢 슬픔
  | 'angry'      // 😡 분노
  | 'anxious'    // 😰 불안
  | 'exhausted'; // 😫 지침

// 일기 엔트리
export interface DiaryEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  createdAt: string;      // ISO timestamp

  transcript: string;     // 음성 → 텍스트

  keywords: string[];     // AI 추출 해시태그 (2-5개)
  summary?: string;       // AI 한줄 요약

  // 복수 감정 시스템 (신규 스키마)
  primaryEmotionKey: Emotion;           // 대표 감정 (UI 표시)
  secondaryEmotionKeys?: Emotion[];     // 부가 감정 (0-2개, primary와 중복 금지)

  // 하위 호환용 필드
  emotion?: Emotion;                    // deprecated: primaryEmotionKey 사용

  // B 준비용 교정 필드
  isCorrected?: boolean;         // 사용자가 감정을 교정했는지
  correctedEmotion?: Emotion;    // 교정된 감정 (원본 유지)
  correctedAt?: string;          // 교정 시각

  // Soft Delete
  deletedAt?: string;            // 삭제 시각 (null이면 활성)

  editedAt?: string;
  syncedAt?: string;
}

// AI 분석 응답
export interface AnalysisResult {
  summary: string;
  primaryEmotionKey: Emotion;
  secondaryEmotionKeys?: Emotion[];  // 0-2개, primaryEmotionKey와 중복 금지
  keywords: string[];                 // 2-5개, unique
}

// 녹음 상태
export type RecordingStatus =
  | 'idle'        // 대기
  | 'recording'   // 녹음 중
  | 'processing'  // AI 분석 중
  | 'done'        // 완료
  | 'error';      // 에러
