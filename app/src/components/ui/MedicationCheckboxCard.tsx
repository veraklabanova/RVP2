'use client';

import type { MedicationScheduleEntry } from '@/lib/types';

interface MedicationCheckboxCardProps {
  entry: MedicationScheduleEntry;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function MedicationCheckboxCard({ entry, onConfirm, onSkip }: MedicationCheckboxCardProps) {
  const isWaiting = entry.status === 'waiting';
  const isTaken = entry.status === 'taken';
  const isMissed = entry.status === 'missed';

  const bgClass = isTaken
    ? 'bg-[#E8F5E9]'
    : isMissed
      ? 'bg-[#FFEBEE]'
      : 'bg-white';

  const borderPulseClass = isWaiting ? 'animate-pulse' : '';

  return (
    <div
      className={`rounded-xl border border-border border-l-4 border-l-medication p-4 ${bgClass} ${borderPulseClass} transition-colors`}
    >
      <div className="flex items-center gap-3">
        {/* Status circle */}
        <div className="flex-shrink-0">
          {isWaiting && (
            <div className="w-7 h-7 rounded-full border-2 border-medication flex items-center justify-center" />
          )}
          {isTaken && (
            <div className="w-7 h-7 rounded-full bg-compliance-ok flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
          {isMissed && (
            <div className="w-7 h-7 rounded-full bg-compliance-miss flex items-center justify-center">
              <span className="text-white text-sm font-bold">✗</span>
            </div>
          )}
        </div>

        {/* Medication info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground">{entry.medicationName}</p>
          <p className="text-xs text-muted">{entry.dosage}</p>
          <p className="text-xs text-muted mt-0.5">
            {isWaiting && (
              <>⏰ {entry.scheduledTime}</>
            )}
            {isTaken && entry.confirmedAt && (
              <>✓ Potvrzeno v {new Date(entry.confirmedAt).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</>
            )}
            {isMissed && (
              <span className="text-compliance-miss font-medium">Vynecháno</span>
            )}
          </p>
        </div>

        {/* Action buttons for waiting state */}
        {isWaiting && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onConfirm}
              className="w-11 h-11 rounded-full bg-compliance-ok text-white flex items-center justify-center text-lg font-bold hover:bg-compliance-ok/90 transition-colors"
              aria-label="Potvrdit užití léku"
            >
              ✓
            </button>
            <button
              onClick={onSkip}
              className="w-11 h-11 rounded-full bg-border text-muted flex items-center justify-center text-lg font-bold hover:bg-border/80 transition-colors"
              aria-label="Přeskočit lék"
            >
              ✗
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
