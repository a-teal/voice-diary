'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Check, Globe, HelpCircle, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { LocaleMode, LOCALE_OPTIONS, getLocaleMode, setLocaleMode, resolveLocale } from '@/lib/i18n';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [localeMode, setLocaleModeState] = useState<LocaleMode>('system');
  const [resolvedLocale, setResolvedLocale] = useState<'ko' | 'en'>('en');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const mode = getLocaleMode();
    setLocaleModeState(mode);
    setResolvedLocale(resolveLocale(mode));
  }, []);

  const handleLanguageChange = (mode: LocaleMode) => {
    setLocaleMode(mode);
    setLocaleModeState(mode);
    setResolvedLocale(resolveLocale(mode));
  };

  const getOptionLabel = (option: typeof LOCALE_OPTIONS[number]) => {
    if (option.mode === 'system') {
      return t('settings.systemOption');
    }
    return option.label;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-white shadow-sm flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{t('settings.title')}</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Language Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t('settings.language')}</h3>
                <p className="text-sm text-slate-500">{t('settings.languageDescription')}</p>
              </div>
            </div>
          </div>

          {/* Language Options */}
          <div className="divide-y divide-slate-100">
            {LOCALE_OPTIONS.map((option) => (
              <button
                key={option.mode}
                onClick={() => handleLanguageChange(option.mode)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-700">{getOptionLabel(option)}</span>
                {localeMode === option.mode && (
                  <Check className="w-5 h-5 text-indigo-600" />
                )}
              </button>
            ))}
          </div>

          {/* Current Applied Language */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{t('settings.currentLanguage')}</span>
              <span className="text-sm font-medium text-indigo-600">
                {resolvedLocale === 'ko' ? '한국어' : 'English'}
              </span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{t('settings.faq')}</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {(t('settings.faqItems', { returnObjects: true }) as Array<{ q: string; a: string }>).map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-sm text-slate-700 pr-2">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm text-slate-500 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
