'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMedication } from '@/lib/medication-store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/leky', label: 'Léky', icon: '💊' },
  { href: '/kalendar', label: 'Kalendář', icon: '📅' },
  { href: '/pruvodce', label: 'Průvodce', icon: '🧭' },
  { href: '/nastaveni', label: 'Nastavení', icon: '⚙️' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { todaySchedule } = useMedication();

  const unconfirmedCount = todaySchedule.filter(
    (e) => e.status === 'waiting' || e.status === 'escalated'
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ height: '56px' }}>
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const showBadge = item.href === '/leky' && unconfirmedCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 flex-1 text-center transition-colors min-w-0 ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="text-xl leading-none relative">
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 w-[18px] h-[18px] rounded-full bg-compliance-miss text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unconfirmedCount > 9 ? '9+' : unconfirmedCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
