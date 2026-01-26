'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { DiaryEntry } from '@/types';
import { EMOTION_MAP } from '@/constants/emotions';

interface EntryCardProps {
  entry: DiaryEntry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const emotionData = EMOTION_MAP[entry.emotion];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const shouldTruncate = entry.transcript.length > 150;

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
              <span className="font-bold text-slate-800">{emotionData.label}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {formatTime(entry.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
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
