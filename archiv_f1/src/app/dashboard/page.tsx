'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { tasks, auditLog, claimSteps, parents } from '@/data/mock';

const categoryColor = {
  medical: 'border-l-medical bg-sos-light/30',
  admin: 'border-l-admin bg-admin-light/30',
  operational: 'border-l-success bg-success-light/30',
};

const categoryLabel = {
  medical: 'Lékař',
  admin: 'Úřad',
  operational: 'Provoz',
};

export default function DashboardPage() {
  const { state } = useApp();
  const parent = parents[state.activeParent];
  const parentTasks = tasks.filter((t) => t.parentId === state.activeParent);
  const todayTasks = parentTasks.filter((t) => !t.completed);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeStep = claimSteps.find((s) => s.status === 'active');

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Dobrý den, Marie.
        </h1>
        <p className="text-muted text-sm">Máte to pod kontrolou.</p>
      </div>

      {/* Trial Banner */}
      {state.subscriptionTier === 'trial' && (
        <div className="bg-warning-light border border-warning/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Zkušební doba: {state.trialDaysLeft} dní</p>
            <p className="text-xs text-muted">Všechny funkce odemčeny</p>
          </div>
        </div>
      )}

      {/* Claim Status (Stepper) */}
      {activeStep && (
        <Link href="/pruvodce" className="block bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-admin">Příspěvek na péči</span>
            <span className="text-xs bg-admin-light text-admin px-2 py-0.5 rounded-full">
              Právě probíhá
            </span>
          </div>
          <div className="flex items-center gap-1">
            {claimSteps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'done'
                      ? 'bg-success text-white'
                      : step.status === 'active'
                        ? 'bg-admin text-white'
                        : 'bg-border text-muted'
                  }`}
                >
                  {step.status === 'done' ? '✓' : i + 1}
                </div>
                {i < claimSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${
                    step.status === 'done' ? 'bg-success' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Další krok: {activeStep.title}
          </p>
        </Link>
      )}

      {/* Today's Priorities */}
      <div>
        <h2 className="font-bold text-foreground mb-3">Dnešní priority</h2>
        {todayTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <span className="text-3xl block mb-2">☀️</span>
            <p className="text-muted text-sm">Zatím tu není žádný úkol. Vaše rodina si užívá klidný den.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-xl border border-border border-l-4 p-4 ${categoryColor[task.category]} ${
                  completedIds.has(task.id) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 hover:border-primary transition-colors min-h-0 min-w-0"
                  >
                    {completedIds.has(task.id) && <span className="text-success text-sm">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {task.time && (
                        <span className="text-xs font-semibold text-foreground">{task.time}</span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        task.category === 'medical' ? 'bg-sos-light text-medical' :
                        task.category === 'admin' ? 'bg-admin-light text-admin' :
                        'bg-success-light text-success'
                      }`}>
                        {categoryLabel[task.category]}
                      </span>
                    </div>
                    <p className={`font-semibold text-sm ${completedIds.has(task.id) ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted mt-0.5">{task.description}</p>
                    )}
                    {task.linkedDoc && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs">📎</span>
                        <span className="text-xs text-primary font-medium">{task.linkedDoc}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log / Family Feed */}
      <div>
        <h2 className="font-bold text-foreground mb-3">Rodinná nástěnka</h2>
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {auditLog.slice(0, 4).map((entry) => (
            <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {entry.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{entry.user}</span>{' '}
                  <span className="text-muted">{entry.action} {entry.target}</span>
                </p>
                <p className="text-xs text-muted">
                  {new Date(entry.timestamp).toLocaleString('cs-CZ', {
                    day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <span className="text-lg">👁️</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick SOS Access */}
      <Link
        href="/sos"
        className="block bg-sos text-white rounded-xl p-4 text-center font-bold text-lg hover:bg-red-800 transition-colors"
      >
        🆘 SOS Krizová karta: {parent.name}
      </Link>
    </div>
  );
}
