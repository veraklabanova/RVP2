'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ocrScanResults } from '@/data/mock';

type ScanPhase = 'ready' | 'scanning' | 'results';

export default function OCRPage() {
  const [phase, setPhase] = useState<ScanPhase>('ready');
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState(false);

  const mockResult = ocrScanResults[0];

  const handleScan = () => {
    setPhase('scanning');
    setTimeout(() => {
      setPhase('results');
      setSelectedMeds(new Set(mockResult.extractedMedications.map((m) => m.id)));
    }, 2500);
  };

  const toggleMed = (id: string) => {
    setSelectedMeds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = () => {
    setApplied(true);
  };

  if (applied) {
    return (
      <div className="px-4 py-5">
        <div className="text-center py-12">
          <span className="text-6xl block mb-4">✅</span>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Léky přidány
          </h1>
          <p className="text-muted mb-6">
            {selectedMeds.size} léků bylo přidáno do lékového plánu.
          </p>
          <div className="space-y-3">
            <Link
              href="/trezor"
              className="block w-full bg-primary text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-light transition-colors text-center"
            >
              Zobrazit v Trezoru
            </Link>
            <button
              onClick={() => { setPhase('ready'); setApplied(false); setSelectedMeds(new Set()); }}
              className="w-full border border-border rounded-xl py-3 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Skenovat další
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">
          Skenovat eRecept
        </h1>
        <p className="text-sm text-muted">
          Vyfoťte recept nebo lékařskou zprávu. Data vytěžíme za vás.
        </p>
      </div>

      {/* Ready Phase */}
      {phase === 'ready' && (
        <div className="space-y-4">
          <button
            onClick={handleScan}
            className="w-full border-2 border-dashed border-medication/40 rounded-xl p-12 flex flex-col items-center gap-3 hover:border-medication hover:bg-medication-light/50 transition-all"
          >
            <span className="text-5xl">📸</span>
            <span className="font-semibold text-medication">Vyfotit eRecept</span>
            <span className="text-sm text-muted">Papírový recept nebo eRecept z portálu</span>
          </button>

          <button
            onClick={handleScan}
            className="w-full border-2 border-dashed border-medication/40 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-medication hover:bg-medication-light/50 transition-all"
          >
            <span className="text-3xl">📄</span>
            <span className="font-semibold text-medication">Skenovat lékařskou zprávu</span>
            <span className="text-sm text-muted">Hromadné vytěžení dat z dokumentu</span>
          </button>

          {/* Scan History */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>📋</span> Historie skenování
            </h3>
            <div className="space-y-2">
              {ocrScanResults.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {scan.documentType === 'erecept' ? 'eRecept' : scan.documentType === 'zprava' ? 'Lékařská zpráva' : 'Krabička léku'}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(scan.scannedAt).toLocaleDateString('cs-CZ')} · {scan.extractedMedications.length} léků · {Math.round(scan.confidence * 100)}%
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    scan.applied ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                  }`}>
                    {scan.applied ? 'Použito' : 'Čeká'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/trezor" className="block text-center text-sm text-muted hover:text-foreground transition-colors">
            ← Zpět do Trezoru
          </Link>
        </div>
      )}

      {/* Scanning Phase */}
      {phase === 'scanning' && (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <div className="relative w-48 h-64 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-medication animate-bounce" style={{ top: '50%' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
          </div>
          <p className="font-semibold text-medication animate-pulse">Čtu dokument...</p>
          <p className="text-sm text-muted mt-1">Vytěžuji léky a diagnózy</p>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <div className="space-y-4">
          {/* Confidence */}
          <div className="bg-success-light border border-success/20 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <p className="text-sm font-semibold">Jistota rozpoznání: {Math.round(mockResult.confidence * 100)}%</p>
              <p className="text-xs text-muted">Zkontrolujte prosím vytěžená data</p>
            </div>
          </div>

          {/* Extracted Medications */}
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wide">
              Nalezené léky ({mockResult.extractedMedications.length})
            </h3>
            <div className="space-y-2">
              {mockResult.extractedMedications.map((med) => (
                <label
                  key={med.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMeds.has(med.id)}
                    onChange={() => toggleMed(med.id)}
                    className="w-5 h-5 rounded accent-medication"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{med.name}</span>
                    <span className="text-sm text-muted ml-2">{med.dosage}</span>
                  </div>
                  <span className="text-xs text-muted">{med.frequency}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleApply}
              disabled={selectedMeds.size === 0}
              className={`w-full rounded-xl py-4 font-bold text-lg transition-colors ${
                selectedMeds.size > 0
                  ? 'bg-medication text-white hover:opacity-90'
                  : 'bg-border text-muted cursor-not-allowed'
              }`}
            >
              Uložit {selectedMeds.size} léků do plánu
            </button>
            <button
              onClick={() => setPhase('ready')}
              className="w-full border border-border rounded-xl py-3 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Zahodit a skenovat znovu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
