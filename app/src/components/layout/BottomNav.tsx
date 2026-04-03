'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
const navItems = [
  { href: '/dashboard', label: 'Nástěnka', icon: '🏠' },
  { href: '/kalendar', label: 'Kalendář', icon: '📅' },
  { href: '/trezor', label: 'Rodič', icon: '👤' },
  { href: '/pruvodce', label: 'Průvodce', icon: '🧭' },
  { href: '/nastaveni', label: 'Tým', icon: '👥' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ height: '56px' }}>
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
