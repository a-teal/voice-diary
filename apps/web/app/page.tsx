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
            <div className="w-40 h-40 relative">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50 blur-xl animate-pulse" />
              <div className="w-full h-full bg-indigo-50 rounded-full border-4 border-white shadow-lg relative z-10 flex items-center justify-center">
                <span className="text-6xl">📝</span>
              </div>
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
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center z-20"
          aria-label="녹음 시작"
        >
          <Image src="/icons/Icon.png" alt="녹음" width={32} height={32} />
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
