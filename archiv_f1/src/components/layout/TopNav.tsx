'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';

export default function TopNav() {
  const { state, setActiveParent } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <Link href="/dashboard" className="font-bold text-primary text-lg min-h-0 min-w-0">
          Rodiče v péči
        </Link>

        <div className="flex items-center gap-2">
          {/* Parent Switcher */}
          <select
            value={state.activeParent}
            onChange={(e) => setActiveParent(e.target.value as 'mama' | 'tata')}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-sm font-medium text-foreground min-w-0"
          >
            <option value="mama">Maminka</option>
            <option value="tata">Tatínek</option>
          </select>

          {/* SOS Button */}
          <Link
            href="/sos"
            className="flex items-center justify-center h-10 px-4 bg-sos text-white rounded-lg font-bold text-sm hover:bg-red-800 transition-colors"
          >
            SOS
          </Link>
        </div>
      </div>
    </header>
  );
}
