'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useMedication } from '@/lib/medication-store';
import { parents } from '@/data/mock';

export default function SeniorModePage() {
  const { state } = useApp();
  const { todaySchedule, confirmMedication, skipMedication } = useMedication();
  const parent = parents[state.activeParent];
  const [activeTab, setActiveTab] = useState<'leky' | 'ukoly'>('leky');
  const [isOffline, setIsOffline] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [skipDialogId, setSkipDialogId] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Offline detection (R4)
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // Haptic feedback (R7)
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, []);

  // Two-tap confirmation with 5s timeout (R1)
  const handleFirstTap = (entryId: string) => {
    setConfirmingId(entryId);
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => {
      setConfirmingId(null);
    }, 5000);
  };

  const handleSecondTap = (entryId: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmMedication(entryId);
    triggerHaptic();
    setConfirmingId(null);
  };

  const handleSkip = (entryId: string, reason: string) => {
    skipMedication(entryId);
    setSkipDialogId(null);
  };

  const waitingMeds = todaySchedule.filter((e) => e.status === 'waiting');
  const confirmedMeds = todaySchedule.filter((e) => e.status === 'taken' || e.status === 'missed');

  const today = new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="bg-medication text-white px-6 py-4 flex items-center justify-between">
        <div className="w-16" />
        <div className="text-center">
          <p className="font-bold text-lg">{parent.name}</p>
        </div>
        <p className="text-lg font-mono w-16 text-right">{currentTime}</p>
      </div>

      {/* Offline banner (R4) */}
      {isOffline && (
        <div className="bg-offline px-6 py-3 text-center">
          <p className="text-xl font-bold text-foreground">
            PRACUJETE BEZ INTERNETU — LÉKY SE ULOŽÍ
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex">
        <button
          onClick={() => setActiveTab('leky')}
          className={`flex-1 py-4 text-center font-bold text-xl transition-colors ${
            activeTab === 'leky'
              ? 'bg-medication text-white'
              : 'bg-surface text-muted'
          }`}
          style={{ height: '64px', fontSize: '28px' }}
        >
          LÉKY
        </button>
        <button
          onClick={() => setActiveTab('ukoly')}
          className={`flex-1 py-4 text-center font-bold text-xl transition-colors ${
            activeTab === 'ukoly'
              ? 'bg-medication text-white'
              : 'bg-surface text-muted'
          }`}
          style={{ height: '64px', fontSize: '28px' }}
        >
          ÚKOLY
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        {activeTab === 'leky' && (
          <>
            <h1 className="text-4xl font-bold text-foreground uppercase text-center mb-2">
              VAŠE LÉKY
            </h1>
            <p className="text-xl text-muted text-center mb-6">Dnes, {today}</p>

            {/* All done */}
            {waitingMeds.length === 0 && confirmedMeds.length > 0 && (
              <div className="text-center py-8 mb-6">
                <span className="text-6xl block mb-4">🎉</span>
                <p className="text-2xl font-bold text-compliance-ok">Všechny léky potvrzeny!</p>
              </div>
            )}

            {waitingMeds.length === 0 && confirmedMeds.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">✨</span>
                <p className="text-2xl text-muted">Dnes žádné léky</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Waiting medications */}
              {waitingMeds.map((entry) => {
                const isConfirming = confirmingId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border-2 border-medication/30 p-5 shadow-sm"
                    style={{ minHeight: '120px' }}
                  >
                    <p className="text-xl text-muted mb-1">⏰ {entry.scheduledTime}</p>
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {entry.medicationName}
                    </p>
                    <p className="text-xl text-muted mb-4">{entry.dosage}</p>

                    {/* VZAL JSEM / POTVRDIT ✓ button */}
                    <button
                      onClick={() => isConfirming ? handleSecondTap(entry.id) : handleFirstTap(entry.id)}
                      className={`w-full text-white font-bold rounded-2xl flex items-center justify-center transition-colors ${
                        isConfirming
                          ? 'bg-[#2E7D32] animate-pulse'
                          : 'bg-compliance-ok'
                      }`}
                      style={{ height: '80px', fontSize: '48px' }}
                    >
                      {isConfirming ? 'POTVRDIT ✓' : 'VZAL JSEM'}
                    </button>

                    {/* TEĎ NE button */}
                    <button
                      onClick={() => setSkipDialogId(entry.id)}
                      className="w-full mt-3 bg-external text-white font-bold rounded-2xl flex items-center justify-center"
                      style={{ height: '56px', fontSize: '36px' }}
                    >
                      TEĎ NE
                    </button>
                  </div>
                );
              })}

              {/* Confirmed medications */}
              {confirmedMeds.map((entry) => {
                const isTaken = entry.status === 'taken';
                return (
                  <div
                    key={entry.id}
                    className={`rounded-2xl p-5 ${
                      isTaken ? 'bg-success-light' : 'bg-sos-light'
                    }`}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{isTaken ? '✓' : '✕'}</span>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {entry.medicationName}
                        </p>
                        <p className="text-xl text-muted">{entry.dosage}</p>
                        <p className={`text-xl font-bold ${isTaken ? 'text-compliance-ok' : 'text-compliance-miss'}`}>
                          {isTaken ? 'PODÁNO' : 'VYNECHÁNO'}
                        </p>
                        {entry.offlineConfirmed && (
                          <span className="text-base text-external">⏳ Čeká na sync</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'ukoly' && (
          <>
            <h1 className="text-4xl font-bold text-foreground uppercase text-center mb-6">
              VAŠE ÚKOLY
            </h1>
            <div className="text-center py-12">
              <p className="text-2xl text-muted">DNES ŽÁDNÉ ÚKOLY</p>
            </div>
          </>
        )}
      </div>

      {/* Skip reason dialog */}
      {skipDialogId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-auto">
            <h3 className="text-3xl font-bold text-center mb-6">PROČ?</h3>
            <div className="space-y-3">
              {['NECHCI', 'NEMÁM LÉK', 'JINÝ DŮVOD'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleSkip(skipDialogId, reason)}
                  className="w-full bg-surface text-foreground font-bold rounded-2xl flex items-center justify-center"
                  style={{ height: '56px', fontSize: '24px' }}
                >
                  {reason}
                </button>
              ))}
              <button
                onClick={() => setSkipDialogId(null)}
                className="w-full text-muted font-bold rounded-2xl flex items-center justify-center"
                style={{ height: '56px', fontSize: '20px' }}
              >
                ZPĚT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom link */}
      <div className="px-5 py-6 text-center">
        <Link
          href="/dashboard"
          className="text-medication font-medium text-base inline-flex items-center gap-2"
        >
          ← Zpět do aplikace
        </Link>
      </div>
    </div>
  );
}
