import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Mic, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiaryEntry, MOODS } from "@/app/types";

interface DailyViewProps {
  entries: DiaryEntry[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onRecordClick: () => void;
}

export function DailyView({ entries, currentDate, onDateChange, onRecordClick }: DailyViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter entries for the current date
  const dayEntries = entries.filter(entry => 
    isSameDay(new Date(entry.createdAt), currentDate)
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePrevDay = () => onDateChange(subDays(currentDate, 1));
  const handleNextDay = () => onDateChange(addDays(currentDate, 1));

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={handlePrevDay} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800">{format(currentDate, "yyyy년 M월 d일", { locale: ko })}</h2>
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">{format(currentDate, "EEEE", { locale: ko })}</p>
        </div>
        <button onClick={handleNextDay} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {dayEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-40 h-40 relative">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50 blur-xl animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300" 
                alt="Book"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">No memories yet</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-[200px] mx-auto">
                Capture your day with your voice. Tap the button below.
              </p>
            </div>
          </div>
        ) : (
          dayEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl filter drop-shadow-sm">{MOODS[entry.mood].emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{MOODS[entry.mood].label}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {format(new Date(entry.createdAt), "h:mm a")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.keywords.map(kw => (
                        <span key={kw} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              <div className="bg-slate-50 rounded-xl p-4 relative">
                 <p className={`text-slate-600 text-sm leading-relaxed ${expandedId === entry.id ? "" : "line-clamp-3"}`}>
                   {entry.text}
                 </p>
                 <button 
                   onClick={() => toggleExpand(entry.id)}
                   className="w-full flex justify-center mt-2 text-indigo-500 hover:text-indigo-700"
                 >
                   {expandedId === entry.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </button>
              </div>

              <audio controls src={entry.audioUrl} className="w-full mt-4 h-8" />
              
            </motion.div>
          ))
        )}
      </main>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRecordClick}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center z-20"
      >
        <Mic className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
