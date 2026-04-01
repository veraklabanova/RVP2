'use client';

import { createContext, useContext } from 'react';
import type { Notification } from './types';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export const defaultNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

export const NotificationContext = createContext<{
  state: NotificationState;
  markRead: (id: string) => void;
  markAllRead: () => void;
  archiveNotification: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => void;
}>({
  state: defaultNotificationState,
  markRead: () => {},
  markAllRead: () => {},
  archiveNotification: () => {},
  addNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);
