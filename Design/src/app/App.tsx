import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { BottomNav } from "@/app/components/layout/BottomNav";
import { DailyView } from "@/app/components/views/DailyView";
import { CalendarView } from "@/app/components/views/CalendarView";
import { StatsView } from "@/app/components/views/StatsView";
import { RecordingModal } from "@/app/components/modals/RecordingModal";
import { DiaryEntry } from "@/app/types";
import { format } from "date-fns";

type Tab = 'daily' | 'calendar' | 'stats';

// Mock Initial Data
const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    audioUrl: "", // Mock
    createdAt: new Date().toISOString(),
    duration: 45,
    text: "I had a wonderful coffee with Sarah today. We talked about our upcoming trip to Japan. I'm feeling really excited but also a bit nervous about the flight.",
    mood: "happy",
    keywords: ["Coffee", "Friend", "Travel"]
  },
  {
    id: "2",
    audioUrl: "",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    duration: 120,
    text: "Work was super stressful. The deadline is approaching and I feel like I'm not making enough progress. I need to sleep earlier tonight.",
    mood: "anxious",
    keywords: ["Work", "Deadline", "Sleep"]
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('daily');
  const [entries, setEntries] = useState<DiaryEntry[]>(INITIAL_ENTRIES);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  
  // Daily View specific state
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSaveEntry = (newEntryData: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...newEntryData,
      id: crypto.randomUUID(),
    };
    setEntries(prev => [newEntry, ...prev]);
    
    // Switch to daily view and today's date to see the new entry
    setCurrentTab('daily');
    setCurrentDate(new Date());
  };

  const handleDateSelectFromCalendar = (date: Date) => {
    setCurrentDate(date);
    setCurrentTab('daily');
  };

  return (
    <div className="bg-slate-200 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full h-screen bg-slate-50 flex flex-col md:rounded-[40px] md:h-[850px] md:w-[400px] md:mx-auto md:my-10 md:overflow-hidden shadow-2xl relative border border-slate-300">
        
        {/* Main View Area */}
        <div className="flex-1 overflow-hidden relative">
          {currentTab === 'daily' && (
            <DailyView 
              entries={entries} 
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onRecordClick={() => setIsRecordingModalOpen(true)}
            />
          )}
          
          {currentTab === 'calendar' && (
            <CalendarView 
              entries={entries}
              onDateSelect={handleDateSelectFromCalendar}
            />
          )}

          {currentTab === 'stats' && (
            <StatsView entries={entries} />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Recording Modal (Global) */}
        <RecordingModal 
          isOpen={isRecordingModalOpen}
          onClose={() => setIsRecordingModalOpen(false)}
          onSave={handleSaveEntry}
        />
        
      </div>
      <Toaster position="top-center" richColors theme="light" />
    </div>
  );
}
