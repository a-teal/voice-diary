'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import EntryCard from '@/components/diary/EntryCard';
import RecordingModal from '@/components/recorder/RecordingModal';
import { DiaryEntry, Emotion } from '@/types';
import { getEntriesByDate, updateEntry, deleteEntry } from '@/lib/storage';
import { useSwipe } from '@/hooks/useSwipe';
import { EMOTION_MAP } from '@/lib/emotion';
import { format } from 'date-fns';

export default function Home() {
  const { t } = useTranslation();
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

  const handleEmotionCorrect = (entryId: string, newEmotion: Emotion) => {
    // Update in storage with correction fields
    updateEntry(entryId, {
      isCorrected: true,
      correctedEmotion: newEmotion,
      correctedAt: new Date().toISOString(),
    });

    // Update local state
    setEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, isCorrected: true, correctedEmotion: newEmotion, correctedAt: new Date().toISOString() }
          : entry
      )
    );

    // Update selected entry if it's the one being corrected
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(prev =>
        prev ? { ...prev, isCorrected: true, correctedEmotion: newEmotion, correctedAt: new Date().toISOString() } : null
      );
    }
  };

  const handleDelete = (entryId: string) => {
    // Soft delete in storage
    deleteEntry(entryId);

    // Update local state
    setEntries(prev => prev.filter(entry => entry.id !== entryId));

    // Clear selected entry if deleted
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
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
              {entries.map((entry) => {
                const displayEmotion: Emotion = entry.correctedEmotion || entry.primaryEmotionKey || entry.emotion || 'neutral';
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl transition-all relative ${
                      selectedEntry?.id === entry.id
                        ? 'bg-indigo-50 shadow-[inset_0_0_0_2px_rgb(129,140,248)]'
                        : 'bg-white shadow-[inset_0_0_0_1px_rgb(226,232,240)]'
                    }`}
                  >
                    <span className="text-2xl">{EMOTION_MAP[displayEmotion]?.emoji}</span>
                    <span className="text-xs text-slate-500 mt-1">
                      {format(new Date(entry.createdAt), 'HH:mm')}
                    </span>
                    {entry.isCorrected && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected entry or all entries */}
            {selectedEntry ? (
              <EntryCard
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                onEmotionCorrect={handleEmotionCorrect}
                onDelete={handleDelete}
              />
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
            <div className="w-56 h-56 relative">
              {/* Pooh-style Honey Pot with Open Lid */}
              <svg viewBox="-10 -25 160 185" fill="none" className="w-full h-full">
                {/* Shadow under pot */}
                <ellipse cx="70" cy="150" rx="40" ry="5" fill="#c7d2fe" opacity="0.3"/>

                {/* Pot body - Pooh style: wide belly, narrow neck */}
                <path d="M25 65 Q15 85 18 115 Q22 140 45 148 Q55 152 70 152 Q85 152 95 148 Q118 140 122 115 Q125 85 115 65 Q108 52 70 52 Q32 52 25 65 Z"
                      fill="url(#potGradient)" stroke="#c7d2fe" strokeWidth="2"/>

                {/* Pot highlight */}
                <path d="M35 72 Q30 95 32 130" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                <path d="M42 74 Q38 95 40 125" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>

                {/* Pot rim at top */}
                <ellipse cx="70" cy="52" rx="42" ry="9" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5"/>
                <path d="M28 46 Q28 52 70 52 Q112 52 112 46 Q112 40 70 40 Q28 40 28 46 Z"
                      fill="#f8fafc" stroke="#c7d2fe" strokeWidth="1.5"/>

                {/* Lid - tilted open, positioned ABOVE the pot */}
                <g transform="translate(15, -15) rotate(-25, 70, 30)">
                  <ellipse cx="70" cy="30" rx="40" ry="9" fill="#a5b4fc" stroke="#818cf8" strokeWidth="1.5"/>
                  <ellipse cx="70" cy="25" rx="32" ry="6" fill="#c7d2fe"/>
                  {/* Lid knob */}
                  <ellipse cx="70" cy="18" rx="10" ry="5" fill="#818cf8"/>
                  <ellipse cx="70" cy="15" rx="6" ry="3" fill="#a5b4fc" opacity="0.8"/>
                </g>

                {/* Floating sparkles inside the pot */}
                <g>
                  <circle cx="55" cy="80" r="4" fill="#a5b4fc" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.25;0.6" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="80;70;80" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="85" cy="90" r="3.5" fill="#818cf8" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.8s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="90;80;90" dur="3.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="65" cy="110" r="4" fill="#c7d2fe" opacity="0.45">
                    <animate attributeName="opacity" values="0.45;0.15;0.45" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="110;98;110" dur="3.2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="78" cy="128" r="3" fill="#a5b4fc" opacity="0.35">
                    <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="cy" values="128;118;128" dur="2.8s" repeatCount="indefinite"/>
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
                {isToday ? t('home.emptyToday') : t('home.emptyPast')}
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-[200px] mx-auto">
                {isToday ? t('home.emptyTodayDesc') : t('home.emptyPastDesc')}
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
          aria-label={t('home.startRecording')}
        >
          <Image src="/icons/Icon.png" alt={t('home.startRecording')} width={48} height={48} />
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
