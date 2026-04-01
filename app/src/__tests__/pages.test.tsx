import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppContext, defaultAppState } from '@/lib/store';
import { NotificationContext, defaultNotificationState } from '@/lib/notification-store';
import { ChatContext } from '@/lib/chat-store';
import { MedicationContext } from '@/lib/medication-store';
import { notifications, medicationSchedule, complianceWeek, chatThreads } from '@/data/mock';
import type { ReactNode } from 'react';

// =========================================================================
// Test utilities – Wrapper with all 4 context providers
// =========================================================================

function createTestWrapper(overrides?: {
  subscriptionTier?: string;
  activeParent?: string;
}) {
  const appState = {
    ...defaultAppState,
    ...overrides,
  };

  const notifState = {
    notifications: [...notifications],
    unreadCount: notifications.filter((n) => !n.read).length,
  };

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AppContext.Provider
        value={{
          state: appState as any,
          setActiveParent: vi.fn(),
          completeOnboarding: vi.fn(),
          toggleSeniorMode: vi.fn(),
          setUnreadNotifications: vi.fn(),
        }}
      >
        <NotificationContext.Provider
          value={{
            state: notifState,
            markRead: vi.fn(),
            markAllRead: vi.fn(),
            archiveNotification: vi.fn(),
            addNotification: vi.fn(),
          }}
        >
          <ChatContext.Provider
            value={{
              threads: chatThreads,
              getThread: (type: string, id: string) =>
                chatThreads.find((t) => t.contextType === type && t.contextId === id),
              sendMessage: vi.fn(),
              getOrCreateThread: vi.fn().mockReturnValue({
                id: 'new',
                contextType: 'task',
                contextId: '',
                contextLabel: '',
                messages: [],
                lastActivity: '',
              }),
            }}
          >
            <MedicationContext.Provider
              value={{
                todaySchedule: medicationSchedule.filter((e) => e.parentId === 'mama'),
                weekCompliance: complianceWeek,
                confirmMedication: vi.fn(),
                skipMedication: vi.fn(),
              }}
            >
              {children}
            </MedicationContext.Provider>
          </ChatContext.Provider>
        </NotificationContext.Provider>
      </AppContext.Provider>
    );
  };
}

// =========================================================================
// Dashboard Page
// =========================================================================

describe('Dashboard Page', () => {
  it('renders greeting and core sections', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const wrapper = createTestWrapper();
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('Dobrý den, Marie.')).toBeInTheDocument();
    expect(screen.getByText('Dnešní priority')).toBeInTheDocument();
  });

  it('renders trial banner when on trial tier', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const wrapper = createTestWrapper({ subscriptionTier: 'trial' });
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText(/Zkušební doba/)).toBeInTheDocument();
  });

  it('renders medication section', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const wrapper = createTestWrapper();
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('💊')).toBeInTheDocument();
    expect(screen.getByText('Léky dnes')).toBeInTheDocument();
  });

  it('renders Smart Test CTA', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const wrapper = createTestWrapper();
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText('Zjistěte všechny své nároky')).toBeInTheDocument();
  });

  it('renders SOS quick access link', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    const wrapper = createTestWrapper();
    render(<DashboardPage />, { wrapper });

    expect(screen.getByText(/SOS Krizová karta/)).toBeInTheDocument();
  });
});

// =========================================================================
// Notification Page
// =========================================================================

describe('Notifikace Page', () => {
  it('renders notification list and category tabs', async () => {
    const NotifikacePage = (await import('@/app/notifikace/page')).default;
    const wrapper = createTestWrapper();
    render(<NotifikacePage />, { wrapper });

    expect(screen.getByText('Upozornění')).toBeInTheDocument();
    expect(screen.getByText('Vše')).toBeInTheDocument();
    // Category labels appear in tabs AND cards, so use getAllByText
    expect(screen.getAllByText('Léky').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Kalendář').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rodina').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Systém').length).toBeGreaterThanOrEqual(1);
  });

  it('shows notification titles', async () => {
    const NotifikacePage = (await import('@/app/notifikace/page')).default;
    const wrapper = createTestWrapper();
    render(<NotifikacePage />, { wrapper });

    expect(screen.getByText('Nepotvrzený lék')).toBeInTheDocument();
  });

  it('has mark all as read button', async () => {
    const NotifikacePage = (await import('@/app/notifikace/page')).default;
    const wrapper = createTestWrapper();
    render(<NotifikacePage />, { wrapper });

    expect(screen.getByText('Označit vše jako přečtené')).toBeInTheDocument();
  });
});

// =========================================================================
// Calendar Page
// =========================================================================

describe('Kalendar Page', () => {
  it('renders calendar with view mode toggle', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;
    const wrapper = createTestWrapper();
    render(<KalendarPage />, { wrapper });

    expect(screen.getByText('Kalendář péče')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Měsíc')).toBeInTheDocument();
  });

  it('shows category legend including External', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;
    const wrapper = createTestWrapper();
    render(<KalendarPage />, { wrapper });

    // Legend labels also appear in event cards, use getAllByText
    expect(screen.getAllByText('Lékař').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Úřad').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Provoz').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Externí').length).toBeGreaterThanOrEqual(1);
  });

  it('has external toggle button', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;
    const wrapper = createTestWrapper();
    render(<KalendarPage />, { wrapper });

    const extButtons = screen.getAllByText('📅 Externí');
    expect(extButtons.length).toBeGreaterThan(0);
  });

  it('shows events in agenda view', async () => {
    const KalendarPage = (await import('@/app/kalendar/page')).default;
    const wrapper = createTestWrapper();
    render(<KalendarPage />, { wrapper });

    expect(screen.getByText('Kardiologie')).toBeInTheDocument();
    expect(screen.getByText('Sociální šetření')).toBeInTheDocument();
  });
});

// =========================================================================
// Trezor Page
// =========================================================================

describe('Trezor Page', () => {
  it('renders with tabs', async () => {
    const TrezorPage = (await import('@/app/trezor/page')).default;
    const wrapper = createTestWrapper();
    render(<TrezorPage />, { wrapper });

    expect(screen.getByText('Zdravotní trezor')).toBeInTheDocument();
    expect(screen.getByText('SOS Data')).toBeInTheDocument();
    expect(screen.getByText('Léky')).toBeInTheDocument();
    expect(screen.getByText('Osobní')).toBeInTheDocument();
    expect(screen.getByText('Dokumenty')).toBeInTheDocument();
  });

  it('shows SOS data by default', async () => {
    const TrezorPage = (await import('@/app/trezor/page')).default;
    const wrapper = createTestWrapper();
    render(<TrezorPage />, { wrapper });

    expect(screen.getByText('Kritická data')).toBeInTheDocument();
    expect(screen.getByText(/A\+/)).toBeInTheDocument();
  });
});

// =========================================================================
// Nastaveni Page
// =========================================================================

describe('Nastaveni Page', () => {
  it('renders core sections', async () => {
    const NastaveniPage = (await import('@/app/nastaveni/page')).default;
    const wrapper = createTestWrapper();
    render(<NastaveniPage />, { wrapper });

    expect(screen.getByText('Nastavení')).toBeInTheDocument();
    expect(screen.getByText(/Předplatné/)).toBeInTheDocument();
    expect(screen.getByText(/Rodinný tým/)).toBeInTheDocument();
  });

  it('shows calendar integration section', async () => {
    const NastaveniPage = (await import('@/app/nastaveni/page')).default;
    const wrapper = createTestWrapper();
    render(<NastaveniPage />, { wrapper });

    expect(screen.getByText(/Propojené kalendáře/)).toBeInTheDocument();
    expect(screen.getByText('Připojeno')).toBeInTheDocument();
    expect(screen.getByText('Připojit')).toBeInTheDocument();
  });

  it('shows analytics report section', async () => {
    const NastaveniPage = (await import('@/app/nastaveni/page')).default;
    const wrapper = createTestWrapper();
    render(<NastaveniPage />, { wrapper });

    expect(screen.getByText(/Analytický report/)).toBeInTheDocument();
    expect(screen.getByText('Zobrazit měsíční report')).toBeInTheDocument();
  });

  it('shows Senior Mode section', async () => {
    const NastaveniPage = (await import('@/app/nastaveni/page')).default;
    const wrapper = createTestWrapper();
    render(<NastaveniPage />, { wrapper });

    expect(screen.getAllByText(/Senior Mode/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Otevřít Senior Mode')).toBeInTheDocument();
  });
});

// =========================================================================
// Pruvodce Test Naroku Page
// =========================================================================

describe('Smart Test Page', () => {
  it('renders first question', async () => {
    const TestNarokuPage = (await import('@/app/pruvodce/test-naroku/page')).default;
    const wrapper = createTestWrapper();
    render(<TestNarokuPage />, { wrapper });

    expect(screen.getByText('Jaký je věk seniora?')).toBeInTheDocument();
  });

  it('shows progress indicator', async () => {
    const TestNarokuPage = (await import('@/app/pruvodce/test-naroku/page')).default;
    const wrapper = createTestWrapper();
    render(<TestNarokuPage />, { wrapper });

    expect(screen.getByText(/Otázka 1 z 8/)).toBeInTheDocument();
  });

  it('shows answer options for first question', async () => {
    const TestNarokuPage = (await import('@/app/pruvodce/test-naroku/page')).default;
    const wrapper = createTestWrapper();
    render(<TestNarokuPage />, { wrapper });

    expect(screen.getByText('Pod 65 let')).toBeInTheDocument();
    expect(screen.getByText('65–75 let')).toBeInTheDocument();
    expect(screen.getByText('Nad 85 let')).toBeInTheDocument();
  });
});
