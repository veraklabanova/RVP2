'use client';

import type { ChatMessage } from '@/lib/types';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onRetry?: (messageId: string) => void;
}

function renderTextWithMentions(text: string) {
  const parts = text.split(/(@\w+(?:\s\w+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="font-bold text-primary">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function ChatBubble({ message, isOwn, onRetry }: ChatBubbleProps) {
  const initials = message.senderName.charAt(0).toUpperCase();
  const isFailed = message.status === 'failed';
  const isPending = message.status === 'pending';

  const avatar = (
    <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
      {initials}
    </div>
  );

  const timestamp = new Date(message.timestamp).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {avatar}
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-muted ml-1 mb-0.5">{message.senderName}</span>
        )}
        <div
          className={`px-3 py-2 text-sm break-words ${
            isPending
              ? 'bg-external-light text-muted rounded-xl rounded-br-none'
              : isFailed
                ? 'bg-sos-light rounded-xl rounded-br-none'
                : isOwn
                  ? 'bg-chat-own rounded-xl rounded-br-none'
                  : 'bg-chat-other rounded-xl rounded-bl-none'
          }`}
          style={{ maxWidth: '75%', borderRadius: '16px' }}
        >
          {renderTextWithMentions(message.text)}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 mx-1">
          {/* Pending indicator (R10) */}
          {isPending && (
            <span className="text-xs text-external">⏳</span>
          )}
          {/* Failed indicator (R14) */}
          {isFailed && (
            <>
              <span className="text-xs text-compliance-miss">⚠ Neodeslána</span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="text-xs text-primary font-medium min-h-0 min-w-0 px-1"
                >
                  Zkusit znovu
                </button>
              )}
            </>
          )}
          <span className="text-xs text-muted">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
