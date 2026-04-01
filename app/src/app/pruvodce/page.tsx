'use client';

import { useState } from 'react';
import Link from 'next/link';
import { claimGuides } from '@/data/mock';
import { useApp } from '@/lib/store';
import type { ClaimStep } from '@/lib/types';

const STORAGE_KEY = 'rvp-smart-test-progress';

const claimTypes = [
  { id: 'pnp', title: 'Příspěvek na péči', subtitle: 'Peníze na pomoc', icon: '💰', active: true },
  { id: 'ztp', title: 'Průkaz ZTP/P', subtitle: 'Parkování, slevy, doprava', icon: '🅿️', active: true },
  { id: 'oid', title: 'Invalidní důchod', subtitle: 'Pro rodiče v produktivním věku', icon: '📊', active: false },
  { id: 'mobilita', title: 'Příspěvek na mobilitu', subtitle: 'Podpora pohybu a dopravy', icon: '🚗', active: false },
  { id: 'pomucky', title: 'Zdravotní pomůcky', subtitle: 'Invalidní vozík, polohovací postel', icon: '🏥', active: false },
];

function GuideTimeline({ steps, isFreezer }: { steps: ClaimStep[]; isFreezer: boolean }) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
      {steps.map((step, i) => (
        <div key={step.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
          <div
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              step.status === 'done'
                ? 'bg-success text-white'
                : step.status === 'active'
                  ? 'bg-primary text-white ring-4 ring-primary/20'
                  : step.status === 'locked'
                    ? 'bg-border text-muted'
                    : 'bg-white border-2 border-border text-muted'
            }`}
          >
            {step.status === 'done' ? '✓' : step.status === 'locked' ? '🔒' : i + 1}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${step.status === 'active' ? 'text-primary' : 'text-foreground'}`}>
                {step.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                step.status === 'done' ? 'bg-success-light text-success' :
                step.status === 'active' ? 'bg-admin-light text-primary' :
                'bg-surface text-muted'
              }`}>
                {step.status === 'done' ? 'Hotovo' : step.status === 'active' ? 'Právě probíhá' : 'Následuje'}
              </span>
            </div>
            {step.insiderTip && (
              <div className={`mt-2 rounded-xl p-3 ${
                isFreezer ? 'bg-surface border border-border cursor-pointer' : 'bg-warning-light border border-warning/30'
              }`}>
                {isFreezer ? (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>🔒</span><span>Insider tip – dostupný v Premium</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setExpandedTip(expandedTip === step.id ? null : step.id)}
                      className="flex items-center gap-2 text-sm font-semibold text-warning w-full text-left min-h-0"
                    >
                      <span>💡</span><span>Zlatá rada</span>
                      <span className="ml-auto">{expandedTip === step.id ? '▲' : '▼'}</span>
                    </button>
                    {expandedTip === step.id && (
                      <p className="text-sm mt-2 text-foreground leading-relaxed">{step.insiderTip}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PruvodcePage() {
  const { state } = useApp();
  const isFreezer = state.subscriptionTier === 'freezer';
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  // Check if there's a saved Smart Test progress
  let savedProgress = 0;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) savedProgress = JSON.parse(saved).currentQuestion || 0;
    } catch { /* ignore */ }
  }

  const currentSteps = selectedClaim ? (claimGuides[selectedClaim] || []) : [];
  const currentType = claimTypes.find((c) => c.id === selectedClaim);

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Hero card: Smart Test */}
      <Link
        href="/pruvodce/test-naroku"
        className="block bg-white rounded-xl border-2 border-primary/20 p-5 hover:border-primary/40 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">🔍</span>
          <div className="flex-1">
            <p className="font-bold text-xl text-foreground">Zjistěte, na co máte nárok</p>
            <p className="text-sm text-muted mt-1">
              Odpovězte na 8 otázek a dostanete osobní Mapu nároků
            </p>
            {savedProgress > 0 && (
              <p className="text-xs text-medication mt-1 font-medium">
                Rozpracováno: {savedProgress}/8 otázek
              </p>
            )}
          </div>
          <span className="text-primary font-bold text-2xl">→</span>
        </div>
        <button className="mt-3 w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm">
          {savedProgress > 0 ? 'Pokračovat v testu' : 'Spustit test'}
        </button>
      </Link>

      {/* Katalog průvodců */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Průvodci krok za krokem</h2>
        <div className="space-y-2">
          {claimTypes.map((claim) => (
            <button
              key={claim.id}
              onClick={() => claim.active ? setSelectedClaim(selectedClaim === claim.id ? null : claim.id) : undefined}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                !claim.active
                  ? 'border-border bg-surface opacity-60 cursor-default'
                  : selectedClaim === claim.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white hover:border-primary/40'
              }`}
            >
              <span className="text-2xl">{claim.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{claim.title}</p>
                <p className="text-xs text-muted">{claim.subtitle}</p>
              </div>
              {!claim.active ? (
                <span className="text-xs text-muted">Připravujeme</span>
              ) : selectedClaim === claim.id ? (
                <span className="text-primary font-bold">▼</span>
              ) : (
                <span className="text-muted">→</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected guide detail */}
      {selectedClaim && currentSteps.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">{currentType?.title}</h2>
          <p className="text-sm text-muted mb-5">Interaktivní průvodce celým procesem</p>
          <GuideTimeline steps={currentSteps} isFreezer={isFreezer} />

          <div className="mt-6 bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>⚖️</span> Co když nás odmítnou?
            </h3>
            <p className="text-sm text-muted mb-3">
              Připravili jsme pro vás vzor odvolání, který zvýší vaše šance.
            </p>
            <button className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm hover:bg-primary-light transition-colors">
              Stáhnout vzor Námitky / Odvolání
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
