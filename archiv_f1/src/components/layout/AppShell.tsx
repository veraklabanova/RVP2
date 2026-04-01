'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { AppContext, defaultAppState } from '@/lib/store';
import type { AppState, ParentId } from '@/lib/types';

const noShellRoutes = ['/onboarding', '/sos'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideShell = noShellRoutes.some((r) => pathname.startsWith(r));

  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rvp-state');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return defaultAppState;
  });

  const setActiveParent = (id: ParentId) => {
    setState((prev) => {
      const next = { ...prev, activeParent: id };
      localStorage.setItem('rvp-state', JSON.stringify(next));
      return next;
    });
  };

  const completeOnboarding = () => {
    setState((prev) => {
      const next = { ...prev, isOnboarded: true };
      localStorage.setItem('rvp-state', JSON.stringify(next));
      return next;
    });
  };

  if (pathname === '/' || (pathname === '/onboarding' && !state.isOnboarded)) {
    return (
      <AppContext value={{ state, setActiveParent, completeOnboarding }}>
        {children}
      </AppContext>
    );
  }

  return (
    <AppContext value={{ state, setActiveParent, completeOnboarding }}>
      {!hideShell && <TopNav />}
      <main className={hideShell ? '' : 'pt-14 pb-20'}>
        <div className="max-w-lg mx-auto">{children}</div>
      </main>
      {!hideShell && <BottomNav />}
    </AppContext>
  );
}
