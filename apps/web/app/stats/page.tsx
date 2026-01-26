'use client';

import { useState, useEffect, useMemo } from 'react';
import { subDays, isAfter, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import BottomNav from '@/components/layout/BottomNav';
import { DiaryEntry, Emotion } from '@/types';
import { getAllEntries } from '@/lib/storage';
import { EMOTION_MAP, MOOD_VALUES } from '@/constants/emotions';

export default function StatsPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);

  useEffect(() => {
    const allEntries = getAllEntries();
    setEntries(allEntries.sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const filteredEntries = useMemo(() => {
    const startDate = subDays(new Date(), period);
    return entries
      .filter(e => isAfter(new Date(e.createdAt), startDate))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [entries, period]);

  const chartData = useMemo(() => {
    return filteredEntries.map(entry => ({
      date: format(new Date(entry.createdAt), "MM/dd"),
      value: MOOD_VALUES[entry.emotion] || 3,
      emoji: EMOTION_MAP[entry.emotion].emoji,
    }));
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
    filteredEntries.forEach(e => counts[e.emotion] = (counts[e.emotion] || 0) + 1);
    const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Emotion;
    return EMOTION_MAP[topMood];
  }, [filteredEntries]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-y-auto">
      <header className="px-6 pt-12 pb-6 bg-white shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Mood Analysis</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full">
          {[7, 30].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as 7 | 30)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === p
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Last {p} Days
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-8 pb-24">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📊</p>
            <p className="text-slate-500">No entries yet</p>
            <p className="text-slate-400 text-sm mt-2">
              Record your first diary to see stats
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6">Mood Flow</h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis hide domain={[0, 6]} />
                      <Tooltip
                        content={({ payload }) => {
                          if (payload && payload.length) {
                            return (
                              <div className="bg-white p-2 shadow-lg rounded-lg border text-2xl">
                                {payload[0].payload.emoji}
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
                        dot={{ r: 4, fill: "#6366f1" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    Not enough data yet
                  </div>
                )}
              </div>
            </section>

            {/* Summary Cards */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Entries</h4>
                <p className="text-3xl font-bold text-slate-900">{filteredEntries.length}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Top Mood</h4>
                {mostFrequentMood ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mostFrequentMood.emoji}</span>
                    <span className="font-semibold text-slate-700">{mostFrequentMood.label}</span>
                  </div>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>
            </section>

            {/* Keyword Cloud */}
            <section>
              <h3 className="font-bold text-slate-800 mb-4">Top Topics</h3>
              <div className="flex flex-wrap gap-2">
                {keywordCounts.length > 0 ? (
                  keywordCounts.slice(0, 10).map(([word, count], i) => (
                    <span
                      key={word}
                      className={`px-4 py-2 rounded-full font-medium ${
                        i < 3
                          ? "bg-indigo-100 text-indigo-700 text-base"
                          : "bg-slate-100 text-slate-600 text-sm"
                      }`}
                      style={{ opacity: 1 - (i * 0.05) }}
                    >
                      #{word}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic">No keywords analyzed yet</p>
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
