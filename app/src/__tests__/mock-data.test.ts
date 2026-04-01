import { describe, it, expect } from 'vitest';
import {
  parents,
  tasks,
  calendarEvents,
  familyMembers,
  medicationSchedule,
  complianceWeek,
  notifications,
  chatThreads,
  claimTestQuestions,
  claimTestResults,
  calendarSources,
  externalCalendarEvents,
  ocrScanResults,
  monthlyReports,
  seniorPairingCode,
  claimGuides,
  claimSteps,
} from '@/data/mock';

describe('Mock Data Integrity', () => {
  // =========================================================================
  // Phase 1 data
  // =========================================================================

  describe('Parents', () => {
    it('has mama and tata profiles', () => {
      expect(parents.mama).toBeDefined();
      expect(parents.tata).toBeDefined();
    });

    it('parent profiles have all required fields', () => {
      for (const parent of Object.values(parents)) {
        expect(parent.id).toBeTruthy();
        expect(parent.name).toBeTruthy();
        expect(parent.birthYear).toBeGreaterThan(1900);
        expect(parent.bloodType).toBeTruthy();
        expect(parent.allergies.length).toBeGreaterThan(0);
        expect(parent.criticalDiagnoses.length).toBeGreaterThan(0);
        expect(parent.medications.length).toBeGreaterThan(0);
        expect(parent.iceContact.name).toBeTruthy();
        expect(parent.iceContact.phone).toBeTruthy();
      }
    });

    it('medications have unique IDs', () => {
      const allMeds = Object.values(parents).flatMap((p) => p.medications);
      const ids = allMeds.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Tasks', () => {
    it('has tasks for both parents', () => {
      expect(tasks.filter((t) => t.parentId === 'mama').length).toBeGreaterThan(0);
      expect(tasks.filter((t) => t.parentId === 'tata').length).toBeGreaterThan(0);
    });

    it('all tasks have valid category', () => {
      const validCategories = ['medical', 'admin', 'operational'];
      tasks.forEach((t) => {
        expect(validCategories).toContain(t.category);
      });
    });
  });

  describe('Calendar Events', () => {
    it('has events for both parents', () => {
      expect(calendarEvents.filter((e) => e.parentId === 'mama').length).toBeGreaterThan(0);
      expect(calendarEvents.filter((e) => e.parentId === 'tata').length).toBeGreaterThan(0);
    });

    it('events have valid dates', () => {
      calendarEvents.forEach((e) => {
        expect(new Date(e.date).toString()).not.toBe('Invalid Date');
      });
    });
  });

  describe('Family Members', () => {
    it('has at least 3 members', () => {
      expect(familyMembers.length).toBeGreaterThanOrEqual(3);
    });

    it('has a garant role', () => {
      expect(familyMembers.some((m) => m.role === 'garant')).toBe(true);
    });
  });

  // =========================================================================
  // Phase 2 data
  // =========================================================================

  describe('Medication Schedule (Phase 2)', () => {
    it('has entries for both parents', () => {
      expect(medicationSchedule.filter((e) => e.parentId === 'mama').length).toBeGreaterThan(0);
      expect(medicationSchedule.filter((e) => e.parentId === 'tata').length).toBeGreaterThan(0);
    });

    it('entries have valid status', () => {
      const validStatuses = ['waiting', 'taken', 'missed'];
      medicationSchedule.forEach((e) => {
        expect(validStatuses).toContain(e.status);
      });
    });

    it('taken entries have confirmedAt and confirmedBy', () => {
      medicationSchedule.filter((e) => e.status === 'taken').forEach((e) => {
        expect(e.confirmedAt).toBeTruthy();
        expect(e.confirmedBy).toBeTruthy();
      });
    });

    it('entries reference valid medication IDs from parents', () => {
      const allMedIds = Object.values(parents).flatMap((p) => p.medications.map((m) => m.id));
      medicationSchedule.forEach((e) => {
        expect(allMedIds).toContain(e.medicationId);
      });
    });
  });

  describe('Compliance Week (Phase 2)', () => {
    it('has 7 days', () => {
      expect(complianceWeek.length).toBe(7);
    });

    it('each day has entries', () => {
      complianceWeek.forEach((day) => {
        expect(day.date).toBeTruthy();
        expect(day.entries.length).toBeGreaterThan(0);
      });
    });

    it('dates are consecutive', () => {
      for (let i = 1; i < complianceWeek.length; i++) {
        const prev = new Date(complianceWeek[i - 1].date).getTime();
        const curr = new Date(complianceWeek[i].date).getTime();
        expect(curr - prev).toBe(86400000); // 1 day
      }
    });
  });

  describe('Notifications (Phase 2)', () => {
    it('has at least 10 notifications', () => {
      expect(notifications.length).toBeGreaterThanOrEqual(10);
    });

    it('covers all categories', () => {
      const categories = new Set(notifications.map((n) => n.category));
      expect(categories).toContain('leky');
      expect(categories).toContain('kalendar');
      expect(categories).toContain('rodina');
      expect(categories).toContain('system');
    });

    it('has mix of read/unread', () => {
      expect(notifications.some((n) => n.read)).toBe(true);
      expect(notifications.some((n) => !n.read)).toBe(true);
    });

    it('has valid priority values', () => {
      const validPriorities = ['high', 'normal', 'low'];
      notifications.forEach((n) => {
        expect(validPriorities).toContain(n.priority);
      });
    });
  });

  describe('Chat Threads (Phase 2)', () => {
    it('has at least 3 threads', () => {
      expect(chatThreads.length).toBeGreaterThanOrEqual(3);
    });

    it('threads have messages', () => {
      chatThreads.forEach((thread) => {
        expect(thread.messages.length).toBeGreaterThan(0);
      });
    });

    it('messages reference correct threadId', () => {
      chatThreads.forEach((thread) => {
        thread.messages.forEach((msg) => {
          expect(msg.threadId).toBe(thread.id);
        });
      });
    });

    it('thread-3 is linked to doc-plnamoc', () => {
      const thread3 = chatThreads.find((t) => t.id === 'thread-3');
      expect(thread3).toBeDefined();
      expect(thread3!.contextType).toBe('document');
      expect(thread3!.contextId).toBe('doc-plnamoc');
    });
  });

  describe('Claim Test (Phase 2)', () => {
    it('has 8 questions', () => {
      expect(claimTestQuestions.length).toBe(8);
    });

    it('each question has at least 3 options', () => {
      claimTestQuestions.forEach((q) => {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('has results with priorities', () => {
      expect(claimTestResults.length).toBeGreaterThan(0);
      const priorities = new Set(claimTestResults.map((r) => r.priority));
      expect(priorities.has('high')).toBe(true);
    });

    it('some results are premium-gated', () => {
      expect(claimTestResults.some((r) => r.premium === true)).toBe(true);
    });
  });

  describe('Calendar Sources (Phase 2)', () => {
    it('has google and apple sources', () => {
      expect(calendarSources.some((s) => s.provider === 'google')).toBe(true);
      expect(calendarSources.some((s) => s.provider === 'apple')).toBe(true);
    });

    it('google is connected, apple is not', () => {
      const google = calendarSources.find((s) => s.provider === 'google')!;
      const apple = calendarSources.find((s) => s.provider === 'apple')!;
      expect(google.connected).toBe(true);
      expect(apple.connected).toBe(false);
    });
  });

  describe('External Calendar Events (Phase 2)', () => {
    it('has at least 3 events', () => {
      expect(externalCalendarEvents.length).toBeGreaterThanOrEqual(3);
    });

    it('all events are marked as external', () => {
      externalCalendarEvents.forEach((e) => {
        expect(e.isExternal).toBe(true);
      });
    });

    it('has mix of shared/private events', () => {
      expect(externalCalendarEvents.some((e) => e.sharedWithFamily)).toBe(true);
      expect(externalCalendarEvents.some((e) => !e.sharedWithFamily)).toBe(true);
    });
  });

  describe('OCR Scan Results (Phase 2)', () => {
    it('has scan results', () => {
      expect(ocrScanResults.length).toBeGreaterThan(0);
    });

    it('scans have extracted medications', () => {
      ocrScanResults.forEach((scan) => {
        expect(scan.extractedMedications.length).toBeGreaterThan(0);
        expect(scan.confidence).toBeGreaterThan(0);
        expect(scan.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Monthly Reports (Phase 2)', () => {
    it('has at least one report', () => {
      expect(monthlyReports.length).toBeGreaterThan(0);
    });

    it('report has correct structure', () => {
      const report = monthlyReports[0];
      expect(report.complianceRate).toBeGreaterThan(0);
      expect(report.complianceRate).toBeLessThanOrEqual(100);
      expect(report.sections.compliance.total).toBe(
        report.sections.compliance.taken + report.sections.compliance.missed
      );
      expect(report.sections.visits.length).toBeGreaterThan(0);
      expect(report.sections.familyActivity.length).toBeGreaterThan(0);
    });
  });

  describe('Senior Pairing Code (Phase 2)', () => {
    it('has 6-digit code', () => {
      expect(seniorPairingCode.code).toMatch(/^\d{6}$/);
    });

    it('has expiration after creation', () => {
      const created = new Date(seniorPairingCode.createdAt).getTime();
      const expires = new Date(seniorPairingCode.expiresAt).getTime();
      expect(expires).toBeGreaterThan(created);
    });
  });

  describe('Claim Guides (Phase 2)', () => {
    it('has 5 guide types', () => {
      expect(Object.keys(claimGuides).length).toBe(5);
    });

    it('pnp guide uses the original claimSteps', () => {
      expect(claimGuides.pnp).toBe(claimSteps);
    });

    it('each guide has steps with valid status', () => {
      const validStatuses = ['done', 'active', 'pending', 'locked'];
      Object.values(claimGuides).forEach((steps) => {
        expect(steps.length).toBeGreaterThan(0);
        steps.forEach((step) => {
          expect(validStatuses).toContain(step.status);
        });
      });
    });
  });
});
