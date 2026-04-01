'use client';

import type { SyncStatus } from '@/lib/types';

const statusStyles: Record<SyncStatus, { color: string; animate?: string; title: string }> = {
  synced: { color: 'bg-compliance-ok', title: 'Synchronizováno' },
  error: { color: 'bg-compliance-miss', title: 'Chyba synchronizace' },
  syncing: { color: 'bg-admin', animate: 'animate-pulse', title: 'Synchronizuji...' },
  none: { color: 'bg-external', title: 'Nepřipojeno' },
};

export default function SyncIndicator({ status }: { status: SyncStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${style.color} ${style.animate || ''}`}
      title={style.title}
    />
  );
}
