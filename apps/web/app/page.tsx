'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import EntryCard from '@/components/diary/EntryCard';
import RecordingModal from '@/components/recorder/RecordingModal';
import { DiaryEntry } from '@/types';
import { getEntryByDate } from '@/lib/storage';
import { useSwipe } from '@/hooks/useSwipe';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dateString = currentDate.toISOString().split('T')[0];

  const loadEntry = useCallback(() => {
    setIsLoading(true);
    const savedEntry = getEntryByDate(dateString);
    setEntry(savedEntry);
    setIsLoading(false);
  }, [dateString]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handlePrevDate = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  }, [currentDate]);

  const handleNextDate = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= new Date()) {
      setCurrentDate(newDate);
    }
  }, [currentDate]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNextDate,
    onSwipeRight: handlePrevDate,
    threshold: 50,
  });

  const handleSaved = (newEntry: DiaryEntry) => {
    setEntry(newEntry);
    setCurrentDate(new Date());
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Header
        showDate
        date={currentDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
      />

      <main
        className="flex-1 overflow-y-auto p-4 pb-24 space-y-4"
        {...swipeHandlers}
      >
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entry ? (
          <EntryCard entry={entry} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-40 h-48 relative">
              {/* Memory Jar Illustration */}
              <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
                {/* Jar lid */}
                <rect x="30" y="8" width="60" height="12" rx="3" fill="#c7d2fe" stroke="#a5b4fc" strokeWidth="2"/>
                <rect x="35" y="0" width="50" height="10" rx="2" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1.5"/>

                {/* Jar body - glass effect */}
                <path d="M25 20 L25 110 Q25 125 40 125 L80 125 Q95 125 95 110 L95 20 Z"
                      fill="#f8fafc" stroke="#c7d2fe" strokeWidth="2.5" opacity="0.9"/>

                {/* Glass shine */}
                <path d="M32 25 L32 105" stroke="#e0e7ff" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>

                {/* Floating memory dots inside jar */}
                <circle cx="50" cy="85" r="6" fill="#c7d2fe" opacity="0.5">
                  <animate attributeName="cy" values="85;80;85" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="70" cy="95" r="4" fill="#a5b4fc" opacity="0.4">
                  <animate attributeName="cy" values="95;88;95" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="60" cy="75" r="5" fill="#818cf8" opacity="0.3">
                  <animate attributeName="cy" values="75;70;75" dur="2.8s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {isToday ? 'No memories yet' : 'No entry for this day'}
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-[200px] mx-auto">
                {isToday
                  ? 'Capture your day with your voice. Tap the button below.'
                  : 'There is no diary entry for this date.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* FAB - Record Button (only show on today) */}
      {isToday && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRecordingOpen(true)}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center z-20"
          aria-label="녹음 시작"
        >
          <Image src="/icons/Icon.png" alt="녹음" width={48} height={48} />
        </motion.button>
      )}

      <BottomNav />

      <RecordingModal
        isOpen={isRecordingOpen}
        onClose={() => setIsRecordingOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
