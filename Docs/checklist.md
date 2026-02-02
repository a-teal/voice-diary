# 개발 체크리스트

## Phase 1: MVP 핵심 기능 ✅

### 1.1 프로젝트 셋업
- [x] Next.js 15.3.4 프로젝트 생성 (App Router)
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] ESLint 설정
- [x] 폴더 구조 생성 (모노레포)
- [x] PWA 기본 설정 (manifest.json)
- [x] 환경 변수 설정 (.env.example)

### 1.2 음성 녹음 + STT
- [x] 마이크 권한 요청 로직
- [x] Web Speech API 연동 (웹)
- [x] Capacitor Speech Recognition 연동 (네이티브)
- [x] 녹음 시작/중지 UI 컴포넌트
- [x] 실시간 텍스트 표시 UI
- [x] 녹음 상태 표시
- [x] 브라우저 호환성 체크
- [x] 에러 핸들링

### 1.3 AI 분석 API
- [x] Claude API 연동
- [x] API Route 생성 (/api/analyze)
- [x] 프롬프트 설계 (키워드 + 감정)
- [x] 응답 파싱 로직
- [x] Rate limiting 구현
- [x] 감정 10가지로 정리 (긍정: 행복/감사/신남/평온, 중립: 무난/고민, 부정: 슬픔/화남/불안/지침)
- [x] 감정 분석 개선 (neutral fallback 문제 수정)
- [x] 프롬프트 파일 로드 (fs.readFileSync)
- [x] 규칙 파일 통합 (rules/emotion-rules.md, rules/hashtag-rules.md)
- [x] 해시태그 추출 개선 (감정 독립, 명사 위주)
- [x] 해시태그 엔진 구현 (정규화 사전, 블랙리스트, 3-6개)
- [x] 감정 단어 블랙리스트 필터링
- [x] 모델 업데이트 (claude-3-haiku-20240307)
- [x] Zod 설치

### 1.4 일간 뷰 UI
- [x] 메인 레이아웃 (헤더, FAB)
- [x] 날짜 표시 컴포넌트
- [x] 일기 카드 컴포넌트
- [x] 녹음 모달
- [x] 빈 상태 UI
- [x] 하루에 여러 일기 작성 지원
- [x] 감정 아이콘 클릭 시 상세 보기
- [x] 일기 카드 클릭 시 전체 텍스트 보기
- [x] 해시태그 클릭 시 통계 검색 연동
- [x] 감정 수정 기능 (이모지 클릭 → 10개 선택)

### 1.5 로컬 저장
- [x] localStorage CRUD
- [x] 데이터 스키마 정의
- [x] 감정 교정 필드 추가 (isCorrected, correctedEmotion, correctedAt)

### 1.6 테스트 & 배포
- [x] 단위 테스트 작성 (22개)
- [x] 빌드 테스트 통과
- [x] GitHub 푸시
- [x] Vercel 배포

---

## Phase 2: 시각화 ✅

### 2.1 월간 캘린더 뷰
- [x] 캘린더 그리드 컴포넌트
- [x] 월 네비게이션
- [x] 날짜별 감정 이모지 표시
- [x] 날짜 클릭 시 이동
- [x] 대표 감정 표시 (가장 긴 일기 기준)
- [x] 하루 여러 일기 시 개수 표시

### 2.2 날짜 네비게이션
- [x] 스와이프 제스처

### 2.3 통계 페이지
- [x] Recharts 감정 변화 그래프
- [x] 키워드 클라우드
- [x] 기간 선택 (7일/30일)
- [x] 감정별 필터링
- [x] 키워드 검색
- [x] 감정 분포 차트
- [x] URL 파라미터로 검색 (해시태그 연동)

### 2.4 하단 네비게이션
- [x] 일간 / 월간 / 통계 탭

---

## Phase 3: 모바일 앱 🔄 (진행 중)

### 3.1 프로젝트 구조 개편
- [x] 모노레포 구조 전환
  - apps/web (Next.js)
  - apps/mobile (Capacitor)
  - apps/admin (예정)
  - packages/api (예정)
  - packages/ai (예정)
  - packages/shared (예정)

### 3.2 Capacitor 설정
- [x] Capacitor 설치
- [x] 정적 빌드 설정 (output: export)
- [x] iOS 프로젝트 생성
- [x] Android 프로젝트 생성
- [ ] iOS Simulator 테스트
- [ ] Android Emulator 테스트

### 3.3 네이티브 기능
- [x] Capacitor Speech Recognition 플러그인 설치
- [x] useVoiceRecorder 훅 (웹/네이티브 통합)
- [x] iOS 권한 설정 (Info.plist)
  - NSMicrophoneUsageDescription
  - NSSpeechRecognitionUsageDescription
- [ ] 푸시 알림
- [ ] 앱 아이콘/스플래시

### 3.4 디자인 시스템 적용 ✅
- [x] Figma 디자인 적용 (Design/ 폴더)
- [x] 테마 CSS 변수 설정 (globals.css)
- [x] 새 의존성 설치
  - lucide-react (아이콘)
  - framer-motion (애니메이션)
  - date-fns (날짜 포맷)
  - sonner (토스트)
- [x] 컴포넌트 업데이트
  - BottomNav (lucide icons)
  - RecordingModal (framer-motion 애니메이션)
  - EntryCard (새 레이아웃, 시간 표시)
  - Header (디자인 스타일 적용)
- [x] 페이지 업데이트
  - 메인 페이지 (DailyView 스타일)
  - CalendarView (date-fns, 새 그리드)
  - StatsView (Recharts 차트, 새 레이아웃)

---

## Phase 4: 고도화 (예정)

### 4.1 백엔드
- [ ] Supabase 연동
- [ ] 사용자 인증 (소셜 로그인)
- [ ] 클라우드 동기화

### 4.2 추가 기능
- [ ] 일기 수정/삭제
- [ ] 연간 통계
- [ ] 알림/리마인더

---

## 배포 현황

| 플랫폼 | 상태 | URL |
|--------|------|-----|
| Web | ✅ 완료 | https://voice-diary-eta.vercel.app |
| GitHub | ✅ 완료 | https://github.com/a-teal/voice-diary |
| iOS | 🔄 테스트 중 | Xcode 프로젝트 + Speech Recognition |
| Android | 🔄 설정 완료 | Android Studio 프로젝트 생성됨 |

---

## 배포 이슈 해결 기록

### Vercel 배포 (2025-01-27)
- **문제 1**: Next.js 16 Turbopack + lightningcss 네이티브 바이너리 호환 문제
  - 해결: Next.js 15.3.4로 다운그레이드
- **문제 2**: Next.js 15.3.3 보안 취약점 (CVE-2025-66478)
  - 해결: Next.js 15.3.4로 업그레이드
- **문제 3**: Git 저장소 위치 문제 (상위 폴더에 .git 있음)
  - 해결: Project Dairy 폴더에 새 git 저장소 초기화
- **문제 4**: apps/web이 서브모듈(160000)로 커밋됨
  - 해결: `git rm --cached apps/web && git add apps/web/`
