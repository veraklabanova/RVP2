'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { parents } from '@/data/mock';

export default function SOSPage() {
  const { state } = useApp();
  const parent = parents[state.activeParent];
  const [showQR, setShowQR] = useState(false);
  const [showAllMeds, setShowAllMeds] = useState(false);
  const criticalMeds = parent.medications.filter((m) => m.critical);
  const displayMeds = showAllMeds ? parent.medications : criticalMeds.slice(0, 3);

  return (
    <div className="min-h-screen sos-mode">
      {/* Header */}
      <div className="bg-sos text-white px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-medium text-sm min-h-0">
            ← Zpět
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Dostupné offline</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Verification timestamp */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted">
          <span>🌐</span>
          <span>
            Ověřeno: {new Date(parent.lastVerified).toLocaleDateString('cs-CZ')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-extrabold text-sos uppercase tracking-wide mb-6">
          Karta pro záchrannou službu
        </h1>

        {/* Patient Identity */}
        <div className="bg-white rounded-xl border-2 border-sos/20 p-5 mb-4 text-center">
          <h2 className="text-2xl font-extrabold text-foreground">{parent.name}</h2>
          <p className="text-lg text-muted">nar. {parent.birthYear}</p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div>
              <span className="text-2xl font-bold text-sos">🩸 {parent.bloodType}</span>
            </div>
            <div>
              <span className="text-sm text-muted">{parent.insuranceCompany}</span>
            </div>
          </div>
        </div>

        {/* Allergies */}
        {parent.allergies.length > 0 && (
          <div className="bg-sos-light border-2 border-sos/30 rounded-xl p-4 mb-4">
            <h3 className="text-sos font-extrabold text-lg mb-2 uppercase">
              ⚠️ Alergie
            </h3>
            <div className="flex flex-wrap gap-2">
              {parent.allergies.map((a) => (
                <span
                  key={a}
                  className="bg-sos text-white px-3 py-1.5 rounded-full font-bold text-sm"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Critical Diagnoses */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <h3 className="font-bold text-foreground mb-2 text-lg">
            🩺 Kritické diagnózy
          </h3>
          <ul className="space-y-2">
            {parent.criticalDiagnoses.map((d) => (
              <li key={d} className="flex items-center gap-2 text-lg font-semibold">
                <span className="w-2 h-2 bg-sos rounded-full flex-shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <h3 className="font-bold text-foreground mb-2 text-lg">
            💊 Léky
          </h3>
          <div className="space-y-2">
            {displayMeds.map((med) => (
              <div
                key={med.id}
                className={`flex items-center justify-between py-2 ${
                  med.critical ? 'font-semibold' : ''
                }`}
              >
                <div>
                  <span className="text-base">{med.name}</span>
                  {med.critical && <span className="text-sos ml-1 text-sm">●</span>}
                </div>
                <span className="text-sm text-muted">{med.dosage} / {med.frequency}</span>
              </div>
            ))}
          </div>
          {parent.medications.length > 3 && (
            <button
              onClick={() => setShowAllMeds(!showAllMeds)}
              className="text-primary text-sm font-medium mt-2 min-h-0"
            >
              {showAllMeds ? 'Zobrazit méně' : `Zobrazit všechny (${parent.medications.length})`}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href={`tel:${parent.iceContact.phone}`}
            className="flex items-center justify-center gap-3 w-full bg-success text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-light transition-colors"
          >
            📞 VOLAT: {parent.iceContact.name.toUpperCase()} ({parent.iceContact.relation})
          </a>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center gap-3 w-full bg-white border-2 border-primary text-primary rounded-xl py-4 font-bold text-lg hover:bg-success-light transition-colors"
          >
            📤 Sdílet kartu s lékařem
          </button>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-bold mb-4">Naskenujte QR kód</h2>
            <div className="w-64 h-64 bg-foreground rounded-2xl flex items-center justify-center mb-4">
              <div className="grid grid-cols-8 gap-0.5 w-48 h-48">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square ${
                      Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted mb-6 text-center">
              Dočasný odkaz platný 24 hodin
            </p>
            <button
              onClick={() => setShowQR(false)}
              className="bg-sos text-white px-8 py-3 rounded-xl font-bold"
            >
              Zavřít
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
