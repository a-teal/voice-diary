'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { DiaryEntry } from '@/types';
import { getEntriesByMonth } from '@/lib/storage';
import { EMOTION_MAP } from '@/lib/emotion';

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

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

  // Get representative emotion for a day (longest transcript = most detailed entry)
  const getRepresentativeEntry = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(e => e.date === dateStr);
    if (dayEntries.length === 0) return null;
    // Return entry with longest transcript
    return dayEntries.reduce((longest, current) =>
      current.transcript.length > longest.transcript.length ? current : longest
    );
  };

  // Count entries for a day
  const getEntryCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.filter(e => e.date === dateStr).length;
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
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {paddingDays.map((_, i) => (
            <div key={`padding-${i}`} />
          ))}

          {daysInMonth.map((date) => {
            const representativeEntry = getRepresentativeEntry(date);
            const entryCount = getEntryCount(date);
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

                {representativeEntry && (
                  <div className="absolute bottom-0 flex items-center">
                    <span className="text-lg filter drop-shadow-sm transform hover:scale-125 transition-transform">
                      {EMOTION_MAP[representativeEntry.emotion].emoji}
                    </span>
                    {entryCount > 1 && (
                      <span className="text-[10px] text-slate-400 ml-0.5">+{entryCount - 1}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Monthly Summary</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{entries.length}</p>
              <p className="text-xs text-slate-500">Entries</p>
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
