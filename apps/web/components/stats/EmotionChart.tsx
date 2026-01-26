'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DiaryEntry, Emotion } from '@/types';
import { EMOTION_MAP } from '@/constants/emotions';

interface EmotionChartProps {
  entries: DiaryEntry[];
  days?: number;
}

// Map emotions to numeric values for chart
const EMOTION_VALUES: Record<Emotion, number> = {
  happy: 5,
  confident: 4,
  love: 4,
  peaceful: 3,
  neutral: 2,
  thinking: 2,
  tired: 1,
  anxious: 0,
  sad: -1,
  angry: -2,
};

export default function EmotionChart({ entries, days = 7 }: EmotionChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const entry = entries.find((e) => e.date === dateStr);

      data.push({
        date: dateStr,
        day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        value: entry ? EMOTION_VALUES[entry.emotion] : null,
        emotion: entry?.emotion || null,
        emoji: entry ? EMOTION_MAP[entry.emotion].emoji : null,
      });
    }

    return data;
  }, [entries, days]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { emoji: string; day: string } }> }) => {
    if (active && payload && payload.length && payload[0].payload.emoji) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-2xl text-center">{payload[0].payload.emoji}</p>
          <p className="text-xs text-gray-500 text-center">{payload[0].payload.day}</p>
        </div>
      );
    }
    return null;
  };

  const hasData = chartData.some((d) => d.value !== null);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        아직 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
          />
          <YAxis
            domain={[-2, 5]}
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={2} stroke="#e5e7eb" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ fill: '#6366f1', strokeWidth: 0, r: 5 }}
            activeDot={{ r: 8, fill: '#6366f1' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
