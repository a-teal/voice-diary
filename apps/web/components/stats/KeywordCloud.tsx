'use client';

import { useMemo } from 'react';
import { DiaryEntry } from '@/types';

interface KeywordCloudProps {
  entries: DiaryEntry[];
  maxKeywords?: number;
}

export default function KeywordCloud({ entries, maxKeywords = 15 }: KeywordCloudProps) {
  const keywords = useMemo(() => {
    const counts: Record<string, number> = {};

    entries.forEach((entry) => {
      entry.keywords.forEach((keyword) => {
        counts[keyword] = (counts[keyword] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([keyword, count]) => ({
        keyword,
        count,
        size: Math.min(Math.max(count, 1), 5), // 1-5 scale
      }));
  }, [entries, maxKeywords]);

  if (keywords.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
        아직 키워드가 없습니다
      </div>
    );
  }

  const getSizeClass = (size: number) => {
    switch (size) {
      case 5:
        return 'text-xl font-bold text-primary';
      case 4:
        return 'text-lg font-semibold text-primary/80';
      case 3:
        return 'text-base font-medium text-gray-700';
      case 2:
        return 'text-sm text-gray-600';
      default:
        return 'text-xs text-gray-500';
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center py-4">
      {keywords.map(({ keyword, size }) => (
        <span
          key={keyword}
          className={`transition-transform hover:scale-110 cursor-default ${getSizeClass(size)}`}
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}
