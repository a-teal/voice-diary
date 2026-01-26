import { Home, Calendar, BarChart2 } from "lucide-react";

type Tab = 'daily' | 'calendar' | 'stats';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-50">
      <button
        onClick={() => onTabChange('daily')}
        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${
          currentTab === 'daily' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className="w-6 h-6" strokeWidth={currentTab === 'daily' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => onTabChange('calendar')}
        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${
          currentTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Calendar className="w-6 h-6" strokeWidth={currentTab === 'calendar' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Calendar</span>
      </button>

      <button
        onClick={() => onTabChange('stats')}
        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${
          currentTab === 'stats' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <BarChart2 className="w-6 h-6" strokeWidth={currentTab === 'stats' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Stats</span>
      </button>
    </nav>
  );
}
