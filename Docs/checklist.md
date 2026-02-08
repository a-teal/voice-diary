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
- [x] 복수 감정 시스템 구현 (primaryEmotionKey, secondaryEmotionKeys)
- [x] 감정 타입 변경 (proud→grateful 감사, surprised→thoughtful 고민)
- [x] AI 요약 톤 개선 (관찰자적 위로, 캐주얼 표현 금지)
- [x] 감정 우선순위 규칙 추가 (exhausted > thoughtful > anxious...)

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
- [x] Soft delete 구현 (deletedAt 필드)
- [x] 보조 감정 표시 (secondaryEmotionKeys 칩)

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

## Phase 4: 다국어 지원 (i18n) 🔄 (진행 중)

> 기획: [Docs/i18n/README.md](i18n/README.md)

### 4.1 기반 구축
- [x] react-i18next 설치 및 설정
- [x] 번역 파일 구조 (ko.json, en.json)
- [x] 언어 감지 로직 (브라우저 → localStorage)
- [x] useTranslation 훅 적용

### 4.2 UI 번역
- [x] 하드코딩 텍스트 추출 → 번역 키 전환
- [x] 한국어/영어 번역 완료
- [x] 설정 페이지 + 언어 선택 UI (system/ko/en 옵션)

### 4.3 AI/STT 연동
- [x] STT 언어 매핑 (ko→ko-KR, en→en-US)
- [ ] AI 분석: 입력 언어로 응답
- [ ] 모바일 테스트 (Capacitor)

### 4.4 추가 언어
- [ ] 일본어 (ja)
- [ ] 중국어 (zh-CN)

---

## Phase 5: 고도화

### 5.1 Firebase 연동
- [x] Firebase 프로젝트 생성 (voice-diary-d1e77)
- [x] Firebase SDK 설치 (v12.9.0)
- [x] Firebase 초기화 설정 (firebase.ts)
- [x] Firestore CRUD 구현 (firestore.ts)
- [x] localStorage ↔ Firestore 동기화 (storage.ts, useDiarySync.ts)
- [x] Vercel 환경변수 등록 (6개 × 3환경)

### 5.1.1 Firebase Authentication
- [x] Google 로그인 구현 (auth.ts)
- [x] Apple 로그인 구현 (auth.ts)
- [x] AuthProvider & useAuth 훅
- [x] 로그인 페이지 (app/login/page.tsx)
- [x] Firebase Console - Google 프로바이더 활성화
- [x] Firebase Console - Apple 프로바이더 활성화
- [x] Firebase Console - 승인 도메인 추가 (voicediary.life, web-zeta-five-44.vercel.app)
- [x] Firestore Security Rules 설정 (본인 데이터만 접근)
- [ ] Apple Sign-In 웹 설정 (Services ID, 키 생성, Firebase 연결)

### 5.1.2 Apple Developer 설정
- [x] Bundle ID 확정 (life.voicediary.app)
- [x] Capacitor 설정 반영 (capacitor.config.ts, ios, android)
- [ ] Apple Sign-In Services ID 생성
- [ ] Apple Sign-In 키 발급
- [ ] Firebase Console Apple 연결

### 5.1.3 문서 정비
- [x] FAQ 파일 Docs/ 폴더로 이동
- [x] FAQ 내용 수정 (감정 수정 가능, 삭제 표현, 유료 플랜)
- [x] 감정 팔레트 UI 개선 (인라인 펼침 + 연필 힌트)

### 5.2 추가 기능
- [x] 일기 삭제 (Soft delete 구현 완료)
- [ ] 일기 수정
- [ ] 연간 통계
- [ ] 알림/리마인더

### 5.5 앱 스토어 배포
- [ ] Apple Developer 계정 등록비 결제 ($99/년)
- [ ] Google Play Developer 계정 등록 ($25 일회성)
- [ ] 앱 아이콘 / 스플래시 스크린
- [ ] iOS Simulator 테스트
- [ ] Android Emulator 테스트
- [ ] App Store 심사 제출
- [ ] Play Store 출시

### 5.4 트래픽 증가 시 업그레이드 (백로그)

> MVP는 Vercel Serverless 기반. 트래픽 증가 시 아래 항목 순차 적용.

- [ ] **Rate Limiting → Vercel KV**
  - 현재: In-memory Map (Serverless에서 요청마다 리셋됨)
  - 업그레이드: Vercel KV (Redis) 사용
  - 적용 시점: DAU 100+ 또는 API 남용 감지 시
  - 비용: Vercel KV Hobby 무료 (30K 요청/월)
  ```typescript
  // apps/web/app/api/analyze/route.ts 수정
  import { kv } from '@vercel/kv';
  async function checkRateLimit(clientId: string) {
    const key = `rate:${clientId}`;
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, 60);
    return { allowed: count <= 20, remaining: Math.max(0, 20 - count) };
  }
  ```

- [ ] **AI 분석 비용 모니터링**
  - 현재: Claude Haiku (~$0.00025/요청)
  - 모니터링: Anthropic Console 사용량 확인
  - 적용 시점: 월 $10 초과 시 검토

- [ ] **에러 모니터링 (Sentry)**
  - 적용 시점: 프로덕션 사용자 피드백 필요 시

---

## 배포 현황

| 플랫폼 | 상태 | URL |
|--------|------|-----|
| Web | ✅ 완료 | https://web-zeta-five-44.vercel.app |
| GitHub | ✅ 완료 | https://github.com/a-teal/voice-diary |
| iOS | 🔄 테스트 중 | Xcode 프로젝트 + Speech Recognition |
| Android | 🔄 설정 완료 | Android Studio 프로젝트 생성됨 |

---

### 5.3 브랜딩
- [x] 앱 이름 변경 ("말로 쓰는 일기")
  - layout.tsx (title, appleWebApp)
  - manifest.json (name, short_name)
  - capacitor.config.ts (appName)
  - locales/ko.json, en.json (appName)

---

## 배포 이슈 해결 기록

### Vercel 모노레포 배포 (2025-02-05)
- **문제**: Root Directory "apps/web" does not exist
- **원인**: 변경사항이 GitHub에 푸시되지 않음
- **해결**: 루트에 vercel.json 추가 + 모든 변경사항 커밋/푸시

### Vercel 배포 (2025-01-27)
- **문제 1**: Next.js 16 Turbopack + lightningcss 네이티브 바이너리 호환 문제
  - 해결: Next.js 15.3.4로 다운그레이드
- **문제 2**: Next.js 15.3.3 보안 취약점 (CVE-2025-66478)
  - 해결: Next.js 15.3.4로 업그레이드
- **문제 3**: Git 저장소 위치 문제 (상위 폴더에 .git 있음)
  - 해결: Project Dairy 폴더에 새 git 저장소 초기화
- **문제 4**: apps/web이 서브모듈(160000)로 커밋됨
  - 해결: `git rm --cached apps/web && git add apps/web/`
