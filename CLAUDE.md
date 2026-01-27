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
└── Design/               # 디자인 에셋
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
- **다국어**: Custom i18n (React Context 기반)

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
│   └── i18n.tsx           # 다국어 지원 (Context + Hook)
├── messages/              # 번역 파일
│   ├── en.json            # 영어 (기본)
│   └── ko.json            # 한국어
├── types/                 # TypeScript 타입
├── constants/             # 상수 (감정 이모지 등)
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
type Emotion = 'happy' | 'sad' | 'angry' | 'anxious' | 'peaceful'
             | 'tired' | 'thinking' | 'confident' | 'love' | 'neutral';

interface DiaryEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  createdAt: string;      // ISO timestamp
  transcript: string;     // 음성 텍스트
  keywords: string[];     // AI 추출 키워드
  emotion: Emotion;       // AI 분석 감정
  summary?: string;       // AI 한줄 요약
}
```

## 테스트

- 테스트 프레임워크: Jest
- 테스트 파일 위치: `__tests__/`
- 현재 테스트: 22개 (emotions, validations, rate-limit)

## 배포

- **GitHub**: https://github.com/a-teal/voice-diary
- **Vercel (Web)**: https://voice-diary-eta.vercel.app

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

## 다국어 지원 (i18n)

### 지원 언어
- 영어 (en) - 기본값
- 한국어 (ko)

### 작동 방식
1. 브라우저 언어 자동 감지 (`navigator.language`)
2. 지원 언어가 있으면 해당 언어로 표시
3. 지원 언어가 없으면 영어(fallback)로 표시
4. localStorage에 사용자 선호 언어 저장

### 번역 파일 구조
```
messages/
├── en.json    # 영어 (기본)
└── ko.json    # 한국어
```

### 사용법
```tsx
import { useTranslation } from '@/lib/i18n';

function Component() {
  const { t, locale } = useTranslation();
  return <p>{t('home.noMemories')}</p>;
}
```

### 새 언어 추가
1. `messages/` 폴더에 새 JSON 파일 추가 (예: `ja.json`)
2. `lib/i18n.tsx`의 `SUPPORTED_LOCALES`에 추가
3. `messages` 객체에 import 추가

## 참고 문서

- PRD: `Docs/PRD.md`
- 체크리스트: `Docs/checklist.md`
- 프로젝트 계획: `Docs/project_plan.md`
- 디자인 파일: `Design/` (Figma 익스포트)
