'use client';

import { createContext, useContext } from 'react';
import type { AppState, ParentId } from './types';

export const defaultAppState: AppState = {
  activeParent: 'mama',
  isOnboarded: false,
  subscriptionTier: 'trial',
  trialDaysLeft: 30,
  seniorMode: false,
  unreadNotifications: 0,
};

export const AppContext = createContext<{
  state: AppState;
  setActiveParent: (id: ParentId) => void;
  completeOnboarding: () => void;
  toggleSeniorMode: () => void;
  setUnreadNotifications: (count: number) => void;
}>({
  state: defaultAppState,
  setActiveParent: () => {},
  completeOnboarding: () => {},
  toggleSeniorMode: () => {},
  setUnreadNotifications: () => {},
});

export const useApp = () => useContext(AppContext);
