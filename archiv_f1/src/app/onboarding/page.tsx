'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

type Situation = 'krize' | 'pamet' | 'stari' | 'admin' | null;

const situations = [
  {
    id: 'krize' as const,
    icon: '🚨',
    title: 'Náhlá změna zdraví',
    desc: 'Úraz nebo návrat z nemocnice. Sestavíme krizový plán.',
  },
  {
    id: 'pamet' as const,
    icon: '🧠',
    title: 'Výpadky paměti',
    desc: 'Podezření na demenci či Alzheimerovu chorobu. Zajistíme bezpečí.',
  },
  {
    id: 'stari' as const,
    icon: '🤝',
    title: 'Postupné slábnutí',
    desc: 'Rodič už na všechno sám nestačí. Zorganizujeme pomoc.',
  },
  {
    id: 'admin' as const,
    icon: '📄',
    title: 'Jen administrativa',
    desc: 'Zdraví slouží, ale chcete mít pořádek v dokladech a nárocích.',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState<Situation>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { completeOnboarding } = useApp();

  const handleMagicEntry = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setStep(3);
    }, 2500);
  };

  const handleComplete = () => {
    completeOnboarding();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted">Krok {step} ze 3</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 1: Situation Selector */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              V jaké situaci se právě nacházíte?
            </h1>
            <p className="text-muted mb-6">
              Vyberte situaci a my vám připravíme plán na míru.
            </p>

            {/* Magic Entry CTA */}
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white rounded-xl p-5 mb-6 text-left hover:bg-primary-light transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📸</span>
                <span className="text-lg font-bold">Skutečně jednoduchý start</span>
              </div>
              <p className="text-sm opacity-90">
                Máte u sebe lékařskou zprávu nebo léky? Vyfoťte je. My data nahrajeme za vás,
                abyste nemuseli nic vypisovat.
              </p>
            </button>

            <p className="text-sm text-muted mb-3 font-medium">
              Nebo vyberte svou situaci:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {situations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSituation(s.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    situation === s.id
                      ? 'border-primary bg-success-light'
                      : 'border-border bg-white hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl block mb-2">{s.icon}</span>
                  <span className="font-semibold text-sm block mb-1">{s.title}</span>
                  <span className="text-xs text-muted">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Magic Onboarding */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Magic Onboarding
            </h1>
            <p className="text-muted mb-6">
              Vyfoťte lékařskou zprávu, recept nebo krabičku léku. Data vyplníme za vás.
            </p>

            {!scanning && !scanned && (
              <div className="space-y-4">
                <button
                  onClick={handleMagicEntry}
                  className="w-full border-2 border-dashed border-primary/40 rounded-xl p-12 flex flex-col items-center gap-3 hover:border-primary hover:bg-success-light/50 transition-all"
                >
                  <span className="text-5xl">📸</span>
                  <span className="font-semibold text-primary">Vyfotit dokument</span>
                  <span className="text-sm text-muted">Lékařskou zprávu, recept nebo lékový list</span>
                </button>

                <button
                  onClick={handleMagicEntry}
                  className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary hover:bg-success-light/50 transition-all"
                >
                  <span className="text-3xl">💊</span>
                  <span className="font-semibold text-primary">Vyfotit krabičku léku</span>
                </button>

                <button
                  onClick={() => {
                    setScanned(true);
                    setStep(3);
                  }}
                  className="w-full text-center text-muted text-sm py-3 hover:text-foreground transition-colors"
                >
                  Přeskočit a vyplnit ručně
                </button>
              </div>
            )}

            {scanning && (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <div className="relative w-48 h-64 mx-auto mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-primary animate-bounce" style={{ top: '50%' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">📄</span>
                  </div>
                </div>
                <p className="font-semibold text-primary animate-pulse">Analyzuji dokument...</p>
                <p className="text-sm text-muted mt-1">Vytěžuji diagnózy a léky</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Kontrola dat
            </h1>
            <p className="text-muted mb-6">
              Zkontrolujte vytěžené údaje a potvrďte je.
            </p>

            <div className="space-y-4">
              {/* Extracted medications */}
              <div className="bg-white rounded-xl border border-border p-4">
                <h3 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wide">
                  Nalezené léky
                </h3>
                <div className="space-y-2">
                  {['Metformin 500 mg', 'Ramipril 5 mg', 'Warfarin 3 mg'].map((med) => (
                    <label key={med} className="flex items-center gap-3 py-2">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
                      <span className="font-medium">{med}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Extracted diagnoses */}
              <div className="bg-white rounded-xl border border-border p-4">
                <h3 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wide">
                  Nalezené diagnózy
                </h3>
                <div className="space-y-2">
                  {['Diabetes mellitus II. typu', 'Arteriální hypertenze'].map((d) => (
                    <label key={d} className="flex items-center gap-3 py-2">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-primary" />
                      <span className="font-medium">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-primary text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-light transition-colors"
              >
                Potvrdit a pokračovat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
