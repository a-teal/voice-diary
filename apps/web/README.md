# Voice Diary

음성으로 기록하고, AI가 분석하는 감정 일기 앱

## 주요 기능

- **음성 녹음**: Web Speech API를 사용한 실시간 음성-텍스트 변환
- **AI 분석**: Claude API로 키워드 추출 및 감정 분석
- **시각화**: 감정 변화 그래프, 키워드 클라우드, 월간 캘린더
- **PWA**: 모바일에서 앱처럼 설치 가능

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Claude API (Anthropic)

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 API 키 추가:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run test     # 테스트 실행
npm run lint     # 린트 검사
```

## 배포

Vercel에 배포:

1. [Vercel](https://vercel.com)에서 새 프로젝트 생성
2. GitHub 레포지토리 연결
3. 환경 변수 설정: `ANTHROPIC_API_KEY`
4. 배포 완료

## 라이선스

MIT
