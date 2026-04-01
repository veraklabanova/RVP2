'use client';

import { createContext, useContext } from 'react';
import type { MedicationScheduleEntry, ComplianceDay } from './types';

export const MedicationContext = createContext<{
  todaySchedule: MedicationScheduleEntry[];
  weekCompliance: ComplianceDay[];
  confirmMedication: (entryId: string, confirmedBy?: string) => void;
  skipMedication: (entryId: string) => void;
}>({
  todaySchedule: [],
  weekCompliance: [],
  confirmMedication: () => {},
  skipMedication: () => {},
});

export const useMedication = () => useContext(MedicationContext);
