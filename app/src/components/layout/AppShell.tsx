'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { AppContext, defaultAppState } from '@/lib/store';
import { NotificationContext } from '@/lib/notification-store';
import { ChatContext } from '@/lib/chat-store';
import { MedicationContext } from '@/lib/medication-store';
import type { AppState, ParentId, Notification, ChatThread, ChatMessage, MedicationScheduleEntry, ComplianceDay } from '@/lib/types';
import { notifications as mockNotifications, chatThreads as mockChatThreads, medicationSchedule as mockMedSchedule, complianceWeek as mockCompliance } from '@/data/mock';

const noShellRoutes = ['/onboarding', '/sos', '/senior-mode'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideShell = noShellRoutes.some((r) => pathname.startsWith(r));

  // === App State ===
  const [state, setState] = useState<AppState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rvp-state');
      if (saved) {
        try { return { ...defaultAppState, ...JSON.parse(saved) }; } catch { /* ignore */ }
      }
    }
    return defaultAppState;
  });

  const setActiveParent = (id: ParentId) => {
    setState((prev) => {
      const next = { ...prev, activeParent: id };
      localStorage.setItem('rvp-state', JSON.stringify(next));
      return next;
    });
  };

  const completeOnboarding = () => {
    setState((prev) => {
      const next = { ...prev, isOnboarded: true };
      localStorage.setItem('rvp-state', JSON.stringify(next));
      return next;
    });
  };

  const toggleSeniorMode = () => {
    setState((prev) => {
      const next = { ...prev, seniorMode: !prev.seniorMode };
      localStorage.setItem('rvp-state', JSON.stringify(next));
      return next;
    });
  };

  const setUnreadNotifications = (count: number) => {
    setState((prev) => ({ ...prev, unreadNotifications: count }));
  };

  // === Notification State ===
  const [notifications, setNotifications] = useState<Notification[]>(() => mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, archived: true } : n));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      archived: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // === Chat State ===
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => mockChatThreads);

  const getThread = useCallback((contextType: string, contextId: string) => {
    return chatThreads.find((t) => t.contextType === contextType && t.contextId === contextId);
  }, [chatThreads]);

  const getOrCreateThread = useCallback((contextType: string, contextId: string, contextLabel: string): ChatThread => {
    const existing = chatThreads.find((t) => t.contextType === contextType && t.contextId === contextId);
    if (existing) return existing;
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      contextType: contextType as ChatThread['contextType'],
      contextId,
      contextLabel,
      messages: [],
      lastActivity: new Date().toISOString(),
    };
    setChatThreads((prev) => [...prev, newThread]);
    return newThread;
  }, [chatThreads]);

  const sendMessage = useCallback((threadId: string, senderId: string, senderName: string, text: string, mentions?: string[]) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      mentions,
    };
    setChatThreads((prev) => prev.map((t) => {
      if (t.id !== threadId) return t;
      return { ...t, messages: [...t.messages, newMessage], lastActivity: newMessage.timestamp };
    }));
    if (mentions && mentions.length > 0) {
      addNotification({
        category: 'rodina',
        priority: 'normal',
        title: `${senderName} vás zmínil/a`,
        body: text.length > 80 ? text.slice(0, 80) + '...' : text,
        actionUrl: '/dashboard',
      });
    }
  }, [addNotification]);

  // === Medication State ===
  const [medSchedule, setMedSchedule] = useState<MedicationScheduleEntry[]>(() => mockMedSchedule);
  const [weekCompliance] = useState<ComplianceDay[]>(() => mockCompliance);

  const todaySchedule = medSchedule.filter((e) => e.parentId === state.activeParent);

  const confirmMedication = useCallback((entryId: string, confirmedBy?: string) => {
    setMedSchedule((prev) => prev.map((e) => {
      if (e.id !== entryId) return e;
      return { ...e, status: 'taken' as const, confirmedAt: new Date().toISOString(), confirmedBy: confirmedBy || 'user' };
    }));
  }, []);

  const skipMedication = useCallback((entryId: string) => {
    setMedSchedule((prev) => prev.map((e) => {
      if (e.id !== entryId) return e;
      return { ...e, status: 'missed' as const };
    }));
    addNotification({
      category: 'leky',
      priority: 'high',
      title: 'Lék vynechán',
      body: 'Lék nebyl podán. Kontaktujte rodinného člena.',
    });
  }, [addNotification]);

  // === Render ===

  if (pathname === '/' || (pathname === '/onboarding' && !state.isOnboarded)) {
    return (
      <AppContext value={{ state, setActiveParent, completeOnboarding, toggleSeniorMode, setUnreadNotifications }}>
        {children}
      </AppContext>
    );
  }

  return (
    <AppContext value={{ state, setActiveParent, completeOnboarding, toggleSeniorMode, setUnreadNotifications }}>
      <NotificationContext value={{ state: { notifications, unreadCount }, markRead, markAllRead, archiveNotification, addNotification }}>
        <ChatContext value={{ threads: chatThreads, getThread, sendMessage, getOrCreateThread }}>
          <MedicationContext value={{ todaySchedule, weekCompliance, confirmMedication, skipMedication }}>
            {!hideShell && <TopNav />}
            <main className={hideShell ? '' : 'pt-14 pb-24'}>
              <div className="max-w-lg mx-auto">{children}</div>
            </main>
            {!hideShell && (
              <>
                <div className="fixed bottom-14 left-0 right-0 z-40 bg-warning-light border-t border-warning/40">
                  <div className="max-w-lg mx-auto px-4 py-2">
                    <p className="text-xs text-foreground/80 text-center">
                      <strong>Prototyp:</strong> Toto je funkční prototyp pro demonstraci UI/UX. Data jsou fiktivní (do 15.&nbsp;1.&nbsp;2024).
                    </p>
                  </div>
                </div>
                <BottomNav />
              </>
            )}
          </MedicationContext>
        </ChatContext>
      </NotificationContext>
    </AppContext>
  );
}
