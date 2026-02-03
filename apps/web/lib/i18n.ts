import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['ko', 'en'],

    detection: {
      // 감지 순서: localStorage → navigator → html lang
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'voice-diary-language',
    },

    interpolation: {
      escapeValue: false, // React에서 XSS 보호
    },

    react: {
      useSuspense: false, // SSR/정적 빌드 호환
    },
  });

// 언어 변경 헬퍼
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('voice-diary-language', lang);
};

// 현재 언어의 STT 코드 반환
export const getSTTLanguage = (): string => {
  return STT_LANGUAGE_MAP[i18n.language] || 'en-US';
};

export default i18n;
