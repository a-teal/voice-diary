import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ko from '../locales/ko.json';
import en from '../locales/en.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
};

// STT BCP-47 코드 매핑
export const STT_LANGUAGE_MAP: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  'zh-CN': 'zh-CN',
};

// 언어 모드 타입
export type LocaleMode = 'system' | 'ko' | 'en';

// 지원 언어 옵션
export const LOCALE_OPTIONS = [
  { mode: 'system' as const, label: 'System', labelKo: '시스템 설정' },
  { mode: 'ko' as const, label: '한국어', labelKo: '한국어' },
  { mode: 'en' as const, label: 'English', labelKo: 'English' },
] as const;

// localStorage 키
const LOCALE_MODE_KEY = 'voice-diary-locale-mode';

// 시스템 언어에서 지원 언어로 변환
function getSystemLocale(): 'ko' | 'en' {
  if (typeof navigator === 'undefined') return 'en';
  const navLang = navigator.language.toLowerCase();
  return navLang.startsWith('ko') ? 'ko' : 'en';
}

// localeMode에서 실제 언어 결정
export function resolveLocale(mode: LocaleMode): 'ko' | 'en' {
  if (mode === 'system') {
    return getSystemLocale();
  }
  return mode;
}

// 저장된 localeMode 가져오기
export function getLocaleMode(): LocaleMode {
  if (typeof localStorage === 'undefined') return 'system';
  const saved = localStorage.getItem(LOCALE_MODE_KEY);
  if (saved === 'ko' || saved === 'en' || saved === 'system') {
    return saved;
  }
  return 'system';
}

// localeMode 저장 및 언어 변경
export function setLocaleMode(mode: LocaleMode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCALE_MODE_KEY, mode);
  }
  const resolved = resolveLocale(mode);
  i18n.changeLanguage(resolved);
}

// 초기화 시 저장된 설정 적용
function getInitialLanguage(): string {
  const mode = getLocaleMode();
  return resolveLocale(mode);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? getInitialLanguage() : 'en',
    fallbackLng: 'en',
    supportedLngs: ['ko', 'en'],

    interpolation: {
      escapeValue: false, // React에서 XSS 보호
    },

    react: {
      useSuspense: false, // SSR/정적 빌드 호환
    },
  });

// 현재 언어의 STT 코드 반환
export function getSTTLanguage(): string {
  return STT_LANGUAGE_MAP[i18n.language] || 'en-US';
}

// 현재 적용된 언어 반환
export function getCurrentLocale(): 'ko' | 'en' {
  return (i18n.language as 'ko' | 'en') || 'en';
}

export default i18n;
