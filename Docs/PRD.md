# PRD: Voice Diary (음성 일기 서비스)

> **최종 업데이트**: 2025-01-27
>
> 이 문서는 서비스 전체 기획서입니다. 개발 진행 상황은 [checklist.md](./checklist.md)를 참고하세요.

---

## 1. 개요

### 1.1 프로젝트 요약
**Voice Diary**는 음성으로 빠르게 일기를 기록하고, AI가 자동으로 키워드와 감정을 분석하여 시각화해주는 서비스입니다.

### 1.2 핵심 가치
- **간편함**: 음성으로 30초 안에 일기 기록 완료
- **자동 분석**: AI가 키워드 추출 및 감정 분석
- **시각화**: 일간/월간/연간 감정 흐름을 한눈에 파악

### 1.3 타겟 사용자
- 일기를 쓰고 싶지만 귀찮아서 포기하는 사람
- 자신의 감정 패턴을 파악하고 싶은 사람
- 빠르고 간편한 기록을 원하는 직장인/학생

### 1.4 배포 현황

| 플랫폼 | 상태 | URL |
|--------|------|-----|
| Web | ✅ 운영 중 | https://web-zeta-five-44.vercel.app |
| GitHub | ✅ 운영 중 | https://github.com/a-teal/voice-diary |
| iOS | 🔄 개발 중 | Xcode 프로젝트 생성됨 |
| Android | 🔄 개발 중 | Android Studio 프로젝트 생성됨 |

---

## 2. 문제 정의

### 2.1 기존 문제
| 문제 | 설명 |
|------|------|
| 시간 부족 | 일기 쓰는 데 시간이 너무 오래 걸림 |
| 귀찮음 | 타이핑/펜 기록이 번거로움 |
| 지속 실패 | 일기 습관 형성에 반복적으로 실패 |
| 통찰 부재 | 기록만 하고 분석/회고가 어려움 |

### 2.2 솔루션
- 음성 입력으로 기록 시간 최소화
- AI 자동 분석으로 인사이트 제공
- 시각화로 감정 패턴 인지 용이

---

## 3. 핵심 기능

### 3.1 음성 기록
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 음성 녹음 | 버튼 하나로 녹음 시작/종료 | P0 |
| STT 변환 | 음성을 텍스트로 자동 변환 | P0 |
| 텍스트 편집 | 변환된 텍스트 수정 가능 | P1 |

### 3.2 AI 분석
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 키워드 추출 | 일기에서 핵심 키워드 3-6개 추출 | P0 |
| 감정 분석 | 대표 감정 이모지 1개 자동 선택 | P0 |
| 요약 생성 | 한 줄 요약 자동 생성 | P1 |

### 3.3 시각화
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 일간 뷰 | 오늘의 일기 + 키워드 + 감정 표시 | P0 |
| 월간 캘린더 | 날짜별 감정 이모지 표시 | P1 |
| 주간 키워드 클라우드 | 한 주 주요 키워드 시각화 | P2 |
| 감정 그래프 | 시간에 따른 감정 변화 추이 | P2 |
| 연간 통계 | 월별 감정 분포, 연간 키워드 | P2 |

---

## 4. 데이터 모델

### 4.1 감정 타입 (10가지)

| 카테고리 | 영어 키 | 이모지 | 한글 | 설명 |
|----------|---------|--------|------|------|
| 긍정 | happy | 😊 | 기쁨 | 행복, 즐거움, 만족 |
| 긍정 | grateful | 🥰 | 감사 | 고마움, 감동 |
| 긍정 | excited | 🤩 | 설렘 | 기대, 신남 |
| 긍정 | peaceful | 😌 | 평온 | 차분함, 편안함 |
| 중립 | neutral | 😐 | 무난 | 특별한 감정 없음 |
| 중립 | thoughtful | 🤔 | 고민 | 갈등, 선택, 결정 |
| 부정 | sad | 😢 | 슬픔 | 우울, 외로움, 아쉬움 |
| 부정 | angry | 😡 | 분노 | 화남, 짜증, 불만 |
| 부정 | anxious | 😰 | 불안 | 걱정, 초조, 긴장 |
| 부정 | exhausted | 😫 | 지침 | 피곤, 무기력 |

### 4.2 일기 엔트리

```typescript
interface DiaryEntry {
  id: string;
  date: string;           // YYYY-MM-DD (하루에 여러 개 가능)
  createdAt: string;      // ISO timestamp
  transcript: string;     // 음성 → 텍스트
  keywords: string[];     // AI 추출 해시태그 (3-6개, 감정 제외)
  summary?: string;       // AI 한줄 요약

  // 감정 분석 (Primary + Secondary)
  primaryEmotionKey: Emotion;       // 대표 감정 (필수)
  secondaryEmotionKeys?: Emotion[]; // 보조 감정 (선택, 0-2개)
  emotion?: Emotion;                // deprecated (하위 호환용)

  // 감정 교정 필드
  isCorrected?: boolean;
  correctedEmotion?: Emotion;
  correctedAt?: string;

  // Soft delete
  deletedAt?: string;     // 삭제 시각 (있으면 삭제된 항목)

  editedAt?: string;
  syncedAt?: string;      // 클라우드 동기화 시간
}
```

### 4.3 AI 분석 응답

```typescript
interface AnalysisResult {
  summary: string;                  // 한 줄 요약 (관찰자적 위로 톤)
  primaryEmotionKey: Emotion;       // 대표 감정 (10가지 중 1개)
  secondaryEmotionKeys?: Emotion[]; // 보조 감정 (0-2개)
  keywords: string[];               // 3-5개
}
```

---

## 5. 화면 구성

### 5.1 일간 뷰 (메인 화면)
**경로**: `/`

**구성 요소**:
- 헤더: 날짜 표시 (< 2025년 1월 26일 일요일 >)
- 일기 카드 (있을 때)
  - 감정 이모지 (크게, 클릭 시 수정 가능)
  - 키워드 태그 (최대 6개, 클릭 시 통계 검색)
  - 일기 내용 텍스트 (접기/펼치기)
  - 시간 표시
- 빈 상태 (없을 때)
  - 꿀단지 일러스트
  - "지금 생각나는 거 있어요?" 문구
- FAB (녹음 버튼) - 하단 중앙

**인터랙션**:
- 좌우 스와이프로 날짜 이동
- 이모지 클릭 → 10개 감정 선택 팝업

### 5.2 녹음 모달
**트리거**: FAB 클릭 시 바텀시트로 등장

**구성 요소**:
- 헤더: "오늘의 일기" + 닫기 버튼
- 텍스트 영역: 실시간 음성→텍스트 표시
- 녹음 버튼 (녹음 중: 펄스 애니메이션)
- 녹음 시간 표시
- 완료 버튼
- 로딩 상태: "AI가 분석 중..." + 스피너

**상태**:
1. 대기 (idle)
2. 녹음 중 (recording)
3. AI 분석 중 (analyzing)
4. 완료/에러

### 5.3 월간 캘린더 뷰
**경로**: `/calendar`

**구성 요소**:
- 헤더: 월 표시 (< 2025년 1월 >)
- 요일 표시 (일~토)
- 날짜 그리드 (7x6)
  - 오늘 날짜 하이라이트
  - 일기 있는 날: 대표 감정 이모지 표시
  - 하루 여러 일기: 개수 표시

**인터랙션**:
- 날짜 클릭 → 일간 뷰로 이동
- 좌우 스와이프/화살표로 월 이동

### 5.4 통계 뷰
**경로**: `/stats`

**구성 요소**:
- 기간 선택 탭: 7일 / 30일
- 감정 변화 그래프 (라인 차트)
- 감정별 필터링
- 키워드 클라우드
- 키워드 검색
- URL 파라미터 검색 연동 (?search=키워드)

### 5.5 하단 네비게이션
**위치**: 모든 화면 하단 고정

**탭 구성**:
1. 일간 (홈 아이콘)
2. 월간 (캘린더 아이콘)
3. 통계 (차트 아이콘)

---

## 6. 기술 스택

### 6.1 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15.3.4 | App Router, 정적 빌드 |
| TypeScript | 5.x | 타입 안정성 |
| Tailwind CSS | v4 | 스타일링 |
| Capacitor | - | iOS/Android 네이티브 앱 |
| lucide-react | - | 아이콘 |
| framer-motion | - | 애니메이션 |
| date-fns | - | 날짜 포맷 |
| recharts | - | 차트 시각화 |
| sonner | - | 토스트 알림 |

### 6.2 백엔드/인프라
| 기술 | 용도 |
|------|------|
| Vercel | Next.js 호스팅 |
| Supabase (예정) | Auth + DB + Storage |

### 6.3 AI/음성
| 기술 | 용도 |
|------|------|
| Web Speech API | 웹 브라우저 STT (무료) |
| Capacitor Speech Recognition | 네이티브 앱 STT |
| Claude API (Haiku) | 키워드/감정 분석 |

---

## 7. 프로젝트 구조

```
Project Dairy/
├── apps/
│   ├── web/              # Next.js 웹앱
│   │   ├── app/          # App Router
│   │   │   ├── page.tsx          # 메인 (일간 뷰)
│   │   │   ├── calendar/         # 월간 캘린더
│   │   │   ├── stats/            # 통계
│   │   │   └── api/analyze/      # AI 분석 API
│   │   ├── components/
│   │   │   ├── layout/           # Header, BottomNav
│   │   │   ├── diary/            # EntryCard
│   │   │   ├── recorder/         # RecordingModal
│   │   │   └── stats/            # EmotionChart, KeywordCloud
│   │   ├── hooks/                # useVoiceRecorder, useSwipe
│   │   ├── lib/                  # 유틸리티
│   │   │   ├── emotion.ts        # 감정 상수/매핑/검증
│   │   │   ├── hashtags.ts       # 해시태그 엔진
│   │   │   ├── prompts.ts        # AI 프롬프트
│   │   │   └── storage.ts        # localStorage
│   │   ├── types/                # TypeScript 타입
│   │   ├── __tests__/            # Jest 테스트
│   │   ├── ios/                  # Capacitor iOS
│   │   └── android/              # Capacitor Android
│   └── mobile/           # (예정)
├── Docs/                 # 기획 문서
│   ├── PRD.md           # 서비스 전체 기획서 (이 파일)
│   └── checklist.md     # 개발 체크리스트
├── Design/               # 디자인 에셋
└── rules/                # AI 분석 규칙
    ├── emotion-rules.md  # 감정 분석 규칙
    └── hashtag-rules.md  # 해시태그 추출 규칙
```

---

## 8. 개발 단계

### Phase 1: MVP 핵심 기능 ✅ 완료
- [x] 프로젝트 셋업 (Next.js + 모노레포)
- [x] 음성 녹음 + 실시간 STT
- [x] AI 분석 API 연동 (Claude)
- [x] 일간 뷰 UI
- [x] 로컬 저장 (localStorage)

### Phase 2: 시각화 ✅ 완료
- [x] 월간 캘린더 뷰
- [x] 키워드 클라우드
- [x] 감정 변화 그래프
- [x] 날짜 네비게이션 (스와이프)

### Phase 3: 모바일 앱 🔄 진행 중
- [x] Capacitor 설정
- [x] iOS/Android 프로젝트 생성
- [x] 네이티브 음성인식 플러그인
- [ ] iOS Simulator 테스트
- [ ] Android Emulator 테스트
- [ ] 앱 스토어 배포

### Phase 4: 고도화 (예정)
- [ ] 연간 통계 뷰
- [ ] 일기 수정/삭제 기능
- [ ] 로그인 + 클라우드 동기화 (Supabase)
- [ ] 알림/리마인더
- [ ] 오프라인 지원

---

## 9. 디자인 시스템

### 9.1 컬러
```
Primary: #6366F1 (indigo-600)
Primary Light: #818CF8
Background: #F8FAFC (slate-50)
Surface: #FFFFFF
Text Primary: #1E293B (slate-800)
Text Secondary: #64748B (slate-500)
Border: #E2E8F0 (slate-200)
Success: #22C55E
Error: #EF4444
```

### 9.2 타이포그래피
```
Heading 1: 24px / Bold
Heading 2: 20px / SemiBold
Body: 16px / Regular
Caption: 14px / Regular
Small: 12px / Regular
```

### 9.3 컴포넌트 스타일
- 카드: `rounded-2xl shadow-sm border border-slate-100`
- 버튼: `rounded-xl` (primary: bg-indigo-600)
- 아이콘: lucide-react 사용

### 9.4 접근성
- 터치 타겟: 최소 44x44px
- 색상 대비: WCAG AA 이상
- 이모지에 대체 텍스트 제공

---

## 10. 성공 지표 (KPI)

### 10.1 사용자 지표
| 지표 | 목표 |
|------|------|
| DAU (Daily Active Users) | 출시 1개월 후 100명 |
| 리텐션 (D7) | 30% 이상 |
| 평균 기록 빈도 | 주 3회 이상 |

### 10.2 제품 지표
| 지표 | 목표 |
|------|------|
| 평균 기록 시간 | 1분 이내 |
| STT 정확도 | 90% 이상 |
| AI 분석 만족도 | 4.0/5.0 이상 |

---

## 11. 향후 확장 가능성

- **음성 AI 대화**: 녹음 후 AI와 대화하며 일기 보완
- **감정 패턴 알림**: "최근 스트레스가 높아요" 알림
- **공유 기능**: 월간 감정 리포트 이미지 공유
- **다국어 지원**: 영어, 일본어 등
- **웨어러블 연동**: Apple Watch에서 빠른 녹음

---

## 12. 결정 사항

| 이슈 | 결정 | 비고 |
|------|------|------|
| 플랫폼 | ✅ 웹 + 네이티브 앱 | Capacitor로 iOS/Android 지원 |
| 음성 변환 | ✅ Web Speech API + Capacitor | 웹/네이티브 통합 |
| 로그인 | ✅ 필수 아님 | 로컬 저장 기본, 로그인 시 동기화 |
| 수익 모델 | ✅ 보류 | MVP 이후 검토 |
| 음성 파일 저장 | ✅ 저장 안함 | 텍스트 변환 후 삭제 |
