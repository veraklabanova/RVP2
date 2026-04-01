import { describe, it, expect } from 'vitest';
import type {
  Parent,
  AppState,
  MedicationScheduleEntry,
  Notification,
  ChatThread,
  ClaimTestQuestion,
  CalendarSource,
  ExternalCalendarEvent,
  OCRScanResult,
  MonthlyReport,
  SeniorPairingCode,
  ComplianceDay,
  SyncStatus,
} from '@/lib/types';

/**
 * Type-level tests – tyto testy pouze ověřují, že typy jsou správně
 * definované a kompatibilní. Pokud se libovolný typ změní nekompatibilně,
 * TypeScript kompilace selže.
 */

describe('Type Definitions (compile-time check)', () => {
  it('AppState includes Phase 2 fields', () => {
    const state: AppState = {
      activeParent: 'mama',
      isOnboarded: true,
      subscriptionTier: 'trial',
      trialDaysLeft: 30,
      seniorMode: false,
      unreadNotifications: 5,
    };
    expect(state.seniorMode).toBe(false);
    expect(state.unreadNotifications).toBe(5);
  });

  it('MedicationScheduleEntry supports all statuses', () => {
    const statuses: MedicationScheduleEntry['status'][] = ['waiting', 'taken', 'missed'];
    expect(statuses.length).toBe(3);
  });

  it('Notification supports all categories', () => {
    const categories: Notification['category'][] = ['leky', 'kalendar', 'rodina', 'system'];
    expect(categories.length).toBe(4);
  });

  it('Notification supports all priorities', () => {
    const priorities: Notification['priority'][] = ['high', 'normal', 'low'];
    expect(priorities.length).toBe(3);
  });

  it('ChatThread supports all context types', () => {
    const types: ChatThread['contextType'][] = ['task', 'medication', 'event', 'document'];
    expect(types.length).toBe(4);
  });

  it('SyncStatus has all 4 variants', () => {
    const statuses: SyncStatus[] = ['synced', 'error', 'syncing', 'none'];
    expect(statuses.length).toBe(4);
  });

  it('CalendarSource supports google and apple', () => {
    const providers: CalendarSource['provider'][] = ['google', 'apple'];
    expect(providers.length).toBe(2);
  });

  it('ExternalCalendarEvent is always marked external', () => {
    const event: ExternalCalendarEvent = {
      id: 'e1',
      sourceId: 'cal-1',
      title: 'Test',
      date: '2024-01-20',
      isExternal: true,
      sharedWithFamily: false,
    };
    expect(event.isExternal).toBe(true);
  });

  it('OCRScanResult supports all document types', () => {
    const types: OCRScanResult['documentType'][] = ['erecept', 'zprava', 'lek'];
    expect(types.length).toBe(3);
  });

  it('MonthlyReport has compliance section with correct math', () => {
    const report: MonthlyReport = {
      id: 'r1',
      month: '2024-01',
      parentId: 'mama',
      complianceRate: 82,
      generatedAt: '2024-02-01T00:00:00',
      sections: {
        compliance: { taken: 82, missed: 18, total: 100 },
        visits: [],
        familyActivity: [],
      },
    };
    expect(report.sections.compliance.taken + report.sections.compliance.missed)
      .toBe(report.sections.compliance.total);
  });

  it('ComplianceDay has date and entries array', () => {
    const day: ComplianceDay = {
      date: '2024-01-20',
      entries: [],
    };
    expect(day.entries).toEqual([]);
  });

  it('SeniorPairingCode has all required fields', () => {
    const code: SeniorPairingCode = {
      code: '123456',
      createdBy: 'Marie',
      createdAt: '2024-01-20T09:00:00',
      expiresAt: '2024-01-20T09:30:00',
      parentId: 'mama',
    };
    expect(code.code.length).toBe(6);
  });
});
