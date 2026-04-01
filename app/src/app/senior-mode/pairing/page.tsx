'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { seniorPairingCode } from '@/data/mock';

export default function SeniorPairingPage() {
  const [inputCode, setInputCode] = useState('');
  const [paired, setPaired] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(30);

  useEffect(() => {
    // Calculate initial minutes from mock data
    const expires = new Date(seniorPairingCode.expiresAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.round((expires - now) / 60000));
    setMinutesLeft(diff > 0 ? diff : 30); // Fallback to 30 if expired (mock data)

    const interval = setInterval(() => {
      setMinutesLeft((prev) => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handlePair = () => {
    if (inputCode.length === 6) {
      setPaired(true);
    }
  };

  const codeDigits = seniorPairingCode.code.split('');

  if (paired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <span className="text-6xl mb-6">✅</span>
        <h1 className="text-2xl font-bold text-foreground mb-3 text-center">
          Zařízení spárováno!
        </h1>
        <p className="text-muted text-center mb-8">
          Senior režim je nyní aktivní na spárovaném zařízení.
        </p>
        <Link
          href="/nastaveni"
          className="bg-medication text-white font-semibold rounded-xl px-8 py-3 text-center hover:bg-medication/90 transition-colors"
        >
          Zpět do nastavení
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-2 text-center">
        Spárování zařízení
      </h1>
      <p className="text-sm text-muted text-center mb-8">
        Zadejte tento kód na zařízení seniora
      </p>

      {/* Large pairing code display */}
      <div className="flex justify-center gap-3 mb-4">
        {codeDigits.map((digit, i) => (
          <div
            key={i}
            className="w-14 h-16 bg-medication-light border-2 border-medication rounded-xl flex items-center justify-center"
          >
            <span className="text-3xl font-bold text-medication tracking-[0.5em] pl-[0.5em]">
              {digit}
            </span>
          </div>
        ))}
      </div>

      {/* Timer */}
      <p className="text-sm text-muted text-center mb-8">
        Kód vyprší za {minutesLeft} {minutesLeft === 1 ? 'minutu' : minutesLeft >= 2 && minutesLeft <= 4 ? 'minuty' : 'minut'}
      </p>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">Nebo zadejte kód zde:</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Code input */}
      <div className="mb-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-border rounded-xl px-4 py-4 focus:border-medication focus:outline-none transition-colors"
        />
      </div>

      <button
        onClick={handlePair}
        disabled={inputCode.length !== 6}
        className={`w-full font-semibold rounded-xl py-4 text-center transition-colors ${
          inputCode.length === 6
            ? 'bg-medication text-white hover:bg-medication/90'
            : 'bg-border text-muted cursor-not-allowed'
        }`}
      >
        Spárovat
      </button>

      {/* Back link */}
      <div className="text-center mt-8">
        <Link
          href="/nastaveni"
          className="text-medication font-medium text-sm inline-flex items-center gap-1"
        >
          ← Zpět do nastavení
        </Link>
      </div>
    </div>
  );
}
