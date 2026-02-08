'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, X, Trash2, Pencil } from 'lucide-react';
import { DiaryEntry, Emotion } from '@/types';
import { EMOTION_MAP, EMOTIONS } from '@/lib/emotion';

interface EntryCardProps {
  entry: DiaryEntry;
  compact?: boolean;
  focused?: boolean;
  dimmed?: boolean;
  onClose?: () => void;
  onEmotionCorrect?: (entryId: string, newEmotion: Emotion) => void;
  onDelete?: (entryId: string) => void;
}

export default function EntryCard({ entry, compact = false, focused = false, dimmed = false, onClose, onEmotionCorrect, onDelete }: EntryCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use corrected emotion if available, otherwise use primaryEmotionKey (fallback to emotion for legacy)
  const displayEmotion = entry.correctedEmotion || entry.primaryEmotionKey || entry.emotion || 'neutral';
  const emotionData = EMOTION_MAP[displayEmotion];

  const handleEmotionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEmotionCorrect) {
      setShowEmotionPicker(!showEmotionPicker);
    }
  };

  const handleEmotionSelect = (newEmotion: Emotion) => {
    if (onEmotionCorrect && newEmotion !== displayEmotion) {
      onEmotionCorrect(entry.id, newEmotion);
    }
    setShowEmotionPicker(false);
  };

  const handleHashtagClick = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/stats?search=${encodeURIComponent(keyword)}`);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const shouldTruncate = entry.transcript.length > 150;

  // Compact / dimmed view
  if (compact && !focused) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: dimmed ? 0.5 : 1, y: 0 }}
        transition={{ opacity: { duration: 0.2 }, layout: { duration: 0.3, type: 'spring', bounce: 0.15 } }}
        className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${dimmed ? 'pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emotionData.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">{emotionData.labelKo}</span>
              <span className="text-xs text-slate-400">
                {formatTime(entry.createdAt)}
              </span>
            </div>
            {entry.summary && (
              <p className="text-slate-500 text-sm truncate mt-0.5">
                {entry.summary}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Focused / Full view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ opacity: { duration: 0.2 }, layout: { duration: 0.3, type: 'spring', bounce: 0.15 } }}
      className={`bg-white rounded-2xl p-5 shadow-sm border ${focused ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-slate-100'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleEmotionClick}
            className={`relative text-4xl filter drop-shadow-sm transition-transform ${onEmotionCorrect ? 'hover:scale-110 cursor-pointer' : ''}`}
          >
            {emotionData.emoji}
            {onEmotionCorrect && !showEmotionPicker && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                <Pencil className="w-2.5 h-2.5 text-slate-400" />
              </span>
            )}
            {entry.isCorrected && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" title="수정됨" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{emotionData.labelKo}</span>
              {entry.secondaryEmotionKeys && entry.secondaryEmotionKeys.length > 0 && (
                <div className="flex gap-1">
                  {entry.secondaryEmotionKeys.map((emotion) => (
                    <span
                      key={emotion}
                      className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full"
                      title={EMOTION_MAP[emotion]?.labelKo}
                    >
                      {EMOTION_MAP[emotion]?.emoji}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {formatTime(entry.createdAt)}
              </span>
            </div>
            {entry.keywords && entry.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {entry.keywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleHashtagClick(keyword, e)}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
              title="삭제"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Emotion Palette - expands inline below header */}
      <AnimatePresence>
        {showEmotionPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
              <div className="flex flex-wrap justify-center gap-1">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionSelect(emotion)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                      emotion === displayEmotion
                        ? 'bg-indigo-100 ring-1 ring-indigo-300'
                        : 'hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl">{EMOTION_MAP[emotion].emoji}</span>
                    <span className="text-[10px] text-slate-500">{EMOTION_MAP[emotion].labelKo}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">일기 삭제</h3>
              <p className="text-slate-600 text-sm mb-4">
                이 일기를 삭제하시겠습니까? 삭제된 일기는 복구할 수 없습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    onDelete?.(entry.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {entry.summary && (
        <p className="text-slate-600 text-sm font-medium mb-3 italic">
          &ldquo;{entry.summary}&rdquo;
        </p>
      )}

      {/* Transcript */}
      <div className="bg-slate-50 rounded-xl p-4 relative">
        <p className={`text-slate-600 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {entry.transcript}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-center mt-2 text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
