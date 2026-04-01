'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { useChat } from '@/lib/chat-store';
import { calendarEvents, externalCalendarEvents, calendarSources } from '@/data/mock';
import ChatThread from '@/components/ui/ChatThread';
import SyncIndicator from '@/components/ui/SyncIndicator';

type ViewMode = 'agenda' | 'month';

const categoryStyles: Record<string, { dot: string; badge: string; label: string }> = {
  medical: { dot: 'bg-medical', badge: 'bg-sos-light text-medical', label: 'Lékař' },
  admin: { dot: 'bg-admin', badge: 'bg-admin-light text-admin', label: 'Úřad' },
  operational: { dot: 'bg-success', badge: 'bg-success-light text-success', label: 'Provoz' },
  external: { dot: 'bg-external', badge: 'bg-external-light text-external', label: 'Externí' },
};

const daysInMonth = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, null, null],
];

export default function KalendarPage() {
  const { state } = useApp();
  const { getThread } = useChat();
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [openChat, setOpenChat] = useState<{ contextId: string; contextLabel: string } | null>(null);
  const [showExternal, setShowExternal] = useState(false);

  const connectedSource = calendarSources.find((s) => s.connected);

  const parentEvents = calendarEvents.filter((e) => e.parentId === state.activeParent);
  const sortedEvents = [...parentEvents].sort((a, b) => {
    const da = new Date(a.date + (a.time ? `T${a.time}` : ''));
    const db = new Date(b.date + (b.time ? `T${b.time}` : ''));
    return da.getTime() - db.getTime();
  });

  const eventsByDay = parentEvents.reduce<Record<number, typeof calendarEvents>>((acc, e) => {
    const day = new Date(e.date).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  // Merge external events when toggle is on
  const externalMapped = showExternal
    ? externalCalendarEvents.map((ext) => ({
        id: ext.id,
        title: ext.title,
        date: ext.date,
        time: ext.time || '',
        category: 'external' as const,
        parentId: state.activeParent,
        isExternal: true,
      }))
    : [];

  const allEvents = [...sortedEvents, ...externalMapped].sort((a, b) => {
    const da = new Date(a.date + (a.time ? `T${a.time}` : ''));
    const db = new Date(b.date + (b.time ? `T${b.time}` : ''));
    return da.getTime() - db.getTime();
  });

  const filteredEvents = selectedDay
    ? allEvents.filter((e) => new Date(e.date).getDate() === selectedDay)
    : allEvents;

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kalendář péče</h1>
          <p className="text-sm text-muted">Leden 2024</p>
        </div>
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => { setViewMode('agenda'); setSelectedDay(null); }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-0 min-w-0 ${
              viewMode === 'agenda' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-0 min-w-0 ${
              viewMode === 'month' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
            }`}
          >
            Měsíc
          </button>
        </div>
      </div>

      {/* Category legend + External toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {Object.entries(categoryStyles).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              <span className="text-xs text-muted">{style.label}</span>
            </div>
          ))}
        </div>
        {connectedSource && (
          <div className="flex items-center gap-2">
            <SyncIndicator status={connectedSource.syncStatus} />
            <button
              onClick={() => setShowExternal(!showExternal)}
              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors min-h-0 min-w-0 ${
                showExternal
                  ? 'bg-external text-white'
                  : 'bg-external-light text-external border border-external/30'
              }`}
            >
              {showExternal ? '📅 Externí' : '📅 Externí'}
            </button>
          </div>
        )}
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-border p-3">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
              <div key={d} className="text-xs font-medium text-muted py-1">{d}</div>
            ))}
          </div>
          {daysInMonth.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const dayEvents = day ? eventsByDay[day] : undefined;
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={di}
                    onClick={() => day && setSelectedDay(isSelected ? null : day)}
                    disabled={!day}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative min-h-0 min-w-0 ${
                      !day ? '' :
                      isSelected ? 'bg-primary text-white font-bold' :
                      'hover:bg-surface'
                    }`}
                  >
                    {day && (
                      <>
                        <span>{day}</span>
                        {dayEvents && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <span
                                key={i}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected ? 'bg-white' : categoryStyles[e.category].dot
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Agenda View */}
      <div className="space-y-2">
        {selectedDay && filteredEvents.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted">Žádné události pro tento den.</p>
          </div>
        )}
        {filteredEvents.map((event) => {
          const isExt = 'isExternal' in event && event.isExternal;
          const style = categoryStyles[event.category] || categoryStyles.external;
          const eventThread = !isExt ? getThread('event', event.id) : null;
          const messageCount = eventThread?.messages.length ?? 0;
          return (
            <div
              key={event.id}
              className={`rounded-xl border-l-4 p-4 ${
                isExt
                  ? 'bg-external-light border border-dashed border-external/40 border-l-external'
                  : `bg-white border border-border ${
                      event.category === 'medical' ? 'border-l-medical' :
                      event.category === 'admin' ? 'border-l-admin' : 'border-l-success'
                    }`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-sm ${isExt ? 'text-external' : ''}`}>{event.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.time && (
                    <span className={`text-sm font-semibold ${isExt ? 'text-external' : 'text-foreground'}`}>{event.time}</span>
                  )}
                  {!isExt && (
                    <button
                      onClick={() => setOpenChat({ contextId: event.id, contextLabel: event.title })}
                      className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors min-h-0 min-w-0"
                      title="Diskuze k události"
                    >
                      <span className="text-sm">💬</span>
                      {messageCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-chat text-white text-[10px] font-bold flex items-center justify-center leading-none min-h-0 min-w-0">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add event button */}
      <button className="w-full border-2 border-dashed border-border rounded-xl p-4 text-muted text-sm hover:border-primary hover:text-primary transition-colors">
        + Přidat událost
      </button>

      {/* Chat Thread Overlay */}
      {openChat && (
        <ChatThread
          contextType="event"
          contextId={openChat.contextId}
          contextLabel={openChat.contextLabel}
          isOpen={true}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  );
}
