'use client';

import { useState } from 'react';
import Link from 'next/link';
import { monthlyReports, parents } from '@/data/mock';
import { useApp } from '@/lib/store';

export default function ReportPage() {
  const { state } = useApp();
  const isPremium = state.subscriptionTier !== 'trial' && state.subscriptionTier !== 'freezer';
  const report = monthlyReports[0];
  const parent = parents[state.activeParent];
  const [exported, setExported] = useState(false);

  const { compliance, visits, familyActivity } = report.sections;
  const compliancePct = compliance.total > 0 ? Math.round((compliance.taken / compliance.total) * 100) : 0;
  const maxActivity = Math.max(...familyActivity.map((f) => f.actions));

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Měsíční report</h1>
          <p className="text-sm text-muted">{parent.name} · Leden 2024</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          {exported ? '✅ Staženo' : '📄 Export PDF'}
        </button>
      </div>

      {/* Compliance Summary */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <span>💊</span> Compliance medikace
        </h2>
        <div className="flex items-center gap-6">
          {/* Pie Chart (CSS conic-gradient) */}
          <div className="relative flex-shrink-0">
            <div
              className="w-24 h-24 rounded-full"
              style={{
                background: `conic-gradient(
                  var(--color-compliance-ok) 0deg ${compliancePct * 3.6}deg,
                  var(--color-compliance-miss) ${compliancePct * 3.6}deg 360deg
                )`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-extrabold text-foreground">{compliancePct}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-compliance-ok" />
              <span className="text-sm">Podáno: <strong>{compliance.taken}×</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-compliance-miss" />
              <span className="text-sm">Vynecháno: <strong>{compliance.missed}×</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-border" />
              <span className="text-sm">Celkem dávek: <strong>{compliance.total}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Visits */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>🩺</span> Návštěvy lékařů
        </h2>
        {!isPremium ? (
          <div className="bg-medication-light rounded-lg p-3 text-center">
            <p className="text-sm text-medication font-medium">🔒 Detailní přehled dostupný v Premium</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visits.map((visit, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-medical rounded-full" />
                  <span className="text-sm font-medium">{visit.doctor}</span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(visit.date).toLocaleDateString('cs-CZ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Activity */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>👥</span> Aktivita rodiny
        </h2>
        {!isPremium ? (
          <div className="bg-medication-light rounded-lg p-3 text-center">
            <p className="text-sm text-medication font-medium">🔒 Detailní přehled dostupný v Premium</p>
          </div>
        ) : (
          <div className="space-y-3">
            {familyActivity.map((member) => (
              <div key={member.member}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{member.member}</span>
                  <span className="text-xs text-muted">{member.actions} akcí</span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${maxActivity > 0 ? (member.actions / maxActivity) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report metadata */}
      <div className="text-xs text-muted text-center space-y-1">
        <p>Report vygenerován: {new Date(report.generatedAt).toLocaleDateString('cs-CZ')}</p>
        <p>Tento report slouží jako podklad pro odborné lékařské konzultace.</p>
      </div>

      {/* Premium upsell */}
      {!isPremium && (
        <div className="bg-medication-light border border-medication/20 rounded-xl p-4">
          <h3 className="font-bold text-medication mb-2">
            🔓 Kompletní Expert Report
          </h3>
          <p className="text-sm text-muted mb-3">
            Získejte detailní přehled návštěv lékařů, rodinné aktivity a export pro úřady.
          </p>
          <Link
            href="/nastaveni"
            className="block w-full text-center bg-medication text-white rounded-lg py-3 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Aktivovat Premium – 199 Kč/měsíc
          </Link>
        </div>
      )}

      <Link href="/nastaveni" className="block text-center text-sm text-muted hover:text-foreground transition-colors">
        ← Zpět do Nastavení
      </Link>
    </div>
  );
}
