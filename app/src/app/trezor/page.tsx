'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useChat } from '@/lib/chat-store';
import { useMedication } from '@/lib/medication-store';
import { parents, auditLog } from '@/data/mock';
import ChatThread from '@/components/ui/ChatThread';
import ComplianceGrid from '@/components/ui/ComplianceGrid';

type Tab = 'sos' | 'leky' | 'osobni' | 'dokumenty';

export default function TrezorPage() {
  const { state } = useApp();
  const { getThread } = useChat();
  const { weekCompliance } = useMedication();
  const parent = parents[state.activeParent];
  const [activeTab, setActiveTab] = useState<Tab>('sos');
  const [openChat, setOpenChat] = useState<{ contextId: string; contextLabel: string } | null>(null);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'sos', label: 'SOS Data', icon: '🆘' },
    { id: 'leky', label: 'Léky', icon: '💊' },
    { id: 'osobni', label: 'Osobní', icon: '👤' },
    { id: 'dokumenty', label: 'Dokumenty', icon: '📁' },
  ];

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-foreground mb-1">
        Zdravotní trezor
      </h1>
      <p className="text-sm text-muted mb-4">{parent.name}</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl p-1 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all min-h-0 ${
              activeTab === tab.id
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <span className="block text-base mb-0.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* SOS Data Tab */}
      {activeTab === 'sos' && (
        <div className="space-y-4">
          <div className="bg-sos-light border border-sos/20 rounded-xl p-4">
            <h3 className="font-bold text-sos mb-3">Kritická data</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted">Krevní skupina</p>
                <p className="text-xl font-extrabold text-sos">🩸 {parent.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Pojišťovna</p>
                <p className="font-semibold">{parent.insuranceCompany}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-2">Alergie</h3>
            <div className="flex flex-wrap gap-2">
              {parent.allergies.map((a) => (
                <span key={a} className="bg-sos text-white px-3 py-1 rounded-full text-sm font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-2">Kritické diagnózy</h3>
            <ul className="space-y-1.5">
              {parent.criticalDiagnoses.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sos rounded-full" />
                  <span className="font-medium">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-2">ICE Kontakt</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{parent.iceContact.name}</p>
                <p className="text-sm text-muted">{parent.iceContact.relation}</p>
              </div>
              <a
                href={`tel:${parent.iceContact.phone}`}
                className="bg-success text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                📞 {parent.iceContact.phone}
              </a>
            </div>
          </div>

          <p className="text-xs text-muted text-center">
            Naposledy ověřeno: {new Date(parent.lastVerified).toLocaleString('cs-CZ')}
          </p>
        </div>
      )}

      {/* Medications Tab */}
      {activeTab === 'leky' && (
        <div className="space-y-4">
          {/* Weekly Compliance Grid */}
          <ComplianceGrid data={weekCompliance} />

          {/* Medication List */}
          <div className="space-y-3">
            {parent.medications.map((med) => (
              <div
                key={med.id}
                className={`bg-white rounded-xl border p-4 ${
                  med.critical ? 'border-sos/30' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{med.name}</h3>
                      {med.critical && (
                        <span className="bg-sos-light text-sos text-xs px-2 py-0.5 rounded-full font-medium">
                          Kritický
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-0.5">{med.dosage}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{med.frequency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* OCR Scan Button */}
          <Link
            href="/trezor/ocr"
            className="block w-full border-2 border-dashed border-medication/40 rounded-xl p-4 text-center hover:border-medication hover:bg-medication-light/50 transition-all"
          >
            <span className="text-lg mr-2">📸</span>
            <span className="font-semibold text-medication text-sm">Skenovat eRecept / lékařskou zprávu</span>
          </Link>

          <p className="text-xs text-muted text-center">
            Zdroj: Magic Onboarding (OCR) | Manuální korekce
          </p>
        </div>
      )}

      {/* Personal Data Tab */}
      {activeTab === 'osobni' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="space-y-3">
              {[
                { label: 'Jméno', value: parent.name },
                { label: 'Rok narození', value: parent.birthYear.toString() },
                { label: 'Rodné číslo', value: parent.personalId, sensitive: true },
                { label: 'Pojišťovna', value: parent.insuranceCompany },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <span className="text-sm text-muted">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value}</span>
                    {item.sensitive && <span className="text-xs">👁️</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit trail */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>🔍</span> Historie přístupu
            </h3>
            <div className="space-y-2">
              {auditLog.slice(0, 3).map((entry) => (
                <div key={entry.id} className="text-sm py-1 border-b border-border last:border-0">
                  <span className="font-semibold">{entry.user}</span>{' '}
                  <span className="text-muted">{entry.action} {entry.target}</span>
                  <br />
                  <span className="text-xs text-muted">
                    {new Date(entry.timestamp).toLocaleString('cs-CZ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'dokumenty' && (
        <div className="space-y-3">
          {[
            { name: 'Zpráva z kardiologie', type: 'Lékařská zpráva', date: '15.1.2024', icon: '🏥', docId: 'doc-kardiologie' },
            { name: 'eRecept – Metformin', type: 'Recept', date: '10.1.2024', icon: '💊', docId: 'doc-erecept-metformin' },
            { name: 'Rozhodnutí o PnP', type: 'Rozhodnutí úřadu', date: '5.1.2024', icon: '📋', docId: 'doc-pnp' },
            { name: 'Plná moc – lékař', type: 'Právní dokument', date: '1.1.2024', icon: '⚖️', docId: 'doc-plnamoc' },
          ].map((doc) => {
            const docThread = getThread('document', doc.docId);
            const messageCount = docThread?.messages.length ?? 0;
            return (
              <div key={doc.name} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                <span className="text-2xl">{doc.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{doc.name}</p>
                  <p className="text-xs text-muted">{doc.type} | {doc.date}</p>
                </div>
                <span className="text-muted text-xs mr-1">PDF</span>
                <button
                  onClick={() => setOpenChat({ contextId: doc.docId, contextLabel: doc.name })}
                  className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors min-h-0 min-w-0"
                  title="Diskuze k dokumentu"
                >
                  <span className="text-sm">💬</span>
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-chat text-white text-[10px] font-bold flex items-center justify-center leading-none min-h-0 min-w-0">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          <button className="w-full border-2 border-dashed border-border rounded-xl p-4 text-muted text-sm hover:border-primary hover:text-primary transition-colors">
            + Nahrát nový dokument
          </button>
        </div>
      )}

      {/* Chat Thread Overlay */}
      {openChat && (
        <ChatThread
          contextType="document"
          contextId={openChat.contextId}
          contextLabel={openChat.contextLabel}
          isOpen={true}
          onClose={() => setOpenChat(null)}
        />
      )}
    </div>
  );
}
