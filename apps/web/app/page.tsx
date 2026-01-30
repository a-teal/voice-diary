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
            <div className="w-44 h-52 relative">
              {/* Memory Jar Illustration - Treasure/Memory Storage Style */}
              <svg viewBox="0 0 120 150" fill="none" className="w-full h-full">
                {/* Glow effect behind jar */}
                <ellipse cx="60" cy="130" rx="35" ry="8" fill="#e0e7ff" opacity="0.5"/>

                {/* Jar body - mason jar style with warm tint */}
                <path d="M28 35 L28 115 Q28 130 45 130 L75 130 Q92 130 92 115 L92 35 Z"
                      fill="url(#jarGradient)" stroke="#c7d2fe" strokeWidth="2"/>

                {/* Glass shine effects */}
                <path d="M35 40 L35 120" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                <path d="M40 45 L40 115" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>

                {/* Jar neck */}
                <rect x="35" y="22" width="50" height="15" rx="2" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1.5"/>

                {/* Cork lid with texture */}
                <rect x="32" y="8" width="56" height="16" rx="4" fill="#d4a574" stroke="#b8956c" strokeWidth="1.5"/>
                <line x1="40" y1="12" x2="40" y2="20" stroke="#b8956c" strokeWidth="1" opacity="0.5"/>
                <line x1="50" y1="12" x2="50" y2="20" stroke="#b8956c" strokeWidth="1" opacity="0.5"/>
                <line x1="60" y1="12" x2="60" y2="20" stroke="#b8956c" strokeWidth="1" opacity="0.5"/>
                <line x1="70" y1="12" x2="70" y2="20" stroke="#b8956c" strokeWidth="1" opacity="0.5"/>
                <line x1="80" y1="12" x2="80" y2="20" stroke="#b8956c" strokeWidth="1" opacity="0.5"/>

                {/* Label on jar */}
                <rect x="42" y="70" width="36" height="25" rx="3" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1"/>
                <text x="60" y="86" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">memories</text>

                {/* Floating memory stars/sparkles inside */}
                <g className="memory-sparkles">
                  {/* Star 1 */}
                  <path d="M50 50 L51 53 L54 53 L52 55 L53 58 L50 56 L47 58 L48 55 L46 53 L49 53 Z" fill="#fbbf24" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="transform" values="translate(0,0);translate(0,-3);translate(0,0)" dur="3s" repeatCount="indefinite"/>
                  </path>
                  {/* Star 2 */}
                  <path d="M70 60 L71 62 L73 62 L71.5 63.5 L72 66 L70 64.5 L68 66 L68.5 63.5 L67 62 L69 62 Z" fill="#f472b6" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="transform" values="translate(0,0);translate(0,-4);translate(0,0)" dur="3.5s" repeatCount="indefinite"/>
                  </path>
                  {/* Heart */}
                  <path d="M55 105 C55 102 52 100 50 102 C48 100 45 102 45 105 C45 110 55 115 55 115 C55 115 65 110 65 105 C65 102 62 100 60 102 C58 100 55 102 55 105 Z" fill="#f87171" opacity="0.6" transform="scale(0.6) translate(35, 10)">
                    <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
                  </path>
                  {/* Sparkle dots */}
                  <circle cx="45" cy="100" r="3" fill="#a78bfa" opacity="0.5">
                    <animate attributeName="cy" values="100;95;100" dur="2.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="75" cy="95" r="2.5" fill="#60a5fa" opacity="0.5">
                    <animate attributeName="cy" values="95;90;95" dur="3.2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="60" cy="110" r="2" fill="#34d399" opacity="0.4">
                    <animate attributeName="cy" values="110;105;110" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                </g>

                {/* Ribbon/bow on jar */}
                <path d="M35 38 Q45 42 55 38 Q65 42 75 38" stroke="#818cf8" strokeWidth="2" fill="none"/>
                <circle cx="55" cy="40" r="4" fill="#818cf8"/>

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="jarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95"/>
                    <stop offset="50%" stopColor="#f1f5f9" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85"/>
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
