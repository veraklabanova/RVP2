'use client';

import type { ComplianceDay } from '@/lib/types';

interface ComplianceGridProps {
  data: ComplianceDay[];
}

const dayLabels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

function getCellColor(day: ComplianceDay | undefined): string {
  if (!day || day.entries.length === 0) return 'bg-border';

  const hasMissed = day.entries.some((e) => e.status === 'missed');
  if (hasMissed) return 'bg-compliance-miss';

  const allTaken = day.entries.every((e) => e.status === 'taken');
  if (allTaken) return 'bg-compliance-ok';

  // Has waiting entries (future / in progress)
  return 'bg-border';
}

function calculateWeeklyCompliance(data: ComplianceDay[]): number {
  let taken = 0;
  let total = 0;

  data.forEach((day) => {
    day.entries.forEach((entry) => {
      if (entry.status === 'taken' || entry.status === 'missed') {
        total++;
        if (entry.status === 'taken') taken++;
      }
    });
  });

  if (total === 0) return 100;
  return Math.round((taken / total) * 100);
}

export default function ComplianceGrid({ data }: ComplianceGridProps) {
  const compliance = calculateWeeklyCompliance(data);

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-xs text-muted font-medium">
            {label}
          </div>
        ))}
      </div>

      {/* Compliance cells */}
      <div className="grid grid-cols-7 gap-1.5 justify-items-center">
        {data.slice(0, 7).map((day, i) => (
          <div
            key={day.date || i}
            className={`w-8 h-8 rounded-md ${getCellColor(day)}`}
            title={day.date}
          />
        ))}
        {/* Fill remaining cells if less than 7 days */}
        {Array.from({ length: Math.max(0, 7 - data.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-8 h-8 rounded-md bg-border"
          />
        ))}
      </div>

      {/* Summary text */}
      <p className="text-xs text-muted mt-2 text-center">
        Týdenní úspěšnost: {compliance}%
      </p>
    </div>
  );
}
