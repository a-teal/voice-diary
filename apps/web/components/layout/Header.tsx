'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface HeaderProps {
  title?: string;
  showDate?: boolean;
  date?: Date;
  onPrevDate?: () => void;
  onNextDate?: () => void;
}

export default function Header({
  title = 'Voice Diary',
  showDate = false,
  date = new Date(),
  onPrevDate,
  onNextDate,
}: HeaderProps) {
  return (
    <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
      {showDate ? (
        <>
          <button
            onClick={onPrevDate}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="이전 날짜"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800">
              {format(date, "yyyy년 M월 d일", { locale: ko })}
            </h2>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">
              {format(date, "EEEE", { locale: ko })}
            </p>
          </div>
          <button
            onClick={onNextDate}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="다음 날짜"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      ) : (
        <h1 className="text-lg font-bold text-indigo-600">{title}</h1>
      )}
    </header>
  );
}
