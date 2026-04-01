'use client';

import { useState, useRef } from 'react';
import { useNotifications } from '@/lib/notification-store';
import type { Notification, NotificationCategory } from '@/lib/types';

type FilterTab = 'all' | NotificationCategory;

const categoryConfig: Record<NotificationCategory, {
  stripe: string;
  bg: string;
  icon: string;
  label: string;
  chipIcon: string;
}> = {
  leky: { stripe: 'border-l-medication', bg: 'bg-medication-light', icon: '💊', label: 'Léky', chipIcon: '🟣' },
  kalendar: { stripe: 'border-l-primary', bg: 'bg-admin-light', icon: '📅', label: 'Kalendář', chipIcon: '🔵' },
  rodina: { stripe: 'border-l-success', bg: 'bg-success-light', icon: '👥', label: 'Rodina', chipIcon: '🟢' },
  system: { stripe: 'border-l-external', bg: 'bg-external-light', icon: '⚙️', label: 'Systém', chipIcon: '⚫' },
};

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Vše' },
  { key: 'leky', label: '🟣 Léky' },
  { key: 'kalendar', label: '🔵 Kalendář' },
  { key: 'rodina', label: '🟢 Rodina' },
  { key: 'system', label: '⚫ Systém' },
];

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'právě teď';
  if (diffMin < 60) return `před ${diffMin} min`;
  if (diffHours < 24) return `před ${diffHours} h`;
  if (diffDays < 7) return `před ${diffDays} d`;
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

// Swipe right action labels based on notification category
function getSwipeRightAction(notification: Notification): string | null {
  if (notification.category === 'leky' && notification.priority === 'high') return 'Potvrdit za rodiče';
  if (notification.category === 'rodina') return 'Otevřít vlákno';
  if (notification.actionUrl) return 'Zobrazit detail';
  return null;
}

export default function NotifikacePage() {
  const { state, markRead, markAllRead, archiveNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh simulation (R8)
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const visibleNotifications = state.notifications
    .filter((n) => !n.archived)
    .filter((n) => activeFilter === 'all' || n.category === activeFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Upozornění</h1>
        <button
          onClick={markAllRead}
          className="text-xs text-primary font-semibold hover:underline min-h-0 min-w-0 px-2 py-1"
        >
          Označit vše jako přečtené
        </button>
      </div>

      {/* Pull-to-refresh indicator (R8) */}
      {refreshing && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="animate-spin text-primary">⟳</span>
          <span className="text-xs text-muted">Synchronizuji...</span>
        </div>
      )}

      {/* Pull-to-refresh trigger */}
      <button
        onClick={handleRefresh}
        className="w-full text-center text-xs text-muted py-1 min-h-0 hover:text-primary transition-colors"
      >
        ↓ Tažením dolů obnovíte seznam
      </button>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-0 min-w-0 ${
              activeFilter === tab.key
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {visibleNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <span className="text-4xl block mb-3">🔔</span>
          <p className="text-muted text-sm">Žádná nová upozornění.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={markRead}
              onArchive={archiveNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
}

function NotificationCard({ notification, onRead, onArchive }: NotificationCardProps) {
  const config = categoryConfig[notification.category];
  const touchStartX = useRef<number>(0);
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const swipeRightAction = getSwipeRightAction(notification);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - touchStartX.current;
    setTranslateX(delta);
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (translateX < -100) {
      // Swipe left → archive
      onArchive(notification.id);
    } else if (translateX > 100 && swipeRightAction) {
      // Swipe right → primary action (R9)
      if (!notification.read) onRead(notification.id);
    }
    setTranslateX(0);
  };

  const handleTap = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  const isUrgent = notification.priority === 'high' && !notification.read;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Archive background (swipe left) */}
      <div className="absolute inset-0 bg-compliance-miss flex items-center justify-end pr-4 rounded-xl">
        <span className="text-white text-sm font-semibold">Archivovat</span>
      </div>
      {/* Action background (swipe right - R9) */}
      {swipeRightAction && translateX > 0 && (
        <div className="absolute inset-0 bg-primary flex items-center justify-start pl-4 rounded-xl">
          <span className="text-white text-sm font-semibold">{swipeRightAction}</span>
        </div>
      )}

      {/* Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
        className={`relative bg-white rounded-xl border border-border border-l-4 p-4 cursor-pointer transition-colors hover:bg-surface/50 ${config.stripe}`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center text-base flex-shrink-0 min-h-0 min-w-0`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-sm ${notification.read ? 'font-medium' : 'font-bold'} text-foreground truncate`}>
                {notification.title}
              </span>
              {!notification.read && (
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? 'bg-compliance-miss' : 'bg-primary'}`} />
              )}
            </div>
            <p className="text-xs text-muted line-clamp-2">{notification.body}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} font-medium`}>
                {config.label}
              </span>
              <span className="text-[10px] text-muted">
                {formatRelativeTime(notification.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
