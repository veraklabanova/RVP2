'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useMedication } from '@/lib/medication-store';
import { useChat } from '@/lib/chat-store';
import { parents } from '@/data/mock';
import ChatThread from '@/components/ui/ChatThread';
import ComplianceGrid from '@/components/ui/ComplianceGrid';

type Tab = 'dnes' | 'plan' | 'compliance';

const timeGroups: Record<string, string> = {
  '08:00': 'Ráno (8:00)',
  '12:00': 'Poledne (12:00)',
  '19:00': 'Večer (19:00)',
  '20:00': 'Večer (20:00)',
  '22:00': 'Noc (22:00)',
};

function getTimeGroup(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 11) return 'Ráno';
  if (hour < 15) return 'Poledne';
  if (hour < 21) return 'Večer';
  return 'Noc';
}

const statusConfig = {
  waiting: { icon: '○', bg: '', label: 'Čeká' },
  taken: { icon: '✓', bg: 'bg-success-light', label: 'Potvrzeno' },
  missed: { icon: '✕', bg: 'bg-sos-light', label: 'Vynecháno' },
  escalated: { icon: '⚠', bg: 'bg-sos-light', label: 'Eskalováno' },
  confirmed_by_carer: { icon: '✓👤', bg: 'bg-success-light', label: 'Potvrzeno pečujícím' },
};

export default function LekyPage() {
  const { state } = useApp();
  const { todaySchedule, weekCompliance, confirmMedication, skipMedication } = useMedication();
  const { getThread } = useChat();
  const parent = parents[state.activeParent];
  const [activeTab, setActiveTab] = useState<Tab>('dnes');
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null);
  const [openChat, setOpenChat] = useState<{ contextId: string; contextLabel: string } | null>(null);

  // Group by time
  const grouped = todaySchedule.reduce<Record<string, typeof todaySchedule>>((acc, entry) => {
    const group = getTimeGroup(entry.scheduledTime);
    if (!acc[group]) acc[group] = [];
    acc[group].push(entry);
    return acc;
  }, {});

  const handleConfirmForParent = (entryId: string) => {
    confirmMedication(entryId, 'Pečující');
    setConfirmDialog(null);
  };

  // Escalation banner
  const escalatedMeds = todaySchedule.filter((e) => e.status === 'escalated' || (e.status === 'waiting'));
  const hasEscalation = todaySchedule.some((e) => e.status === 'escalated');

  // Compliance rate
  const totalEntries = weekCompliance.flatMap((d) => d.entries);
  const takenCount = totalEntries.filter((e) => e.status === 'taken').length;
  const resolvedCount = totalEntries.filter((e) => e.status === 'taken' || e.status === 'missed').length;
  const complianceRate = resolvedCount > 0 ? Math.round((takenCount / resolvedCount) * 100) : 0;

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Segment control */}
      <div className="flex bg-surface rounded-xl p-1 gap-1">
        {([
          { key: 'dnes', label: 'Dnes' },
          { key: 'plan', label: 'Lékový plán' },
          { key: 'compliance', label: 'Compliance' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-0 ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Escalation banner */}
      {hasEscalation && activeTab === 'dnes' && (
        <div className="bg-sos-light border border-sos/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠</span>
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
              className="flex-1 bg-compliance-ok text-white rounded-lg py-2 text-sm font-semibold"
            >
              Potvrdit za rodiče
            </button>
            <a
              href={`tel:${parent.iceContact.phone}`}
              className="flex-1 bg-sos text-white rounded-lg py-2 text-sm font-semibold text-center"
            >
              Zavolat
            </a>
          </div>
        </div>
      )}

      {/* Tab: Dnes */}
      {activeTab === 'dnes' && (
        <div className="space-y-5">
          {Object.entries(grouped).map(([group, entries]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-muted mb-2">{group}</h3>
              <div className="space-y-2">
                {entries.map((entry) => {
                  const st = statusConfig[entry.status] || statusConfig.waiting;
                  const thread = getThread('medication', entry.medicationId);
                  const msgCount = thread?.messages.length ?? 0;
                  const canConfirm = entry.status === 'waiting' || entry.status === 'escalated';

                  return (
                    <div
                      key={entry.id}
                      className={`bg-white rounded-xl border border-border border-l-4 border-l-medication p-4 ${st.bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base">{entry.medicationName}</p>
                          <p className="text-sm text-muted">{entry.dosage}</p>
                          {entry.note && (
                            <p className="text-xs italic text-muted mt-0.5">{entry.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Chat icon */}
                          <button
                            onClick={() => setOpenChat({ contextId: entry.medicationId, contextLabel: entry.medicationName })}
                            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors min-h-0 min-w-0"
                          >
                            <span className="text-sm">💬</span>
                            {msgCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full bg-chat text-white text-[9px] font-bold flex items-center justify-center">
                                {msgCount}
                              </span>
                            )}
                          </button>
                          {/* Status */}
                          <span className={`text-lg ${
                            entry.status === 'taken' || entry.status === 'confirmed_by_carer' ? 'text-compliance-ok' :
                            entry.status === 'missed' || entry.status === 'escalated' ? 'text-compliance-miss' :
                            'text-external'
                          }`}>
                            {st.icon}
                          </span>
                        </div>
                      </div>
                      {/* Confirm for parent button (R2) */}
                      {canConfirm && (
                        <button
                          onClick={() => setConfirmDialog(entry.id)}
                          className="mt-3 w-full bg-compliance-ok/10 border border-compliance-ok/30 text-compliance-ok rounded-lg py-2 text-sm font-semibold hover:bg-compliance-ok/20 transition-colors"
                        >
                          Potvrdit za rodiče
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {todaySchedule.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">💊</span>
              <p className="font-bold mb-1">Zatím žádné léky</p>
              <p className="text-sm text-muted">Přidejte první lék.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Lékový plán */}
      {activeTab === 'plan' && (
        <div className="space-y-2">
          {parent.medications.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-xl border border-border border-l-4 border-l-medication p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{med.name}</p>
                  <p className="text-sm text-muted">{med.dosage} · {med.frequency}</p>
                  {med.note && <p className="text-xs italic text-muted mt-0.5">{med.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {med.nightEscalation && (
                    <span title="Noční eskalace zapnuta" className="text-lg">🌙</span>
                  )}
                  <span className="text-muted">→</span>
                </div>
              </div>
            </div>
          ))}
          {parent.medications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted">Zatím žádné léky v plánu.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Compliance */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <ComplianceGrid data={weekCompliance} />
          {/* Legend (R11) */}
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-compliance-ok inline-block" /> Vše podáno</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-compliance-miss inline-block" /> Vynechán lék</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-external inline-block" /> Budoucí</span>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <p className="text-sm text-muted">Tento měsíc</p>
            <p className="text-2xl font-bold text-foreground">{complianceRate} %</p>
            <p className="text-xs text-muted">compliance</p>
          </div>
        </div>
      )}

      {/* FAB - Add medication */}
      <Link
        href="/leky"
        className="fixed bottom-20 right-4 w-14 h-14 bg-medication text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-medication/90 transition-colors z-40"
        title="Přidat lék"
      >
        +
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
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 border border-border rounded-lg py-3 text-sm font-medium text-muted"
              >
                Zrušit
              </button>
              <button
                onClick={() => handleConfirmForParent(confirmDialog)}
                className="flex-1 bg-compliance-ok text-white rounded-lg py-3 text-sm font-bold"
              >
                Potvrdit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat overlay */}
      {openChat && (
        <ChatThread
          contextType="medication"
          contextId={openChat.contextId}
          contextLabel={openChat.contextLabel}
          isOpen={true}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  );
}
