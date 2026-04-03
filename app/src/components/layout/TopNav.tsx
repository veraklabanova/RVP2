'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { useNotifications } from '@/lib/notification-store';
import NotificationBadge from '@/components/ui/NotificationBadge';

const sectionNames: Record<string, string> = {
  '/dashboard': 'Nástěnka',
  '/kalendar': 'Kalendář',
  '/trezor': 'Rodič',
  '/pruvodce': 'Průvodce',
  '/nastaveni': 'Tým',
  '/notifikace': 'Upozornění',
  '/sos': 'SOS',
};

export default function TopNav() {
  const pathname = usePathname();
  const { state, setActiveParent } = useApp();
  const { state: notifState } = useNotifications();
  const sectionTitle = Object.entries(sectionNames).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm" style={{ height: '56px' }}>
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        {/* Left: Parent Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {state.activeParent === 'mama' ? 'J' : 'F'}
          </div>
          <select
            value={state.activeParent}
            onChange={(e) => setActiveParent(e.target.value as 'mama' | 'tata')}
            className="h-8 px-1 rounded-lg bg-transparent text-sm font-medium text-foreground min-w-0 border-none focus:outline-none"
          >
            <option value="mama">Maminka</option>
            <option value="tata">Tatínek</option>
          </select>
        </div>

        {/* Center: Section title */}
        <span className="text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
          {sectionTitle}
        </span>

        {/* Right: SOS + Notifications */}
        <div className="flex items-center gap-1.5">
          {/* SOS Button (PAB f1 6.0) */}
          <Link
            href="/sos"
            className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-sos text-white text-xs font-bold hover:bg-sos/90 transition-colors min-h-0 min-w-0"
          >
            SOS
          </Link>

          {/* Notification Bell */}
          <Link
            href="/notifikace"
            className="relative flex items-center justify-center h-10 w-10 rounded-lg text-lg hover:bg-surface transition-colors min-h-0 min-w-0"
          >
            <span role="img" aria-label="Upozornění">🔔</span>
            <NotificationBadge count={notifState.unreadCount} />
          </Link>
        </div>
      </div>
    </header>
  );
}
