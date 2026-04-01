'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { claimTestQuestions, claimTestResults } from '@/data/mock';
import { useApp } from '@/lib/store';

const STORAGE_KEY = 'rvp-smart-test-progress';

interface SavedProgress {
  currentQuestion: number;
  answers: Record<string, string>;
}

export default function TestNarokuPage() {
  const { state } = useApp();
  const isPremium = state.subscriptionTier !== 'trial' && state.subscriptionTier !== 'freezer';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load saved progress (R6)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const progress: SavedProgress = JSON.parse(saved);
        if (progress.currentQuestion > 0 && Object.keys(progress.answers).length > 0) {
          setShowResumeDialog(true);
          return;
        }
      } catch { /* ignore */ }
    }
    setInitialized(true);
  }, []);

  const handleResume = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const progress: SavedProgress = JSON.parse(saved);
        setCurrentQuestion(progress.currentQuestion);
        setAnswers(progress.answers);
      } catch { /* ignore */ }
    }
    setShowResumeDialog(false);
    setInitialized(true);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResumeDialog(false);
    setInitialized(true);
  };

  // Save progress after each answer (R6)
  useEffect(() => {
    if (initialized && !showResults && Object.keys(answers).length > 0) {
      const progress: SavedProgress = { currentQuestion, answers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [currentQuestion, answers, initialized, showResults]);

  const totalQuestions = claimTestQuestions.length;
  const question = claimTestQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => setShowResults(true), 400);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const priorityStyles = {
    high: { bg: 'bg-sos-light', text: 'text-sos', label: 'Vysoká priorita' },
    medium: { bg: 'bg-warning-light', text: 'text-warning', label: 'Střední priorita' },
    low: { bg: 'bg-surface', text: 'text-muted', label: 'Doplňkové' },
  };

  // Resume dialog (R6)
  if (showResumeDialog) {
    const saved = localStorage.getItem(STORAGE_KEY);
    let savedQ = 0;
    try { savedQ = JSON.parse(saved || '{}').currentQuestion || 0; } catch { /* ignore */ }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-2">Rozpracovaný test</h2>
          <p className="text-sm text-muted mb-4">
            Máte rozpracovaný test ({savedQ}/{totalQuestions} otázek). Chcete pokračovat, nebo začít znovu?
          </p>
          <div className="space-y-3">
            <button
              onClick={handleResume}
              className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm"
            >
              Pokračovat v testu
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full border border-border rounded-lg py-3 text-sm font-medium text-muted"
            >
              Začít znovu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const eligibleResults = claimTestResults.filter((r) => r.eligible);

    return (
      <div className="px-4 py-5 space-y-5">
        <div className="text-center">
          <span className="text-5xl block mb-3">🗺️</span>
          <h1 className="text-2xl font-bold text-foreground mb-1">Vaše Mapa nároků</h1>
          <p className="text-sm text-muted">Na základě vašich odpovědí jsme identifikovali tyto nároky:</p>
        </div>

        {/* Summary card */}
        <div className="bg-success-light border border-success/20 rounded-xl p-4 text-center">
          <p className="text-sm text-muted mb-1">Váš blízký má pravděpodobně nárok na:</p>
          <p className="text-2xl font-extrabold text-success">až 32 900 Kč/měsíc</p>
        </div>

        <div className="space-y-3">
          {eligibleResults.map((result) => {
            const pStyle = priorityStyles[result.priority];
            const isLocked = result.premium && !isPremium;
            return (
              <div
                key={result.claimId}
                className={`bg-white rounded-xl border p-4 ${isLocked ? 'border-border opacity-75' : 'border-primary/20'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground">{result.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pStyle.bg} ${pStyle.text}`}>
                    {pStyle.label}
                  </span>
                </div>
                {result.estimatedAmount && (
                  <p className="text-lg font-extrabold text-primary mb-1">
                    {isLocked ? '🔒 Skryto' : result.estimatedAmount}
                  </p>
                )}
                <p className="text-sm text-muted mb-3">{result.description}</p>
                {isLocked ? (
                  <div className="bg-medication-light rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-medication">🔒 Kompletní návod dostupný v Premium</p>
                  </div>
                ) : (
                  <Link href={result.ctaRoute} className="block w-full text-center bg-primary text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-primary-light transition-colors">
                    Otevřít průvodce →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted text-center">
          Částky jsou orientační odhady. Skutečný nárok závisí na individuálním posouzení.
        </p>

        {/* Premium upsell */}
        {!isPremium && (
          <div className="bg-medication-light border border-medication/20 rounded-xl p-4">
            <h3 className="font-bold text-medication mb-2">🔓 Odemkněte kompletní Mapu nároků</h3>
            <p className="text-sm text-muted mb-3">
              Získejte detailní návody, vzory odvolání a insider tipy.
            </p>
            <Link
              href="/nastaveni"
              className="block w-full text-center bg-medication text-white rounded-lg py-3 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Aktivovat Premium – 199 Kč/měsíc
            </Link>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleRestart} className="flex-1 border border-border rounded-lg py-3 text-sm font-medium text-muted">
            Opakovat test
          </button>
          <Link href="/pruvodce" className="flex-1 text-center bg-primary text-white rounded-lg py-3 text-sm font-semibold">
            Zpět na průvodce
          </Link>
        </div>
      </div>
    );
  }

  if (!initialized) return null;

  // Question wizard
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`text-sm font-medium min-h-0 ${currentQuestion === 0 ? 'text-border' : 'text-primary'}`}
            >
              ← Zpět
            </button>
            <Link href="/pruvodce" className="text-sm text-muted min-h-0">Zavřít ✕</Link>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted mt-1.5">Otázka {currentQuestion + 1} z {totalQuestions}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-foreground mb-6">{question.text}</h2>
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-white hover:border-primary/40'
                }`}
                style={{ height: '56px' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
