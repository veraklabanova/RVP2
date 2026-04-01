'use client';

import { useState } from 'react';
import { claimSteps } from '@/data/mock';
import { useApp } from '@/lib/store';

const claimTypes = [
  { id: 'pnp', title: 'Příspěvek na péči', subtitle: 'Peníze na pomoc', icon: '💰', active: true },
  { id: 'ztp', title: 'Průkaz ZTP/P', subtitle: 'Parkování, slevy, doprava', icon: '🅿️', active: false },
  { id: 'oid', title: 'Invalidní důchod', subtitle: 'Pro rodiče v produktivním věku', icon: '📊', active: false },
  { id: 'pomucky', title: 'Zdravotní pomůcky', subtitle: 'Invalidní vozík, polohovací postel', icon: '🏥', active: false },
];

export default function PruvodcePage() {
  const { state } = useApp();
  const isFreezer = state.subscriptionTier === 'freezer';
  const [selectedClaim, setSelectedClaim] = useState('pnp');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">
          Nárokový průvodce
        </h1>
        <p className="text-sm text-muted">Úřady a právo – krok za krokem</p>
      </div>

      {/* Claim Type Selector */}
      <div className="space-y-2">
        {claimTypes.map((claim) => (
          <button
            key={claim.id}
            onClick={() => setSelectedClaim(claim.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              selectedClaim === claim.id
                ? 'border-primary bg-success-light'
                : 'border-border bg-white hover:border-primary/40'
            } ${!claim.active && claim.id !== 'pnp' ? 'opacity-60' : ''}`}
          >
            <span className="text-2xl">{claim.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{claim.title}</p>
              <p className="text-xs text-muted">{claim.subtitle}</p>
            </div>
            {selectedClaim === claim.id && (
              <span className="text-primary font-bold">→</span>
            )}
          </button>
        ))}
      </div>

      {/* Claim Guide Detail */}
      {selectedClaim === 'pnp' && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            Příspěvek na péči (Peníze na pomoc)
          </h2>
          <p className="text-sm text-muted mb-5">
            Interaktivní průvodce celým procesem
          </p>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

            {claimSteps.map((step, i) => (
              <div key={step.id} className="relative flex items-start gap-4 mb-6 last:mb-0">
                {/* Step indicator */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    step.status === 'done'
                      ? 'bg-success text-white'
                      : step.status === 'active'
                        ? 'bg-admin text-white ring-4 ring-admin/20'
                        : step.status === 'locked'
                          ? 'bg-border text-muted'
                          : 'bg-white border-2 border-border text-muted'
                  }`}
                >
                  {step.status === 'done' ? '✓' : step.status === 'locked' ? '🔒' : i + 1}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${
                      step.status === 'active' ? 'text-admin' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      step.status === 'done'
                        ? 'bg-success-light text-success'
                        : step.status === 'active'
                          ? 'bg-admin-light text-admin'
                          : 'bg-surface text-muted'
                    }`}>
                      {step.status === 'done' ? 'Hotovo ✅' :
                       step.status === 'active' ? 'Právě probíhá 🔵' :
                       'Následuje ⚪'}
                    </span>
                  </div>

                  {/* Insider Tip */}
                  {step.insiderTip && (
                    <div
                      className={`mt-2 rounded-xl p-3 ${
                        isFreezer
                          ? 'bg-surface border border-border cursor-pointer'
                          : 'bg-warning-light border border-warning/30'
                      }`}
                    >
                      {isFreezer ? (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <span>🔒</span>
                          <span>Insider tip – dostupný v Premium</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setExpandedTip(expandedTip === step.id ? null : step.id)}
                            className="flex items-center gap-2 text-sm font-semibold text-warning w-full text-left min-h-0"
                          >
                            <span>💡</span>
                            <span>Zlatá rada</span>
                            <span className="ml-auto">{expandedTip === step.id ? '▲' : '▼'}</span>
                          </button>
                          {expandedTip === step.id && (
                            <p className="text-sm mt-2 text-foreground leading-relaxed">
                              {step.insiderTip}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Appeal section */}
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

          {/* Legal Survival Kit */}
          <div className="mt-4 bg-white rounded-xl border border-border p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>📝</span> Právní Survival Kit
            </h3>
            <div className="space-y-2">
              {[
                { title: 'Plná moc – lékař', status: 'Staženo' },
                { title: 'Plná moc – pošta', status: 'Ke stažení' },
                { title: 'Plná moc – úřad', status: 'Ke stažení' },
              ].map((doc) => (
                <div key={doc.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{doc.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    doc.status === 'Staženo'
                      ? 'bg-success-light text-success'
                      : 'bg-admin-light text-admin'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Non-PnP placeholder */}
      {selectedClaim !== 'pnp' && (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <span className="text-4xl block mb-3">🚧</span>
          <p className="font-semibold mb-1">Průvodce se připravuje</p>
          <p className="text-sm text-muted">
            Tento průvodce bude k dispozici v další verzi aplikace.
          </p>
        </div>
      )}
    </div>
  );
}
