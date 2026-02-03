'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { href: '/', labelKey: 'nav.home', Icon: Home },
  { href: '/calendar', labelKey: 'nav.calendar', Icon: Calendar },
  { href: '/stats', labelKey: 'nav.stats', Icon: BarChart2 },
  { href: '/settings', labelKey: 'nav.settings', Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-50 safe-bottom">
      {navItems.map(({ href, labelKey, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
