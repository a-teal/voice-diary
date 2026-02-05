# CLAUDE.md

이 파일은 Claude Code가 프로젝트를 이해하는 데 도움이 되는 컨텍스트를 제공합니다.

## 프로젝트 개요

Voice Diary는 음성으로 일기를 기록하고 AI가 감정/키워드를 분석하는 앱입니다.

## 모노레포 구조

```
Project Dairy/
├── apps/
│   ├── web/              # Next.js 웹앱 (현재 위치)
│   ├── mobile/           # Capacitor 모바일 앱 (예정)
│   └── admin/            # 관리자 대시보드 (예정)
├── packages/
│   ├── api/              # 백엔드 API (예정)
│   ├── ai/               # AI 분석 모듈 (예정)
│   └── shared/           # 공통 타입, 유틸리티 (예정)
├── Docs/                 # 기획 문서
├── Design/               # 디자인 에셋
└── rules/                # AI 분석 규칙 파일
    ├── emotion-rules.md  # 감정 분석 규칙
    └── hashtag-rules.md  # 해시태그 추출 규칙
```

## 기술 스택

- **프레임워크**: Next.js 15.3.4 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 라이브러리**:
  - lucide-react (아이콘)
  - framer-motion (애니메이션)
  - date-fns (날짜 포맷)
  - sonner (토스트 알림)
- **차트**: Recharts
- **AI**: Claude API (Anthropic)
- **STT**:
  - 웹: Web Speech API (브라우저 내장)
  - 네이티브: @capacitor-community/speech-recognition
- **저장소**: localStorage (로컬 저장)
- **모바일**: Capacitor (iOS/Android)

## Web 앱 구조 (apps/web)

```
apps/web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 (일간 뷰)
│   ├── calendar/          # 월간 캘린더
│   ├── stats/             # 통계
│   └── api/analyze/       # AI 분석 API
├── components/
│   ├── layout/            # Header, BottomNav
│   ├── diary/             # EntryCard
│   ├── recorder/          # RecordingModal
│   └── stats/             # EmotionChart, KeywordCloud
├── hooks/                 # 커스텀 훅 (useVoiceRecorder, useSwipe)
├── lib/                   # 유틸리티
│   ├── emotion.ts         # 감정 상수/매핑/검증 (통합)
│   ├── hashtags.ts        # 해시태그 엔진
│   ├── prompts.ts         # AI 프롬프트
│   └── storage.ts         # localStorage
├── types/                 # TypeScript 타입
├── __tests__/             # 테스트
├── ios/                   # Capacitor iOS 프로젝트
├── android/               # Capacitor Android 프로젝트
└── out/                   # 정적 빌드 출력
```

## 주요 명령어

```bash
# 루트 (Project Dairy/)
npm run dev:web           # 웹 개발 서버

# apps/web/
npm run dev               # 개발 서버 (localhost:3000)
npm run build             # 정적 빌드 (out/)
npm run test              # Jest 테스트 실행
npm run lint              # ESLint 검사

# Capacitor (apps/web/)
npx cap sync              # 웹 변경사항 동기화
npx cap open ios          # Xcode 열기
npx cap open android      # Android Studio 열기
```

## 환경 변수

```
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Claude API 키 (필수)
```

## 코딩 컨벤션

- 컴포넌트: PascalCase (예: `EntryCard.tsx`)
- 훅: camelCase, `use` 접두사 (예: `useSwipe.ts`)
- 유틸리티: camelCase (예: `storage.ts`)
- 타입: PascalCase (예: `DiaryEntry`)

## 주요 타입

```typescript
// 감정 타입 (10가지: 긍정 4, 중립 2, 부정 4)
type Emotion =
  | 'happy' | 'grateful' | 'excited' | 'peaceful'  // 긍정
  | 'neutral' | 'thoughtful'                        // 중립
  | 'sad' | 'angry' | 'anxious' | 'exhausted';      // 부정
// 😊 기쁨 | 🥰 감사 | 🤩 설렘 | 😌 평온 | 😐 무난 | 🤔 고민 | 😢 슬픔 | 😡 분노 | 😰 불안 | 😫 지침

interface DiaryEntry {
  id: string;
  date: string;           // YYYY-MM-DD (하루에 여러 개 가능)
  createdAt: string;      // ISO timestamp
  transcript: string;     // 음성 텍스트
  keywords: string[];     // AI 추출 해시태그 (3-5개, 감정 제외)
  summary?: string;       // AI 한줄 요약 (관찰자적 위로 톤)

  // 감정 분석 (Primary + Secondary)
  primaryEmotionKey: Emotion;       // 대표 감정 (필수)
  secondaryEmotionKeys?: Emotion[]; // 보조 감정 (0-2개)
  emotion?: Emotion;                // deprecated (하위 호환용)

  // 감정 교정 필드
  isCorrected?: boolean;
  correctedEmotion?: Emotion;
  correctedAt?: string;

  // Soft delete
  deletedAt?: string;     // 삭제 시각 (있으면 삭제된 항목)
}
```

## 테스트

- 테스트 프레임워크: Jest
- 테스트 파일 위치: `__tests__/`
- 현재 테스트: 37개 (emotions, validations, rate-limit)

## 배포

- **GitHub**: https://github.com/a-teal/voice-diary
- **Vercel (Web)**: https://web-zeta-five-44.vercel.app

## 디자인 시스템

### 테마 변수 (globals.css)
```css
--background: #f8fafc;
--foreground: #1e293b;
--primary: #6366f1;        /* indigo-600 */
--card: #ffffff;
--muted: #f1f5f9;
--border: rgba(0, 0, 0, 0.1);
--radius: 0.625rem;
```

### 색상 팔레트
- **Primary**: indigo-600 (#6366f1)
- **Background**: slate-50 (#f8fafc)
- **Text**: slate-800 (#1e293b)
- **Muted Text**: slate-400/500
- **Card**: white with slate-100 border

### 컴포넌트 스타일
- **카드**: `rounded-2xl shadow-sm border border-slate-100`
- **버튼**: `rounded-xl` (primary: bg-indigo-600)
- **아이콘**: lucide-react 사용

## 개발 워크플로우

작업 완료 후 반드시 아래 순서를 따릅니다. **커밋되지 않은 코드가 쌓이지 않도록 주의!**

```
1. 개발 (Development)
   └── 코드 작성/수정

2. 빌드 테스트 (Build Test)
   └── npm run build
   └── 빌드 에러 발생 시 즉시 수정

3. 단위 테스트 (Unit Test)
   └── npm run test
   └── 관련 테스트가 있는 경우 실행

4. 체크리스트 업데이트 (Checklist Update)
   └── Docs/checklist.md 업데이트 (해당 시)

5. 커밋 (Commit) ⚠️ 필수!
   └── git add <변경된 파일>
   └── git commit -m "type: 설명"
   └── git push

6. 배포 (Deploy) - 필요 시
   └── vercel --prod
   └── 배포 URL 확인
```

### 커밋 컨벤션
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `style:` UI/디자인 변경
- `refactor:` 코드 리팩토링
- `docs:` 문서 업데이트
- `chore:` 기타 작업

### 중요 규칙
- 기능 단위로 커밋 (여러 기능을 한 커밋에 묶지 않기)
- 배포 후 반드시 커밋
- 하루 작업 종료 전 모든 변경사항 커밋 확인

## AI 분석 규칙

규칙 파일은 `rules/` 폴더에 위치하며, `prompts.ts`에서 자동 로드됩니다.

### 감정 분석 (emotion-rules.md)
- Primary 감정 1개 + Secondary 감정 0-2개
- neutral은 거의 사용하지 않음 (5가지 조건 모두 충족 시에만)
- 우선순위: exhausted > thoughtful > anxious > angry > sad > grateful > excited > peaceful > happy > neutral
- 갈등/선택/결정 언급 시 → thoughtful
- 피로/지침/컨디션 저하 시 → exhausted

### 해시태그 추출 (hashtag-rules.md)
- 감정과 독립적으로 추출 (감정이 슬픔이어도 #떡볶이 가능)
- **감정 단어 제외**: 행복, 슬픔, 불안 등은 키워드에 포함 안 함
- 구체적 명사 우선: 고유명사 > 행위 > 사물 > 맥락
- 3-6개, 14자 이내, 언어 통일
- 해시태그 엔진: `lib/hashtags.ts` (정규화 사전, 블랙리스트)

## 참고 문서

- PRD: `Docs/PRD.md` (서비스 전체 기획서)
- 체크리스트: `Docs/checklist.md` (개발 진행 상황)
- 디자인 파일: `Design/` (Figma 익스포트)
- AI 규칙: `rules/` (emotion-rules.md, hashtag-rules.md)
