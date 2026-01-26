import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiaryEntry, MOODS } from "@/app/types";

interface CalendarViewProps {
  entries: DiaryEntry[];
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ entries, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate padding days for the grid
  const startDay = getDay(startOfMonth(currentMonth)); // 0 = Sunday
  const paddingDays = Array.from({ length: startDay });

  const getEntryForDay = (date: Date) => {
    return entries.find(e => isSameDay(new Date(e.createdAt), date));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 bg-white shadow-sm flex justify-between items-center">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">{format(currentMonth, "yyyy년 M월", { locale: ko })}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {paddingDays.map((_, i) => (
            <div key={`padding-${i}`} />
          ))}

          {daysInMonth.map((date) => {
            const entry = getEntryForDay(date);
            const isToday = isSameDay(date, new Date());
            
            return (
              <button
                key={date.toString()}
                onClick={() => onDateSelect(date)}
                className="flex flex-col items-center gap-1 relative h-14"
              >
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${isToday 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-700 hover:bg-slate-100"
                  }
                `}>
                  {format(date, "d")}
                </span>
                
                {entry && (
                  <span className="text-lg absolute bottom-0 filter drop-shadow-sm transform hover:scale-125 transition-transform">
                    {MOODS[entry.mood].emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
