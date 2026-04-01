import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationBadge from '@/components/ui/NotificationBadge';
import MedicationCheckboxCard from '@/components/ui/MedicationCheckboxCard';
import ComplianceGrid from '@/components/ui/ComplianceGrid';
import SyncIndicator from '@/components/ui/SyncIndicator';
import ChatBubble from '@/components/ui/ChatBubble';
import type { MedicationScheduleEntry, ComplianceDay, ChatMessage } from '@/lib/types';

// =========================================================================
// NotificationBadge
// =========================================================================

describe('NotificationBadge', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders count when > 0', () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 9+ when count exceeds 9', () => {
    render(<NotificationBadge count={15} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows exact count for 9', () => {
    render(<NotificationBadge count={9} />);
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});

// =========================================================================
// MedicationCheckboxCard
// =========================================================================

describe('MedicationCheckboxCard', () => {
  const waitingEntry: MedicationScheduleEntry = {
    id: 'test-1',
    medicationId: '1',
    medicationName: 'Metformin',
    dosage: '500 mg',
    parentId: 'mama',
    scheduledTime: '08:00',
    status: 'waiting',
  };

  const takenEntry: MedicationScheduleEntry = {
    ...waitingEntry,
    id: 'test-2',
    status: 'taken',
    confirmedAt: '2024-01-20T08:05:00',
    confirmedBy: 'Marie',
  };

  const missedEntry: MedicationScheduleEntry = {
    ...waitingEntry,
    id: 'test-3',
    status: 'missed',
  };

  it('renders medication name and dosage', () => {
    render(<MedicationCheckboxCard entry={waitingEntry} onConfirm={() => {}} onSkip={() => {}} />);
    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getByText('500 mg')).toBeInTheDocument();
  });

  it('shows confirm and skip buttons for waiting state', () => {
    render(<MedicationCheckboxCard entry={waitingEntry} onConfirm={() => {}} onSkip={() => {}} />);
    expect(screen.getByLabelText('Potvrdit užití léku')).toBeInTheDocument();
    expect(screen.getByLabelText('Přeskočit lék')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<MedicationCheckboxCard entry={waitingEntry} onConfirm={onConfirm} onSkip={() => {}} />);
    fireEvent.click(screen.getByLabelText('Potvrdit užití léku'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onSkip when skip button clicked', () => {
    const onSkip = vi.fn();
    render(<MedicationCheckboxCard entry={waitingEntry} onConfirm={() => {}} onSkip={onSkip} />);
    fireEvent.click(screen.getByLabelText('Přeskočit lék'));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('does not show action buttons for taken state', () => {
    render(<MedicationCheckboxCard entry={takenEntry} onConfirm={() => {}} onSkip={() => {}} />);
    expect(screen.queryByLabelText('Potvrdit užití léku')).not.toBeInTheDocument();
  });

  it('shows "Vynecháno" for missed state', () => {
    render(<MedicationCheckboxCard entry={missedEntry} onConfirm={() => {}} onSkip={() => {}} />);
    expect(screen.getByText('Vynecháno')).toBeInTheDocument();
  });
});

// =========================================================================
// ComplianceGrid
// =========================================================================

describe('ComplianceGrid', () => {
  const mockCompliance: ComplianceDay[] = [
    {
      date: '2024-01-15',
      entries: [
        { id: 'c1', medicationId: '1', medicationName: 'Test', dosage: '10mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-15T08:00:00', confirmedBy: 'Marie' },
      ],
    },
    {
      date: '2024-01-16',
      entries: [
        { id: 'c2', medicationId: '1', medicationName: 'Test', dosage: '10mg', parentId: 'mama', scheduledTime: '08:00', status: 'missed' },
      ],
    },
    {
      date: '2024-01-17',
      entries: [
        { id: 'c3', medicationId: '1', medicationName: 'Test', dosage: '10mg', parentId: 'mama', scheduledTime: '08:00', status: 'taken', confirmedAt: '2024-01-17T08:00:00', confirmedBy: 'Marie' },
      ],
    },
  ];

  it('renders day labels', () => {
    render(<ComplianceGrid data={mockCompliance} />);
    expect(screen.getByText('Po')).toBeInTheDocument();
    expect(screen.getByText('Ne')).toBeInTheDocument();
  });

  it('shows weekly compliance percentage', () => {
    render(<ComplianceGrid data={mockCompliance} />);
    // 2 taken out of 2 completed (waiting doesn't count) = 67%
    expect(screen.getByText(/Týdenní úspěšnost: 67%/)).toBeInTheDocument();
  });
});

// =========================================================================
// SyncIndicator
// =========================================================================

describe('SyncIndicator', () => {
  it('renders synced state', () => {
    const { container } = render(<SyncIndicator status="synced" />);
    const dot = container.querySelector('span');
    expect(dot).toHaveAttribute('title', 'Synchronizováno');
  });

  it('renders error state', () => {
    const { container } = render(<SyncIndicator status="error" />);
    const dot = container.querySelector('span');
    expect(dot).toHaveAttribute('title', 'Chyba synchronizace');
  });

  it('renders syncing state with pulse animation', () => {
    const { container } = render(<SyncIndicator status="syncing" />);
    const dot = container.querySelector('span');
    expect(dot?.className).toContain('animate-pulse');
    expect(dot).toHaveAttribute('title', 'Synchronizuji...');
  });

  it('renders none state', () => {
    const { container } = render(<SyncIndicator status="none" />);
    const dot = container.querySelector('span');
    expect(dot).toHaveAttribute('title', 'Nepřipojeno');
  });
});

// =========================================================================
// ChatBubble
// =========================================================================

describe('ChatBubble', () => {
  const baseMessage: ChatMessage = {
    id: 'msg-1',
    threadId: 'thread-1',
    senderId: '1',
    senderName: 'Marie Nováková',
    text: 'Ahoj, jak se máš?',
    timestamp: '2024-01-20T10:00:00',
  };

  it('renders message text', () => {
    render(<ChatBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText(/Ahoj, jak se máš/)).toBeInTheDocument();
  });

  it('shows sender name for others messages', () => {
    render(<ChatBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText('Marie Nováková')).toBeInTheDocument();
  });

  it('does not show sender name for own messages', () => {
    render(<ChatBubble message={baseMessage} isOwn={true} />);
    expect(screen.queryByText('Marie Nováková')).not.toBeInTheDocument();
  });

  it('shows sender initial as avatar', () => {
    render(<ChatBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('highlights @mentions', () => {
    const msgWithMention: ChatMessage = {
      ...baseMessage,
      text: 'Díky @Petr za pomoc.',
      mentions: ['2'],
    };
    const { container } = render(<ChatBubble message={msgWithMention} isOwn={false} />);
    // The regex /@\w+(?:\s\w+)?/ captures "@Petr za" as one match
    const mentionSpan = container.querySelector('.text-chat');
    expect(mentionSpan).toBeInTheDocument();
    expect(mentionSpan?.textContent).toContain('@Petr');
  });
});
