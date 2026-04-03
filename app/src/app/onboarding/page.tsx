'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

type Situation = 'krize' | 'pamet' | 'stari' | 'admin' | null;

const situations = [
  {
    id: 'krize' as const,
    icon: '🚨',
    title: 'Náhlá krize',
    desc: 'Úraz nebo návrat z nemocnice. Sestavíme krizový plán.',
  },
  {
    id: 'pamet' as const,
    icon: '🧠',
    title: 'Paměť a hlava',
    desc: 'Podezření na demenci či Alzheimerovu chorobu. Zajistíme bezpečí.',
  },
  {
    id: 'stari' as const,
    icon: '🤝',
    title: 'Postupné stáří',
    desc: 'Rodič už na všechno sám nestačí. Zorganizujeme pomoc.',
  },
  {
    id: 'admin' as const,
    icon: '📄',
    title: 'Jen administrativa',
    desc: 'Zdraví slouží, ale chcete mít pořádek v dokladech a nárocích.',
  },
];

const situationCopy: Record<string, string> = {
  krize: 'To nás mrzí. Zvládneme to. Co teď nejvíc hoří?',
  pamet: 'Rozumíme, že je to těžké. Pojďme to společně zvládnout.',
  stari: 'Jste skvělí, že se staráte. Pojďme to zorganizovat.',
  admin: 'Dobrá zpráva — tohle zvládneme rychle a přehledně.',
};

const priorities = [
  { id: 'pece', label: 'Potřebuji zařídit domácí péči' },
  { id: 'finance', label: 'Potřebuji vyřídit peníze (příspěvky, dávky)' },
  { id: 'doklady', label: 'Nevím, kde má rodič doklady a léky' },
  { id: 'pravni', label: 'Potřebuji vyřešit právní věci (plná moc apod.)' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState<Situation>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { completeOnboarding } = useApp();

  const togglePriority = (id: string) => {
    setSelectedPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
              S čím dnes potřebujete nejvíce pomoci?
            </h1>
            <p className="text-muted mb-6">
              Vyberte situaci a my vám připravíme plán na míru.
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

            <button
              onClick={() => {
                completeOnboarding();
                router.push('/dashboard');
              }}
              className="w-full text-center text-muted text-sm py-4 mt-4 hover:text-foreground transition-colors"
            >
              Jsem tu poprvé a chci si jen prohlédnout aplikaci
            </button>
          </div>
        )}

        {/* Step 2: Configuration — priority checklist (PAB f1 7.1 Obrazovka 2) */}
        {step === 2 && situation && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {situationCopy[situation]}
            </h1>
            <p className="text-muted mb-6">
              Zaškrtněte, co teď potřebujete vyřešit:
            </p>

            <div className="space-y-3 mb-8">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePriority(p.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    selectedPriorities.has(p.id)
                      ? 'border-primary bg-success-light'
                      : 'border-border bg-white hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedPriorities.has(p.id)
                        ? 'border-primary bg-primary text-white'
                        : 'border-border'
                    }`}
                  >
                    {selectedPriorities.has(p.id) && '✓'}
                  </span>
                  <span className="font-medium text-sm">{p.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={selectedPriorities.size === 0}
              className={`w-full rounded-xl py-4 font-bold text-lg transition-colors ${
                selectedPriorities.size > 0
                  ? 'bg-primary text-white hover:bg-primary-light'
                  : 'bg-border text-muted cursor-not-allowed'
              }`}
            >
              Sestavit můj plán péče
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-muted text-sm py-3 mt-2 hover:text-foreground transition-colors"
            >
              ← Zpět na výběr situace
            </button>
          </div>
        )}

        {/* Step 3: First Dashboard preview (PAB f1 7.1 Obrazovka 3) */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Váš plán péče je připraven
            </h1>
            <p className="text-muted mb-6">
              Připravili jsme pro vás první úkoly. Můžete je upravit na nástěnce.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: '📋', text: 'Vyplnit základní údaje o rodiči', category: 'Profil' },
                { icon: '💊', text: 'Zapsat seznam užívaných léků', category: 'Zdraví' },
                { icon: '📞', text: 'Přidat kontakty na lékaře', category: 'Kontakty' },
                { icon: '📄', text: 'Zjistit nárok na příspěvek na péči', category: 'Úřady' },
              ].map((task) => (
                <div
                  key={task.text}
                  className="p-4 rounded-xl border border-border bg-white flex items-start gap-3"
                >
                  <span className="text-xl">{task.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-sm block">{task.text}</span>
                    <span className="text-xs text-muted">{task.category}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-primary text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-light transition-colors"
            >
              Přejít na nástěnku
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
