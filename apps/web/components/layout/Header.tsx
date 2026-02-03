'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title?: string;
  showDate?: boolean;
  date?: Date;
  onPrevDate?: () => void;
  onNextDate?: () => void;
}

export default function Header({
  title,
  showDate = false,
  date = new Date(),
  onPrevDate,
  onNextDate,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ko' ? ko : enUS;
  const dateFormat = i18n.language === 'ko' ? 'yyyy년 M월 d일' : 'MMM d, yyyy';

  return (
    <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
      {showDate ? (
        <>
          <button
            onClick={onPrevDate}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label={i18n.language === 'ko' ? '이전 날짜' : 'Previous date'}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">
              {format(date, dateFormat, { locale })}
            </h2>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">
              {format(date, "EEEE", { locale })}
            </p>
          </div>
          <button
            onClick={onNextDate}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label={i18n.language === 'ko' ? '다음 날짜' : 'Next date'}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      ) : (
        <h1 className="text-lg font-bold text-indigo-600">{title || t('common.appName')}</h1>
      )}
    </header>
  );
}
