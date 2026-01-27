'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { DiaryEntry } from '@/types';
import { getEntriesByMonth } from '@/lib/storage';
import { EMOTION_MAP } from '@/constants/emotions';
import { useTranslation } from '@/lib/i18n';

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'ko' ? ko : enUS;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  useEffect(() => {
    const monthEntries = getEntriesByMonth(year, month);
    setEntries(monthEntries);
  }, [year, month]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));
  const paddingDays = Array.from({ length: startDay });

  const getEntryForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find(e => e.date === dateStr);
  };

  const handleDateSelect = (date: Date) => {
    router.push(`/?date=${format(date, 'yyyy-MM-dd')}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 bg-white shadow-sm flex justify-between items-center">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">
          {format(currentMonth, locale === 'ko' ? "yyyy년 M월" : "MMMM yyyy", { locale: dateLocale })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-y-auto pb-24">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4">
          {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t(`calendar.weekdays.${day}`)}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {paddingDays.map((_, i) => (
            <div key={`padding-${i}`} />
          ))}

          {daysInMonth.map((date) => {
            const entry = getEntryForDay(date);
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toString()}
                onClick={() => handleDateSelect(date)}
                className="flex flex-col items-center gap-1 relative h-14"
              >
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${isToday
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-700 hover:bg-slate-100"
                  }
                `}>
                  {format(date, "d")}
                </span>

                {entry && (
                  <span className="text-lg absolute bottom-0 filter drop-shadow-sm transform hover:scale-125 transition-transform">
                    {EMOTION_MAP[entry.emotion].emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-3">{t('calendar.monthlySummary')}</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{entries.length}</p>
              <p className="text-xs text-slate-500">{t('calendar.entries')}</p>
            </div>
            <div className="flex-1 flex flex-wrap gap-1">
              {entries.map((entry) => (
                <span key={entry.id} className="text-lg">
                  {EMOTION_MAP[entry.emotion].emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
