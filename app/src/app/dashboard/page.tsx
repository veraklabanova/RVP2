'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { tasks, calendarEvents, parents, claimSteps, familyMembers } from '@/data/mock';

export default function DashboardPage() {
  const { state } = useApp();
  const parent = parents[state.activeParent];

  // Top 3 tasks for current user, sorted by priority/deadline
  const myTasks = tasks
    .filter((t) => !t.completed)
    .slice(0, 3);

  // Events for today/tomorrow
  const upcomingEvents = calendarEvents
    .filter((e) => e.parentId === state.activeParent)
    .slice(0, 3);

  // Claim process status
  const activeSteps = claimSteps.filter((s) => s.status === 'active' || s.status === 'pending');

  // Recent family activity
  const completedTasks = tasks.filter((t) => t.completed).slice(0, 2);

  return (
    <div className="px-4 py-5 space-y-5">
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

      {/* Critical Alert — Dnes a zítra (PAB f1 6.2) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">📅</span> Dnes a zítra
          </h2>
          <Link href="/kalendar" className="text-xs text-primary font-medium min-h-0 min-w-0">
            Kalendář →
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted">Žádné termíny na dnes ani zítra.</p>
        ) : (
          <div className="space-y-1.5">
            {upcomingEvents.map((event) => {
              const dotColor = event.category === 'medical' ? 'bg-sos' :
                event.category === 'admin' ? 'bg-primary' : 'bg-compliance-ok';
              return (
                <div key={event.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm text-muted font-mono w-12">{event.time || '—'}</span>
                  <span className="text-sm flex-1">{event.title}</span>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card: Moje úkoly — Top 3 (PAB f1 6.2) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span>📋</span> Moje úkoly
          </h2>
          <Link href="/kalendar" className="text-xs text-primary font-medium min-h-0 min-w-0">
            Všechny úkoly →
          </Link>
        </div>
        {myTasks.length === 0 ? (
          <p className="text-sm text-muted">Žádné aktivní úkoly.</p>
        ) : (
          <div className="space-y-2">
            {myTasks.map((task) => {
              const categoryColor = task.category === 'medical' ? 'text-sos' :
                task.category === 'admin' ? 'text-primary' : 'text-compliance-ok';
              return (
                <div key={task.id} className="flex items-center gap-3 py-1.5">
                  <span className={`w-5 h-5 rounded-full border-2 border-border flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{task.title}</span>
                    {task.date && (
                      <span className="text-xs text-muted">
                        Termín: {new Date(task.date).toLocaleDateString('cs-CZ')}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${categoryColor}`}>
                    {task.category === 'medical' ? 'Lékař' : task.category === 'admin' ? 'Úřad' : 'Provoz'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card: Stav žádostí — Úřady (PAB f1 6.2) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span>🏛️</span> Úřady
          </h2>
          <Link href="/pruvodce" className="text-xs text-primary font-medium min-h-0 min-w-0">
            Průvodce →
          </Link>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 py-1.5">
            <div className="flex gap-1">
              {['done', 'active', 'pending', 'pending'].map((status, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    status === 'done' ? 'bg-compliance-ok' :
                    status === 'active' ? 'bg-warning' :
                    'bg-border'
                  }`}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">Příspěvek na péči</span>
              <span className="text-xs text-muted block">Probíhá: Sociální šetření</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card: Rodinná nástěnka — Activity Stream (PAB f1 6.2) */}
      <div className="bg-white rounded-xl border border-border p-4">
        <h2 className="font-bold text-foreground flex items-center gap-2 mb-3">
          <span>👥</span> Rodinná nástěnka
        </h2>
        {completedTasks.length === 0 ? (
          <p className="text-sm text-muted">Zatím žádná aktivita.</p>
        ) : (
          <div className="space-y-2">
            {completedTasks.map((task) => {
              const member = familyMembers[0];
              return (
                <div key={task.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-compliance-ok/20 flex items-center justify-center text-xs font-bold text-compliance-ok flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-semibold">{member?.name || 'Člen rodiny'}</span>{' '}
                      <span className="text-muted">dokončil/a: {task.title}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
