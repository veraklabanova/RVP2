import { describe, it, expect } from 'vitest';
import { defaultAppState } from '@/lib/store';
import { defaultNotificationState } from '@/lib/notification-store';

// =========================================================================
// App Store Defaults
// =========================================================================

describe('App Store', () => {
  it('has correct default state', () => {
    expect(defaultAppState.activeParent).toBe('mama');
    expect(defaultAppState.isOnboarded).toBe(false);
    expect(defaultAppState.subscriptionTier).toBe('trial');
    expect(defaultAppState.trialDaysLeft).toBe(30);
    expect(defaultAppState.seniorMode).toBe(false);
    expect(defaultAppState.unreadNotifications).toBe(0);
  });
});

// =========================================================================
// Notification Store Defaults
// =========================================================================

describe('Notification Store', () => {
  it('has correct default state', () => {
    expect(defaultNotificationState.notifications).toEqual([]);
    expect(defaultNotificationState.unreadCount).toBe(0);
  });
});
