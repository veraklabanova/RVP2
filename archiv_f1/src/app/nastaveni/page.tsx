'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { familyMembers } from '@/data/mock';

const roleLabels: Record<string, string> = {
  garant: 'Garant péče',
  platce: 'Plátce',
  pecujici: 'Pečující',
  ctenar: 'Čtenář',
};

const roleColors: Record<string, string> = {
  garant: 'bg-primary text-white',
  platce: 'bg-admin text-white',
  pecujici: 'bg-success text-white',
  ctenar: 'bg-surface text-muted',
};

const tiers = [
  { id: 'standard', name: 'Standard', desc: '1 rodič', price: '199 Kč/měsíc' },
  { id: 'duo', name: 'Duo', desc: '2 rodiče (sleva 40 %)', price: '239 Kč/měsíc' },
  { id: 'family', name: 'Family', desc: '3 rodiče (sleva 50 %)', price: '299 Kč/měsíc' },
];

export default function NastaveniPage() {
  const { state } = useApp();
  const [showFreezerInfo, setShowFreezerInfo] = useState(false);

  return (
    <div className="px-4 py-5 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Nastavení</h1>

      {/* Subscription Status */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>💳</span> Předplatné
        </h2>
        {state.subscriptionTier === 'trial' ? (
          <div>
            <div className="bg-warning-light rounded-lg p-3 mb-3">
              <p className="font-semibold text-sm">Zkušební doba</p>
              <p className="text-xs text-muted">Zbývá {state.trialDaysLeft} dní | Všechny funkce odemčeny</p>
            </div>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{tier.name}</p>
                    <p className="text-xs text-muted">{tier.desc}</p>
                  </div>
                  <span className="font-bold text-primary text-sm">{tier.price}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm mt-3 hover:bg-primary-light transition-colors">
              Aktivovat Premium
            </button>
            <p className="text-xs text-muted text-center mt-2">
              199 Kč měsíčně – méně než jedna hodina placené péče.
            </p>
          </div>
        ) : (
          <div className="bg-success-light rounded-lg p-3">
            <p className="font-semibold text-sm text-success">
              Aktivní tarif: {state.subscriptionTier.charAt(0).toUpperCase() + state.subscriptionTier.slice(1)}
            </p>
          </div>
        )}
      </div>

      {/* Family Team */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>👥</span> Rodinný tým
        </h2>
        <div className="space-y-3">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center font-bold text-primary flex-shrink-0">
                {member.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{member.name}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[member.role]}`}>
                {roleLabels[member.role]}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-3 py-2.5 text-primary text-sm font-medium border border-primary/30 rounded-lg hover:bg-success-light transition-colors">
          + Pozvat člena rodiny
        </button>
      </div>

      {/* Freezer Mode */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <span>🧊</span> Režim Mrazák (Continuity)
        </h2>
        <p className="text-sm text-muted mb-3">
          Data zůstají v read-only režimu i po skončení předplatného. SOS karta a seznam léků vám zůstanou zdarma.
        </p>
        <button
          onClick={() => setShowFreezerInfo(!showFreezerInfo)}
          className="text-sm text-primary font-medium min-h-0"
        >
          {showFreezerInfo ? 'Skrýt podrobnosti' : 'Více informací'}
        </button>
        {showFreezerInfo && (
          <div className="mt-3 bg-surface rounded-lg p-3 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span>SOS karta a seznam léků</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span>Čtení historie a dokumentů</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sos">✗</span>
              <span>Editace léků a nových úkolů</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sos">✗</span>
              <span>Insider tipy v průvodcích</span>
            </div>
          </div>
        )}
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-2 flex items-center gap-2">
          <span>📦</span> Export dat
        </h2>
        <p className="text-sm text-muted mb-3">
          Každý pečující má trvalé právo na export kompletních dat (Anti-hostage Clause).
        </p>
        <button className="w-full py-2.5 text-primary text-sm font-medium border border-primary/30 rounded-lg hover:bg-success-light transition-colors">
          Exportovat všechna data (PDF/ZIP)
        </button>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-xs text-muted text-center px-4 pb-4">
        <p>Rodiče v péči je nástroj koordinace, nikoliv právní poradna.</p>
        <p>Každý dokument vyžaduje individuální posouzení.</p>
      </div>
    </div>
  );
}
