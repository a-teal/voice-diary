'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { DiaryEntry } from '@/types';
import { EMOTION_MAP } from '@/constants/emotions';

interface EntryCardProps {
  entry: DiaryEntry;
  compact?: boolean;
  onClose?: () => void;
}

export default function EntryCard({ entry, compact = false, onClose }: EntryCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const emotionData = EMOTION_MAP[entry.emotion];

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

  // Compact view - just show summary
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
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

  // Full view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow-sm">{emotionData.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{emotionData.labelKo}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {formatTime(entry.createdAt)}
              </span>
            </div>
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
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

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
