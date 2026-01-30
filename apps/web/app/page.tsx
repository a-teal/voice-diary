'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import EntryCard from '@/components/diary/EntryCard';
import RecordingModal from '@/components/recorder/RecordingModal';
import { DiaryEntry } from '@/types';
import { getEntriesByDate } from '@/lib/storage';
import { useSwipe } from '@/hooks/useSwipe';
import { EMOTION_MAP } from '@/constants/emotions';
import { format } from 'date-fns';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const dateString = currentDate.toISOString().split('T')[0];

  const loadEntries = useCallback(() => {
    setIsLoading(true);
    const savedEntries = getEntriesByDate(dateString);
    setEntries(savedEntries);
    setIsLoading(false);
  }, [dateString]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

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
    setEntries(prev => [newEntry, ...prev]);
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
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {/* Emotion summary for the day */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all ${
                    selectedEntry?.id === entry.id
                      ? 'bg-indigo-100 ring-2 ring-indigo-400'
                      : 'bg-white border border-slate-100'
                  }`}
                >
                  <span className="text-2xl">{EMOTION_MAP[entry.emotion].emoji}</span>
                  <span className="text-xs text-slate-500 mt-1">
                    {format(new Date(entry.createdAt), 'HH:mm')}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected entry or all entries */}
            {selectedEntry ? (
              <EntryCard entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
            ) : (
              entries.map((entry) => (
                <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="cursor-pointer">
                  <EntryCard entry={entry} compact />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-40 h-48 relative">
              {/* Memory Honey Pot - Classic Jar Style with Open Lid */}
              <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
                {/* Shadow under pot */}
                <ellipse cx="60" cy="128" rx="32" ry="6" fill="#c7d2fe" opacity="0.3"/>

                {/* Pot body - classic rounded jar shape */}
                <path d="M30 50 Q22 65 22 85 Q22 115 35 120 Q45 125 60 125 Q75 125 85 120 Q98 115 98 85 Q98 65 90 50 Z"
                      fill="url(#potGradient)" stroke="#c7d2fe" strokeWidth="2"/>

                {/* Glass shine */}
                <path d="M34 55 Q30 75 32 105" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M40 58 Q37 75 38 100" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>

                {/* Pot rim/neck */}
                <ellipse cx="60" cy="50" rx="30" ry="6" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5"/>
                <path d="M30 45 L30 50 Q30 54 60 54 Q90 54 90 50 L90 45 Q90 41 60 41 Q30 41 30 45 Z"
                      fill="#f8fafc" stroke="#c7d2fe" strokeWidth="1.5"/>

                {/* Lid - tilted open 30 degrees */}
                <g transform="rotate(-25, 90, 45)">
                  <ellipse cx="60" cy="38" rx="32" ry="7" fill="#a5b4fc" stroke="#818cf8" strokeWidth="1.5"/>
                  <ellipse cx="60" cy="35" rx="26" ry="5" fill="#c7d2fe"/>
                  {/* Lid handle */}
                  <ellipse cx="60" cy="30" rx="8" ry="4" fill="#818cf8"/>
                  <ellipse cx="60" cy="28" rx="5" ry="2.5" fill="#a5b4fc" opacity="0.7"/>
                </g>

                {/* Floating sparkles inside */}
                <g>
                  <circle cx="50" cy="70" r="4" fill="#a5b4fc" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.25;0.6" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="70;63;70" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="72" cy="78" r="3" fill="#818cf8" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.8s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="78;71;78" dur="3.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="55" cy="95" r="3.5" fill="#c7d2fe" opacity="0.45">
                    <animate attributeName="opacity" values="0.45;0.15;0.45" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="95;87;95" dur="3.2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="68" cy="105" r="2.5" fill="#a5b4fc" opacity="0.35">
                    <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="105;98;105" dur="2.8s" repeatCount="indefinite"/>
                  </circle>
                </g>

                {/* Gradient */}
                <defs>
                  <linearGradient id="potGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fafbff" stopOpacity="0.95"/>
                    <stop offset="50%" stopColor="#f0f4ff" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#e4e9ff" stopOpacity="0.85"/>
                  </linearGradient>
                </defs>
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
