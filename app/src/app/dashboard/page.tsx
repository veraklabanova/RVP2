'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useChat } from '@/lib/chat-store';
import { useMedication } from '@/lib/medication-store';
import { tasks, calendarEvents, parents } from '@/data/mock';
import ChatThread from '@/components/ui/ChatThread';

const statusIcon: Record<string, { icon: string; color: string }> = {
  waiting: { icon: '○', color: 'text-external' },
  taken: { icon: '✓', color: 'text-compliance-ok' },
  missed: { icon: '✕', color: 'text-compliance-miss' },
  escalated: { icon: '⚠', color: 'text-compliance-miss' },
  confirmed_by_carer: { icon: '✓', color: 'text-compliance-ok' },
};

export default function DashboardPage() {
  const { state } = useApp();
  const { threads } = useChat();
  const { todaySchedule, weekCompliance, confirmMedication, skipMedication } = useMedication();
  const parent = parents[state.activeParent];
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [openChat, setOpenChat] = useState<{ contextType: string; contextId: string; contextLabel: string } | null>(null);

  const hasEscalation = todaySchedule.some((e) => e.status === 'escalated');

  // Events for today/tomorrow
  const upcomingEvents = calendarEvents
    .filter((e) => e.parentId === state.activeParent)
    .slice(0, 3);

  // Recent chat messages
  const recentThreads = [...threads]
    .filter((t) => t.messages.length > 0)
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 2);

  // Compliance mini
  const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const complianceDays = weekCompliance.slice(0, 7);
  const totalEntries = weekCompliance.flatMap((d) => d.entries);
  const takenCount = totalEntries.filter((e) => e.status === 'taken').length;
  const resolvedCount = totalEntries.filter((e) => e.status === 'taken' || e.status === 'missed').length;
  const complianceRate = resolvedCount > 0 ? Math.round((takenCount / resolvedCount) * 100) : 0;

  const handleConfirmForParent = (entryId: string) => {
    confirmMedication(entryId, 'Pečující');
    setConfirmDialog(null);
  };

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Trial Banner */}
      {state.subscriptionTier === 'trial' && (
        <div className="bg-warning-light border border-warning/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Zkušební doba: {state.trialDaysLeft} dní</p>
            <p className="text-xs text-muted">Všechny funkce odemčeny</p>
          </div>
        </div>
      )}

      {/* Card 1: Dnešní léky (P0) */}
      <div className="bg-white rounded-xl border border-border border-l-4 border-l-medication p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-medication">💊</span> Dnešní léky
          </h2>
          <Link href="/leky" className="text-xs text-medication font-medium min-h-0 min-w-0">
            Zobrazit vše →
          </Link>
        </div>

        {/* Escalation banner */}
        {hasEscalation && (
          <div className="bg-sos-light rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span>⚠</span>
              <span className="font-bold text-sos text-sm">
                {parent.name} nepotvrdil/a lék. Zavolejte.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const esc = todaySchedule.find((e) => e.status === 'escalated');
                  if (esc) setConfirmDialog(esc.id);
                }}
                className="flex-1 bg-compliance-ok text-white rounded-lg py-2 text-xs font-semibold"
              >
                Potvrdit za rodiče
              </button>
              <a
                href={`tel:${parent.iceContact.phone}`}
                className="flex-1 bg-sos text-white rounded-lg py-2 text-xs font-semibold text-center"
              >
                Zavolat
              </a>
            </div>
          </div>
        )}

        {todaySchedule.length === 0 ? (
          <p className="text-sm text-muted">Dnes žádné léky k potvrzení</p>
        ) : (
          <div className="space-y-1.5">
            {todaySchedule.map((entry) => {
              const st = statusIcon[entry.status] || statusIcon.waiting;
              return (
                <div key={entry.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm text-muted font-mono w-12">{entry.scheduledTime}</span>
                  <span className="text-sm flex-1">{entry.medicationName}</span>
                  <span className={`text-base ${st.color}`}>{st.icon}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 2: Nadcházející termíny (P1) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">📅</span> Dnes a zítra
          </h2>
          <Link href="/kalendar" className="text-xs text-primary font-medium min-h-0 min-w-0">
            Kalendář →
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted">Žádné termíny na dnes ani zítra.</p>
        ) : (
          <div className="space-y-1.5">
            {upcomingEvents.map((event) => {
              const dotColor = event.category === 'medical' ? 'bg-medication' :
                event.category === 'admin' ? 'bg-primary' : 'bg-external';
              return (
                <div key={event.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm text-muted font-mono w-12">{event.time || '—'}</span>
                  <span className="text-sm flex-1">{event.title}</span>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 3: Chat Quick-Feed (P1) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-chat">💬</span> Rodinná komunikace
          </h2>
          <Link href="/chat" className="text-xs text-chat font-medium min-h-0 min-w-0">
            Chat inbox →
          </Link>
        </div>
        {recentThreads.length === 0 ? (
          <p className="text-sm text-muted">
            Zatím žádné konverzace. Začněte diskuzi u libovolného léku, úkolu nebo dokumentu.
          </p>
        ) : (
          <div className="space-y-2">
            {recentThreads.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              if (!lastMsg) return null;
              return (
                <button
                  key={thread.id}
                  onClick={() => setOpenChat({
                    contextType: thread.contextType,
                    contextId: thread.contextId,
                    contextLabel: thread.contextLabel,
                  })}
                  className="w-full flex items-center gap-3 text-left hover:bg-surface/50 rounded-lg p-1.5 transition-colors min-h-0"
                >
                  <div className="w-7 h-7 rounded-full bg-chat-light flex items-center justify-center text-xs font-bold text-chat flex-shrink-0">
                    {lastMsg.senderName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-semibold">{lastMsg.senderName}:</span>{' '}
                      <span className="text-muted">{lastMsg.text.slice(0, 50)}{lastMsg.text.length > 50 ? '...' : ''}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 4: Compliance mini-přehled (P0) */}
      <Link href="/leky" className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <span>📊</span>
          <h2 className="font-bold text-foreground">Tento týden</h2>
        </div>
        <div className="flex justify-between mb-2">
          {complianceDays.map((day, i) => {
            const allTaken = day.entries.every((e) => e.status === 'taken');
            const hasMissed = day.entries.some((e) => e.status === 'missed');
            const isFuture = day.entries.every((e) => e.status === 'waiting');
            const color = isFuture ? 'bg-external' : allTaken ? 'bg-compliance-ok' : hasMissed ? 'bg-compliance-miss' : 'bg-compliance-ok';
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted">{days[i] || ''}</span>
                <div className={`w-8 h-8 rounded-md ${color}`} />
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted">Compliance: {complianceRate} %</p>
        {/* Legend (R11) */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-compliance-ok inline-block" /> Vše podáno</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-compliance-miss inline-block" /> Vynechán lék</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-external inline-block" /> Budoucí</span>
        </div>
      </Link>

      {/* Confirm dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Potvrdit podání léku</h3>
            <p className="text-sm text-muted mb-4">
              Potvrzujete, že {parent.name} vzal/a lék{' '}
              <strong>{todaySchedule.find((e) => e.id === confirmDialog)?.medicationName}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 border border-border rounded-lg py-3 text-sm font-medium text-muted">
                Zrušit
              </button>
              <button onClick={() => handleConfirmForParent(confirmDialog)} className="flex-1 bg-compliance-ok text-white rounded-lg py-3 text-sm font-bold">
                Potvrdit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat overlay */}
      {openChat && (
        <ChatThread
          contextType={openChat.contextType as 'task' | 'medication' | 'event' | 'document'}
          contextId={openChat.contextId}
          contextLabel={openChat.contextLabel}
          isOpen={true}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  );
}
