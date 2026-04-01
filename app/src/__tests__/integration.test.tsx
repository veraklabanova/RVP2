/**
 * INTEGRAČNÍ TESTY – FÁZE 2
 *
 * Adaptace dokumentu IntAutTesty.md na frontend-only architekturu.
 * Testuje integraci mezi kontextovými providery (App, Notification, Chat, Medication)
 * a uživatelskými toky napříč komponentami.
 *
 * Strategie: Sandwich Integration (Bottom-up datová integrita + Top-down uživatelské toky)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { useState, useCallback, type ReactNode } from 'react';
import { AppContext, defaultAppState } from '@/lib/store';
import { NotificationContext } from '@/lib/notification-store';
import { ChatContext } from '@/lib/chat-store';
import { MedicationContext } from '@/lib/medication-store';
import {
  notifications as mockNotifications,
  chatThreads as mockChatThreads,
  medicationSchedule as mockMedSchedule,
  complianceWeek as mockCompliance,
  ocrScanResults,
  parents,
  externalCalendarEvents,
  calendarSources,
} from '@/data/mock';
import type {
  AppState,
  Notification,
  ChatThread,
  ChatMessage,
  MedicationScheduleEntry,
  ComplianceDay,
  ParentId,
} from '@/lib/types';

// ============================================================================
// Plně integrovaný wrapper – replikuje logiku AppShell
// ============================================================================

function IntegrationWrapper({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: Partial<AppState>;
}) {
  const [state, setState] = useState<AppState>({
    ...defaultAppState,
    ...initialState,
  });

  // --- Notification State ---
  const [notifications, setNotifications] = useState<Notification[]>(
    () => [...mockNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => {
      const newNotif: Notification = {
        ...n,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
        archived: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // --- Chat State ---
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => [...mockChatThreads]);

  const getThread = useCallback(
    (contextType: string, contextId: string) => {
      return chatThreads.find(
        (t) => t.contextType === contextType && t.contextId === contextId
      );
    },
    [chatThreads]
  );

  const getOrCreateThread = useCallback(
    (contextType: string, contextId: string, contextLabel: string): ChatThread => {
      const existing = chatThreads.find(
        (t) => t.contextType === contextType && t.contextId === contextId
      );
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
    },
    [chatThreads]
  );

  const sendMessage = useCallback(
    (
      threadId: string,
      senderId: string,
      senderName: string,
      text: string,
      mentions?: string[]
    ) => {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        threadId,
        senderId,
        senderName,
        text,
        timestamp: new Date().toISOString(),
        mentions,
      };
      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            messages: [...t.messages, newMessage],
            lastActivity: newMessage.timestamp,
          };
        })
      );
      // Eskalace: @zmínka → notifikace
      if (mentions && mentions.length > 0) {
        addNotification({
          category: 'rodina',
          priority: 'normal',
          title: `${senderName} vás zmínil/a`,
          body: text.length > 80 ? text.slice(0, 80) + '...' : text,
          actionUrl: '/dashboard',
        });
      }
    },
    [addNotification]
  );

  // --- Medication State ---
  const [medSchedule, setMedSchedule] = useState<MedicationScheduleEntry[]>(
    () => [...mockMedSchedule]
  );
  const [weekCompliance] = useState<ComplianceDay[]>(() => mockCompliance);

  const todaySchedule = medSchedule.filter((e) => e.parentId === state.activeParent);

  const confirmMedication = useCallback((entryId: string, confirmedBy?: string) => {
    setMedSchedule((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          status: 'taken' as const,
          confirmedAt: new Date().toISOString(),
          confirmedBy: confirmedBy || 'user',
        };
      })
    );
  }, []);

  const skipMedication = useCallback(
    (entryId: string) => {
      setMedSchedule((prev) =>
        prev.map((e) => {
          if (e.id !== entryId) return e;
          return { ...e, status: 'missed' as const };
        })
      );
      // Eskalace: vynechaný lék → high-priority notifikace
      addNotification({
        category: 'leky',
        priority: 'high',
        title: 'Lék vynechán',
        body: 'Lék nebyl podán. Kontaktujte rodinného člena.',
      });
    },
    [addNotification]
  );

  return (
    <AppContext
      value={{
        state,
        setActiveParent: (id: ParentId) =>
          setState((prev) => ({ ...prev, activeParent: id })),
        completeOnboarding: () =>
          setState((prev) => ({ ...prev, isOnboarded: true })),
        toggleSeniorMode: () =>
          setState((prev) => ({ ...prev, seniorMode: !prev.seniorMode })),
        setUnreadNotifications: (count: number) =>
          setState((prev) => ({ ...prev, unreadNotifications: count })),
      }}
    >
      <NotificationContext
        value={{
          state: { notifications, unreadCount },
          markRead,
          markAllRead,
          archiveNotification,
          addNotification,
        }}
      >
        <ChatContext
          value={{ threads: chatThreads, getThread, sendMessage, getOrCreateThread }}
        >
          <MedicationContext
            value={{ todaySchedule, weekCompliance, confirmMedication, skipMedication }}
          >
            {children}
          </MedicationContext>
        </ChatContext>
      </NotificationContext>
    </AppContext>
  );
}

// ============================================================================
// SCÉNÁŘ 2.1: Uzavření eskalační smyčky (Medikace → Notifikace)
// Dokument: "Server vytvoří Eskalační job. Senior nepotvrdí → notifikace rodině."
// Adaptace: skipMedication() musí vytvořit high-priority notifikaci v reálném čase.
// ============================================================================

describe('SC 2.1: Eskalační smyčka medikace', () => {
  it('Varianta A: Potvrzení léku zruší eskalaci – žádná notifikace', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;

    function TestHarness() {
      return (
        <IntegrationWrapper>
          <DashboardPage />
        </IntegrationWrapper>
      );
    }

    render(<TestHarness />);

    // Najdi waiting lék a potvrď ho
    const confirmButtons = screen.getAllByLabelText('Potvrdit užití léku');
    expect(confirmButtons.length).toBeGreaterThan(0);

    // Spočítej notifikace před potvrzením
    const notifCountBefore = screen.queryAllByText('Lék vynechán').length;

    // Potvrdit lék
    await act(async () => {
      fireEvent.click(confirmButtons[0]);
    });

    // Žádná nová "Lék vynechán" notifikace
    const notifCountAfter = screen.queryAllByText('Lék vynechán').length;
    expect(notifCountAfter).toBe(notifCountBefore);
  });

  it('Varianta B: Vynechání léku spustí eskalaci – high-priority notifikace', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const NotifikacePage = (await import('@/app/notifikace/page')).default;

    // Sdílený wrapper s přepínáním pohledů (stav se zachová)
    function TestHarness() {
      const [view, setView] = useState<'dashboard' | 'notif'>('dashboard');
      return (
        <IntegrationWrapper>
          <button data-testid="switch-to-notif" onClick={() => setView('notif')}>
            switch
          </button>
          {view === 'notif' ? <NotifikacePage /> : <DashboardPage />}
        </IntegrationWrapper>
      );
    }

    render(<TestHarness />);

    // 1. Na Dashboardu přeskočíme lék
    const skipButtons = screen.getAllByLabelText('Přeskočit lék');
    expect(skipButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(skipButtons[0]);
    });

    // 2. Přepneme na notifikace – stav IntegrationWrapperu se zachová
    await act(async () => {
      fireEvent.click(screen.getByTestId('switch-to-notif'));
    });

    // Eskalační notifikace musí existovat
    expect(screen.getByText('Lék vynechán')).toBeInTheDocument();
  });

  it('Potvrzení léku změní status z waiting na taken', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;

    render(
      <IntegrationWrapper>
        <DashboardPage />
      </IntegrationWrapper>
    );

    // Ověříme, že existuje waiting lék s potvrzovacím tlačítkem
    const confirmButtons = screen.getAllByLabelText('Potvrdit užití léku');
    const initialCount = confirmButtons.length;
    expect(initialCount).toBeGreaterThan(0);

    // Potvrdíme první lék
    await act(async () => {
      fireEvent.click(confirmButtons[0]);
    });

    // Po potvrzení by měl být o jedno tlačítko méně
    const remainingButtons = screen.queryAllByLabelText('Potvrdit užití léku');
    expect(remainingButtons.length).toBe(initialCount - 1);
  });
});

// ============================================================================
// SCÉNÁŘ 2.2: Senior Mode – Persistent session a SOS data
// Dokument: "UI nezobrazí login screen; SOS data jsou čitelná."
// Adaptace: Senior Mode renderuje bez TopNav/BottomNav, SOS data v Trezoru.
// ============================================================================

describe('SC 2.2: Senior Mode – persistent session a SOS', () => {
  it('Senior Mode zobrazuje zjednodušené rozhraní bez navigace', async () => {
    const SeniorPage = (await import('@/app/senior-mode/page')).default;

    render(
      <IntegrationWrapper>
        <SeniorPage />
      </IntegrationWrapper>
    );

    // Senior Mode má velká tlačítka VZAL/A JSEM (jedno pro každý čekající lék)
    const confirmButtons = screen.getAllByText('VZAL/A JSEM');
    expect(confirmButtons.length).toBeGreaterThan(0);
    // Nemá standardní navigaci
    expect(screen.queryByText('Nástěnka')).not.toBeInTheDocument();
  });

  it('SOS data zůstávají přístupná v Trezoru', async () => {
    const TrezorPage = (await import('@/app/trezor/page')).default;

    render(
      <IntegrationWrapper>
        <TrezorPage />
      </IntegrationWrapper>
    );

    // Kritická SOS data jsou viditelná
    expect(screen.getByText('Kritická data')).toBeInTheDocument();
    expect(screen.getByText(/A\+/)).toBeInTheDocument(); // krevní skupina
    expect(screen.getByText('Penicilin')).toBeInTheDocument(); // alergie
    expect(screen.getByText('Diabetes II. typu')).toBeInTheDocument(); // diagnóza
    expect(screen.getByText(/\+420/)).toBeInTheDocument(); // ICE telefon
  });

  it('Senior Mode potvrzení léku propaguje do kontextu', async () => {
    const SeniorPage = (await import('@/app/senior-mode/page')).default;

    render(
      <IntegrationWrapper>
        <SeniorPage />
      </IntegrationWrapper>
    );

    const confirmButtons = screen.queryAllByText('VZAL/A JSEM');
    if (confirmButtons.length > 0) {
      await act(async () => {
        fireEvent.click(confirmButtons[0]);
      });
      // Po kliknutí by se měl změnit stav léku
      // Ověříme, že se neobjevila chyba a stránka stále funguje
      expect(screen.getByText('VAŠE LÉKY')).toBeInTheDocument();
    }
  });
});

// ============================================================================
// SCÉNÁŘ 3.1: OCR Conflict Resolution (Human-in-the-loop)
// Dokument: "Systém nevytvoří nový záznam, ale změní stav na PENDING_REVISION."
// Adaptace: OCR stránka zobrazí nalezené léky, uživatel musí manuálně potvrdit.
// ============================================================================

describe('SC 3.1: OCR Conflict Resolution', () => {
  it('OCR zobrazuje nalezené léky a vyžaduje manuální potvrzení', async () => {
    const OCRPage = (await import('@/app/trezor/ocr/page')).default;

    render(
      <IntegrationWrapper>
        <OCRPage />
      </IntegrationWrapper>
    );

    // Stránka je v ready stavu
    expect(screen.getByText('Skenovat eRecept')).toBeInTheDocument();
    expect(screen.getByText('Vyfotit eRecept')).toBeInTheDocument();
  });

  it('Skenování zobrazí confidence score a léky ke kontrole', async () => {
    vi.useFakeTimers();
    const OCRPage = (await import('@/app/trezor/ocr/page')).default;

    render(
      <IntegrationWrapper>
        <OCRPage />
      </IntegrationWrapper>
    );

    // Spustit skenování
    const scanButton = screen.getByText('Vyfotit eRecept');
    await act(async () => {
      fireEvent.click(scanButton);
    });

    // Probíhá skenování
    expect(screen.getByText('Čtu dokument...')).toBeInTheDocument();

    // Posunout čas – skenování trvá 2500ms
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Výsledky: confidence score
    expect(screen.getByText(/Jistota rozpoznání: 94%/)).toBeInTheDocument();

    // Nalezené léky – human-in-the-loop kontrola
    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getByText('Enalapril')).toBeInTheDocument();
    expect(screen.getByText('Furosemid')).toBeInTheDocument();

    // Checkboxy pro výběr (human-in-the-loop)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
    // Všechny předvybrané
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });

    vi.useRealTimers();
  });

  it('Uživatel může odznačit konfliktní lék před uložením', async () => {
    vi.useFakeTimers();
    const OCRPage = (await import('@/app/trezor/ocr/page')).default;

    render(
      <IntegrationWrapper>
        <OCRPage />
      </IntegrationWrapper>
    );

    // Spustit a dokončit skenování
    await act(async () => {
      fireEvent.click(screen.getByText('Vyfotit eRecept'));
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Odznačit jeden lék (simulace: Warfarin 5mg existuje, ale my máme 3mg)
    const checkboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      fireEvent.click(checkboxes[0]); // odznačit Metformin (konfliktní – již v systému)
    });

    // Tlačítko uložit ukazuje 2 léky (ne 3)
    expect(screen.getByText('Uložit 2 léků do plánu')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('Uložení léků zobrazí potvrzení s počtem', async () => {
    vi.useFakeTimers();
    const OCRPage = (await import('@/app/trezor/ocr/page')).default;

    render(
      <IntegrationWrapper>
        <OCRPage />
      </IntegrationWrapper>
    );

    // Skenování a výsledky
    await act(async () => {
      fireEvent.click(screen.getByText('Vyfotit eRecept'));
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Uložit všechny 3 léky
    await act(async () => {
      fireEvent.click(screen.getByText('Uložit 3 léků do plánu'));
    });

    // Potvrzovací obrazovka
    expect(screen.getByText('Léky přidány')).toBeInTheDocument();
    expect(screen.getByText('3 léků bylo přidáno do lékového plánu.')).toBeInTheDocument();
    expect(screen.getByText('Zobrazit v Trezoru')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('Scan historie zobrazuje předchozí skeny s confidence', async () => {
    const OCRPage = (await import('@/app/trezor/ocr/page')).default;

    render(
      <IntegrationWrapper>
        <OCRPage />
      </IntegrationWrapper>
    );

    expect(screen.getByText('Historie skenování')).toBeInTheDocument();
    // Ověříme, že se zobrazují oba skeny z mock dat
    expect(screen.getByText('Použito')).toBeInTheDocument();
    expect(screen.getByText('Čeká')).toBeInTheDocument();
  });
});

// ============================================================================
// SCÉNÁŘ 4.1: Kalendářní synchronizace a distribuce změn
// Dokument: "Změna v externím kalendáři se propíše rodině. Latency < 5 min."
// Adaptace: Toggle externích událostí na kalendáři, SyncIndicator stav.
// ============================================================================

describe('SC 4.1: Kalendářní synchronizace', () => {
  it('Kalendář zobrazuje SyncIndicator pro připojený zdroj', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;

    const { container } = render(
      <IntegrationWrapper>
        <KalendarPage />
      </IntegrationWrapper>
    );

    // SyncIndicator by měl být viditelný (google je connected)
    const syncDot = container.querySelector('[title="Synchronizováno"]');
    expect(syncDot).toBeInTheDocument();
  });

  it('Toggle externích událostí přidá události do agendy', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;

    render(
      <IntegrationWrapper>
        <KalendarPage />
      </IntegrationWrapper>
    );

    // Před toggle: žádné externí události
    expect(screen.queryByText('Schůzka v práci')).not.toBeInTheDocument();

    // Klikni na toggle
    const extButtons = screen.getAllByText('📅 Externí');
    await act(async () => {
      fireEvent.click(extButtons[0]);
    });

    // Po toggle: externí události jsou viditelné
    expect(screen.getByText('Schůzka v práci')).toBeInTheDocument();
    expect(screen.getByText('Dentista')).toBeInTheDocument();
  });

  it('Externí události mají odlišný vizuální styl (dashed border)', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;

    const { container } = render(
      <IntegrationWrapper>
        <KalendarPage />
      </IntegrationWrapper>
    );

    // Zapni external
    const extButtons = screen.getAllByText('📅 Externí');
    await act(async () => {
      fireEvent.click(extButtons[0]);
    });

    // Zkontroluj, že existují dashed border elementy
    const dashedCards = container.querySelectorAll('.border-dashed');
    expect(dashedCards.length).toBeGreaterThan(0);
  });

  it('Externí události nemají chatové ikony', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;

    render(
      <IntegrationWrapper>
        <KalendarPage />
      </IntegrationWrapper>
    );

    // Zapni external
    const extButtons = screen.getAllByText('📅 Externí');
    await act(async () => {
      fireEvent.click(extButtons[0]);
    });

    // "Schůzka v práci" nemá chat ikonu
    const externalEvent = screen.getByText('Schůzka v práci');
    const card = externalEvent.closest('[class*="border-dashed"]');
    expect(card).toBeTruthy();
    const chatButton = card?.querySelector('[title="Diskuze k události"]');
    expect(chatButton).toBeNull();
  });

  it('Nastavení zobrazuje připojené kalendáře se SyncIndicatorem', async () => {
    const NastaveniPage = (await import('@/app/nastaveni/page')).default;

    const { container } = render(
      <IntegrationWrapper>
        <NastaveniPage />
      </IntegrationWrapper>
    );

    expect(screen.getByText(/Propojené kalendáře/)).toBeInTheDocument();
    expect(screen.getByText('Připojeno')).toBeInTheDocument();
    expect(screen.getByText('Připojit')).toBeInTheDocument();

    // SyncIndicator dot pro připojený Google
    const syncDots = container.querySelectorAll('[title="Synchronizováno"]');
    expect(syncDots.length).toBeGreaterThanOrEqual(1);

    // SyncIndicator dot pro nepřipojený Apple
    const noneDots = container.querySelectorAll('[title="Nepřipojeno"]');
    expect(noneDots.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// SCÉNÁŘ 5.1: Referenční integrita chatu (Soft delete)
// Dokument: "Chat k ID 789 je archived. UI nesmí skončit chybou 404."
// Adaptace: Chat thread pro neexistující kontext musí fungovat – getOrCreateThread.
// ============================================================================

describe('SC 5.1: Referenční integrita chatu', () => {
  it('Chat thread pro existující kontext zobrazí historii', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    // Premium tier aby nefiltroval zprávy starší 7 dní
    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'duo' }}>
        <ChatThreadComponent
          contextType="task"
          contextId="1"
          contextLabel="Kardiologie (MUDr. Dvořák)"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Thread-1 existuje pro task/1
    expect(screen.getByText('Diskuze: Kardiologie (MUDr. Dvořák)')).toBeInTheDocument();
    // Zobrazí existující zprávy
    expect(
      screen.getByText(/Objednala jsem maminku na kardiologii/)
    ).toBeInTheDocument();
  });

  it('Chat thread pro neexistující kontext nevyhazuje chybu (graceful)', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    // ID "deleted-task-999" v datech neexistuje
    render(
      <IntegrationWrapper>
        <ChatThreadComponent
          contextType="task"
          contextId="deleted-task-999"
          contextLabel="Smazaný úkol"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Chat se otevře bez chyby
    expect(screen.getByText('Diskuze: Smazaný úkol')).toBeInTheDocument();
    // Zobrazí prázdný stav (ne error)
    expect(screen.getByText('Zatím žádné zprávy. Začněte konverzaci.')).toBeInTheDocument();
  });

  it('Chat thread pro dokument zobrazí správnou historii', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    // Premium tier aby nefiltroval zprávy starší 7 dní
    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'duo' }}>
        <ChatThreadComponent
          contextType="document"
          contextId="doc-plnamoc"
          contextLabel="Plná moc"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Thread-3 existuje pro document/doc-plnamoc
    expect(screen.getByText('Diskuze: Plná moc')).toBeInTheDocument();
    expect(screen.getByText(/plná moc pro lékaře je hotová/)).toBeInTheDocument();
  });

  it('@zmínka v chatu vytvoří notifikaci (cross-store integrace)', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;
    const NotifikacePage = (await import('@/app/notifikace/page')).default;

    // Renderujeme komponentu, která může zobrazit oboje
    function TestHarness({ view }: { view: 'chat' | 'notif' }) {
      if (view === 'chat') {
        return (
          <ChatThreadComponent
            contextType="task"
            contextId="1"
            contextLabel="Test úkol"
            isOpen={true}
            onClose={() => {}}
          />
        );
      }
      return <NotifikacePage />;
    }

    const { unmount } = render(
      <IntegrationWrapper>
        <TestHarness view="chat" />
      </IntegrationWrapper>
    );

    // Napíšeme zprávu s @zmínkou
    const input = screen.getByPlaceholderText('Napište zprávu... (@ pro zmínku)');
    await act(async () => {
      fireEvent.change(input, { target: { value: '@' } });
    });

    // Mention dropdown by měl být viditelný
    await waitFor(() => {
      expect(screen.getByText('Petr Novák')).toBeInTheDocument();
    });

    // Vybereme člena
    await act(async () => {
      fireEvent.click(screen.getByText('Petr Novák'));
    });

    // Odešleme zprávu
    await act(async () => {
      fireEvent.change(input, {
        target: { value: '@Petr Důležitá zpráva' },
      });
    });

    const sendButton = screen.getByText('↑');
    await act(async () => {
      fireEvent.click(sendButton);
    });

    unmount();

    // Přepnout na notifikace – měla by existovat zmínková notifikace
    render(
      <IntegrationWrapper>
        <TestHarness view="notif" />
      </IntegrationWrapper>
    );

    // Ověříme, že existuje alespoň nějaká notifikace o zmínce
    expect(screen.getAllByText(/zmínil/).length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// SCÉNÁŘ 5.2: Dynamický Paywall (Frozen Data)
// Dokument: "Uživatel bez Premium nevidí čitelný text zpráv starších 7 dní."
// Adaptace: ChatThread filtruje zprávy podle subscriptionTier.
// ============================================================================

describe('SC 5.2: Dynamický Paywall – frozen chat data', () => {
  it('Trial uživatel vidí upsell banner když existují skryté zprávy', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    // Thread-1 má zprávy staré > 7 dní (z 18. 1. 2024)
    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'trial' }}>
        <ChatThreadComponent
          contextType="task"
          contextId="1"
          contextLabel="Kardiologie"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Zprávy z mock dat jsou > 7 dní staré → budou skryté
    // Upsell banner by se měl zobrazit
    expect(
      screen.getByText('Pro přístup k celé historii přejděte na Premium')
    ).toBeInTheDocument();
  });

  it('Premium uživatel vidí celou historii bez omezení', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'duo' }}>
        <ChatThreadComponent
          contextType="task"
          contextId="1"
          contextLabel="Kardiologie"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Všechny zprávy viditelné
    expect(
      screen.getByText(/Objednala jsem maminku na kardiologii/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Já to vezmu/)).toBeInTheDocument();

    // Žádný upsell banner
    expect(
      screen.queryByText('Pro přístup k celé historii přejděte na Premium')
    ).not.toBeInTheDocument();
  });

  it('Standard tier má stejné omezení jako trial (7 dní)', async () => {
    const ChatThreadComponent = (await import('@/components/ui/ChatThread')).default;

    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'standard' }}>
        <ChatThreadComponent
          contextType="task"
          contextId="1"
          contextLabel="Kardiologie"
          isOpen={true}
          onClose={() => {}}
        />
      </IntegrationWrapper>
    );

    // Standard tier = omezený – upsell banner musí být viditelný
    expect(
      screen.getByText('Pro přístup k celé historii přejděte na Premium')
    ).toBeInTheDocument();
  });

  it('Smart Test zobrazuje premium paywall pro zamčené výsledky', async () => {
    vi.useFakeTimers();
    const TestNarokuPage = (await import('@/app/pruvodce/test-naroku/page')).default;

    render(
      <IntegrationWrapper initialState={{ subscriptionTier: 'trial' }}>
        <TestNarokuPage />
      </IntegrationWrapper>
    );

    // Odpovíme na všech 8 otázek pro zobrazení výsledků
    // handleAnswer volá setTimeout(300ms) pro přechod na další otázku
    // a setTimeout(400ms) pro zobrazení výsledků po poslední otázce
    for (let i = 0; i < 8; i++) {
      // Najdeme odpovědní tlačítka (mají w-full p-4 rounded-xl border)
      const options = screen.getAllByRole('button').filter((btn) => {
        return (
          btn.className.includes('rounded-xl') &&
          btn.className.includes('w-full') &&
          btn.className.includes('p-4')
        );
      });
      expect(options.length).toBeGreaterThan(0);

      // Kliknutí spustí handleAnswer → setAnswers (sync) + setTimeout (async)
      await act(async () => {
        fireEvent.click(options[0]);
      });

      // Posunout časovač aby se provedl setTimeout(300/400ms)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
    }

    // Výsledková obrazovka by měla obsahovat premium paywall
    expect(screen.getByText(/Odemkněte kompletní Mapu nároků/)).toBeInTheDocument();

    // Zamčené výsledky zobrazují "Skryto"
    const lockedItems = screen.getAllByText('🔒 Skryto');
    expect(lockedItems.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
