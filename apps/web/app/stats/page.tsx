'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { subDays, isAfter, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '@/components/layout/BottomNav';
import { DiaryEntry, Emotion } from '@/types';
import { getAllEntries } from '@/lib/storage';
import { EMOTION_MAP, MOOD_VALUES, EMOTIONS } from '@/lib/emotion';

function StatsContent() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);

  // Initialize search from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const allEntries = getAllEntries();
    setEntries(allEntries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  const filteredEntries = useMemo(() => {
    const startDate = subDays(new Date(), period);
    return entries
      .filter(e => isAfter(new Date(e.createdAt), startDate))
      .filter(e => !selectedEmotion || e.emotion === selectedEmotion)
      .filter(e => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          e.transcript.toLowerCase().includes(query) ||
          e.keywords.some(k => k.toLowerCase().includes(query)) ||
          (e.summary?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [entries, period, selectedEmotion, searchQuery]);

  const chartData = useMemo(() => {
    return filteredEntries.map(entry => {
      const emotionKey: Emotion = entry.primaryEmotionKey || entry.emotion || 'neutral';
      return {
        date: format(new Date(entry.createdAt), 'MM/dd'),
        value: MOOD_VALUES[emotionKey] || 3,
        emoji: EMOTION_MAP[emotionKey]?.emoji,
        emotion: emotionKey,
      };
    });
  }, [filteredEntries]);

  // Emotion distribution
  const emotionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const emotionKey: Emotion = e.primaryEmotionKey || e.emotion || 'neutral';
      counts[emotionKey] = (counts[emotionKey] || 0) + 1;
    });
    return EMOTIONS.map(emotion => ({
      emotion,
      count: counts[emotion] || 0,
      ...EMOTION_MAP[emotion],
    })).filter(e => e.count > 0);
  }, [filteredEntries]);

  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => {
      e.keywords.forEach(k => {
        counts[k] = (counts[k] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredEntries]);

  const mostFrequentMood = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const emotionKey: Emotion = e.primaryEmotionKey || e.emotion || 'neutral';
      counts[emotionKey] = (counts[emotionKey] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    const topMood = sorted[0][0] as Emotion;
    return EMOTION_MAP[topMood];
  }, [filteredEntries]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEmotion(null);
  };

  const hasFilters = searchQuery || selectedEmotion;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-y-auto">
      <header className="px-6 pt-12 pb-4 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('stats.title')}</h2>

        {/* Period toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full mb-4">
          <button
            onClick={() => setPeriod(7)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              period === 7
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t('stats.last7days')}
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              period === 30
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t('stats.last30days')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('stats.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Emotion filter - emoji only, wrap allowed */}
        <div className="flex flex-wrap gap-2 mt-3">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(selectedEmotion === emotion ? null : emotion)}
              className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                selectedEmotion === emotion
                  ? 'bg-indigo-100 ring-2 ring-indigo-500'
                  : 'bg-slate-100 opacity-60 hover:opacity-100'
              }`}
              title={t(`emotion.${emotion}`)}
            >
              {EMOTION_MAP[emotion].emoji}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            {t('stats.clearFilters')}
          </button>
        )}
      </header>

      <div className="p-6 space-y-6 pb-24">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📊</p>
            <p className="text-slate-500">{t('stats.emptyTitle')}</p>
            <p className="text-slate-400 text-sm mt-2">
              {t('stats.emptyDesc')}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t('stats.totalEntries')}</h4>
                <p className="text-3xl font-bold text-slate-900">{filteredEntries.length}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t('stats.mainEmotion')}</h4>
                {mostFrequentMood ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mostFrequentMood.emoji}</span>
                    <span className="font-semibold text-slate-700">{t(`emotion.${Object.entries(EMOTION_MAP).find(([_, v]) => v.emoji === mostFrequentMood.emoji)?.[0]}`)}</span>
                  </div>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>
            </section>

            {/* Mood Flow Chart */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6">{t('stats.emotionTrend')}</h3>
              <div className="h-48 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis hide domain={[0, 11]} />
                      <Tooltip
                        content={({ payload }) => {
                          if (payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 shadow-lg rounded-xl border">
                                <span className="text-2xl">{data.emoji}</span>
                                <p className="text-xs text-slate-500 mt-1">{data.date}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1' }}
                        activeDot={{ r: 6, fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    {t('stats.noData')}
                  </div>
                )}
              </div>
            </section>

            {/* Emotion Distribution */}
            {emotionDistribution.length > 0 && (
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">{t('stats.emotionDistribution')}</h3>
                <div className="space-y-3">
                  {emotionDistribution.map((item) => (
                    <div key={item.emotion} className="flex items-center gap-3">
                      <span className="text-xl w-8">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-600">{t(`emotion.${item.emotion}`)}</span>
                          <span className="text-sm text-slate-400">{t('stats.times', { count: item.count })}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(item.count / filteredEntries.length) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Keyword Cloud */}
            <section>
              <h3 className="font-bold text-slate-800 mb-4">{t('stats.topKeywords')}</h3>
              <div className="flex flex-wrap gap-2">
                {keywordCounts.length > 0 ? (
                  keywordCounts.slice(0, 15).map(([word, count], i) => (
                    <button
                      key={word}
                      onClick={() => setSearchQuery(word)}
                      className={`px-4 py-2 rounded-full font-medium transition-all hover:scale-105 ${
                        i < 3
                          ? 'bg-indigo-100 text-indigo-700 text-base'
                          : 'bg-slate-100 text-slate-600 text-sm'
                      }`}
                      style={{ opacity: 1 - (i * 0.04) }}
                    >
                      #{word}
                      <span className="ml-1 text-xs opacity-60">({count})</span>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic">{t('stats.noKeywords')}</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
