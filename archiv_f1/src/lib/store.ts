'use client';

import { createContext, useContext } from 'react';
import type { AppState, ParentId } from './types';

export const defaultAppState: AppState = {
  activeParent: 'mama',
  isOnboarded: false,
  subscriptionTier: 'trial',
  trialDaysLeft: 30,
};

export const AppContext = createContext<{
  state: AppState;
  setActiveParent: (id: ParentId) => void;
  completeOnboarding: () => void;
}>({
  state: defaultAppState,
  setActiveParent: () => {},
  completeOnboarding: () => {},
});

export const useApp = () => useContext(AppContext);
