'use client';

import { useState } from 'react';
import { useChat } from '@/lib/chat-store';
import { useApp } from '@/lib/store';
import ChatThread from '@/components/ui/ChatThread';

const contextIcons: Record<string, string> = {
  medication: '💊',
  event: '📅',
  document: '📄',
  task: '📋',
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'právě teď';
  if (diffMin < 60) return `před ${diffMin} min`;
  if (diffHours < 24) return `před ${diffHours} h`;
  if (diffDays < 7) return `před ${diffDays} d`;
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

export default function ChatInboxPage() {
  const { state } = useApp();
  const { threads } = useChat();
  const [openThread, setOpenThread] = useState<{ contextType: string; contextId: string; contextLabel: string } | null>(null);

  const isLimitedTier = state.subscriptionTier === 'trial' || state.subscriptionTier === 'standard';

  const sortedThreads = [...threads]
    .filter((t) => t.messages.length > 0)
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  return (
    <div className="px-4 py-5 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Zprávy</h1>

      {/* Free tier banner */}
      {isLimitedTier && (
        <div className="bg-warning-light border border-warning/30 rounded-xl p-3 flex items-center gap-3">
          <span>⏳</span>
          <div className="flex-1">
            <p className="text-sm">Vidíte zprávy za posledních 7 dní.</p>
          </div>
          <span className="text-xs font-semibold text-medication">Premium: Neomezená historie</span>
        </div>
      )}

      {/* Thread list */}
      {sortedThreads.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-muted text-sm">
            Zatím žádné konverzace. Začněte diskuzi u libovolného léku, úkolu nebo dokumentu.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedThreads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            const icon = contextIcons[thread.contextType] || '📋';
            return (
              <button
                key={thread.id}
                onClick={() => setOpenThread({
                  contextType: thread.contextType,
                  contextId: thread.contextId,
                  contextLabel: thread.contextLabel,
                })}
                className="w-full bg-white rounded-xl border border-border p-4 text-left hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm truncate">{thread.contextLabel}</span>
                      <span className="text-[10px] text-muted flex-shrink-0 ml-2">
                        {formatRelativeTime(thread.lastActivity)}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-muted truncate">
                        {lastMsg.senderName}: {lastMsg.text}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chat overlay */}
      {openThread && (
        <ChatThread
          contextType={openThread.contextType as 'task' | 'medication' | 'event' | 'document'}
          contextId={openThread.contextId}
          contextLabel={openThread.contextLabel}
          isOpen={true}
          onClose={() => setOpenThread(null)}
        />
      )}
    </div>
  );
}
