# 다국어 지원 (i18n) 기획

## 목표
Voice Diary 앱의 다국어 지원을 통해 글로벌 사용자 확보

## 지원 언어
| 언어 | 코드 | 우선순위 |
|------|------|----------|
| 🇰🇷 한국어 | ko | P0 (기본) |
| 🇺🇸 영어 | en | P0 |
| 🇯🇵 일본어 | ja | P1 |
| 🇨🇳 중국어 간체 | zh-CN | P2 |

---

## 결정 사항 ✅

### 1. 라이브러리: `react-i18next`
- Capacitor 정적 빌드(out/)와 호환
- next-intl은 middleware 필요 → 정적 export 제한
- 모바일/웹 동일 패턴 사용 가능
- 성숙한 생태계, date-fns 연동 쉬움

### 2. 기본 언어: 자동 감지
- 브라우저/기기 언어가 한국어(ko) → 한국어
- 그 외 모든 언어 → 영어(en) fallback
- localStorage에 수동 설정 저장

### 3. AI 분석 언어: 입력 언어 자동 감지
- 사용자가 한국어로 말하면 → 한국어로 분석/요약
- 사용자가 영어로 말하면 → 영어로 분석/요약
- 프롬프트에 언어 감지 로직 추가

### 4. 언어 전환 UI: 설정 페이지
- 헤더 X, 설정 페이지에 언어 선택 옵션
- 설정 페이지 신규 개발 필요

### 5. 플랫폼: 웹 + 모바일 (Capacitor)
- 정적 export 필수
- STT 언어 설정 연동 (Web Speech API / Capacitor Speech Recognition)

---

## 정책 (Policy)

### Mixed-language UX Policy
| 항목 | 언어 기준 | 비고 |
|------|-----------|------|
| UI (버튼, 라벨) | 사용자 설정 | 설정 페이지에서 변경 |
| Transcript (원본) | 입력 언어 | 번역 안 함 |
| AI Summary | 입력 언어 | 원본 뉘앙스 유지 |
| Keywords | 입력 언어 | 원본 유지 |

> v1에서는 사용자 콘텐츠 자동 번역 없음

### Emotion Label Policy
- Emotion key는 언어 중립 (영문): `happy`, `sad`, `exhausted`
- 각 언어는 **자연스러운 라벨** 제공 (직역 X)
  - `exhausted` → "지침" (O) / "소진됨" (X)
  - `peaceful` → "평온" (O) / "평화로운" (X)
- 이모지는 언어 무관 고정: 😊😢😫 등

### STT 언어 매핑
i18n 언어 코드 → STT BCP-47 코드 매핑:

| i18n | STT (Web/Capacitor) |
|------|---------------------|
| ko | ko-KR |
| en | en-US |
| ja | ja-JP |
| zh-CN | zh-CN |

> 정교한 매핑으로 인식률 향상

---

## 번역 범위

### UI 텍스트
- [ ] 네비게이션 (홈, 캘린더, 통계)
- [ ] 버튼 (저장, 취소, 삭제 등)
- [ ] 감정 라벨 (기쁨, 슬픔 등 10개)
- [ ] 빈 상태 메시지
- [ ] 에러 메시지
- [ ] 설정 페이지 (신규)

### AI 분석
- [ ] 프롬프트: 입력 언어 감지 후 해당 언어로 응답
- [ ] 감정 키워드 다국어 매핑

### 음성 인식 (STT)
- [ ] Web Speech API: `lang` 파라미터 설정
- [ ] Capacitor: `language` 옵션 설정

---

## 폴더 구조

```
apps/web/
├── locales/
│   ├── ko.json          # 한국어
│   └── en.json          # 영어
├── lib/
│   └── i18n.ts          # react-i18next 설정
├── contexts/
│   └── LocaleContext.tsx # (필요시)
└── app/
    └── settings/        # 설정 페이지 (신규)
        └── page.tsx
```

---

## 마일스톤

### Phase 1: 기반 구축
- [ ] react-i18next 설치 및 설정
- [ ] 번역 파일 구조 (ko.json, en.json)
- [ ] 언어 감지 로직 (브라우저 → localStorage)
- [ ] useTranslation 훅 테스트

### Phase 2: UI 번역
- [ ] 하드코딩 텍스트 추출 → 번역 키 전환
- [ ] 한국어/영어 번역 완료
- [ ] 설정 페이지 + 언어 선택 UI

### Phase 3: AI/STT 연동
- [ ] 프롬프트 다국어화 (입력 언어 감지)
- [ ] STT 언어 설정 연동
- [ ] 모바일 테스트 (Capacitor)

### Phase 4: 추가 언어
- [ ] 일본어 (ja)
- [ ] 중국어 (zh-CN)

---

## 참고

- [react-i18next 공식 문서](https://react.i18next.com/)
- [Capacitor Speech Recognition](https://github.com/capacitor-community/speech-recognition)

