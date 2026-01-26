# Voice Diary

음성으로 기록하고, AI가 분석하는 감정 일기 서비스

## 프로젝트 구조

```
Project Dairy/
├── apps/
│   ├── web/          # Next.js 웹앱 (PWA)
│   ├── admin/        # 관리자 대시보드 (예정)
│   └── mobile/       # Capacitor 모바일 앱 (예정)
├── packages/
│   ├── api/          # 백엔드 API (예정)
│   ├── ai/           # AI 분석 모듈 (예정)
│   └── shared/       # 공통 타입, 유틸리티 (예정)
├── Docs/             # 기획 문서
└── Design/           # 디자인 에셋
```

## 시작하기

### 웹앱 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev:web
```

### 환경 변수

```bash
# apps/web/.env.local
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## 배포

- **Web**: https://voice-diary-eta.vercel.app
- **GitHub**: https://github.com/a-teal/voice-diary

## 기술 스택

| 영역 | 기술 |
|------|------|
| Web | Next.js 16, TypeScript, Tailwind CSS |
| Mobile | Capacitor (예정) |
| AI | Claude API (Anthropic) |
| STT | Web Speech API |
| Storage | localStorage → Supabase (예정) |

## 스크립트

```bash
npm run dev:web      # 웹 개발 서버
npm run build:web    # 웹 빌드
npm run dev:mobile   # 모바일 개발 (예정)
npm run test         # 전체 테스트
npm run lint         # 전체 린트
```
