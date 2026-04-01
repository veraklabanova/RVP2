'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/lib/chat-store';
import { useApp } from '@/lib/store';
import { familyMembers } from '@/data/mock';
import ChatBubble from './ChatBubble';

interface ChatThreadProps {
  contextType: string;
  contextId: string;
  contextLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_USER_ID = '1';
const CURRENT_USER_NAME = 'Marie Nováková';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const AUDIT_BANNER_KEY = 'rvp-chat-audit-banner-dismissed';

export default function ChatThread({
  contextType,
  contextId,
  contextLabel,
  isOpen,
  onClose,
}: ChatThreadProps) {
  const { getOrCreateThread, sendMessage } = useChat();
  const { state } = useApp();
  const [inputText, setInputText] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [showAuditBanner, setShowAuditBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const thread = getOrCreateThread(contextType, contextId, contextLabel);

  const isLimitedTier = state.subscriptionTier === 'trial' || state.subscriptionTier === 'standard';

  const visibleMessages = isLimitedTier
    ? thread.messages.filter((msg) => {
        const msgDate = new Date(msg.timestamp).getTime();
        const now = Date.now();
        return now - msgDate <= SEVEN_DAYS_MS;
      })
    : thread.messages;

  const hasHiddenMessages = isLimitedTier && visibleMessages.length < thread.messages.length;

  // Offline detection (R10)
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // Audit trail banner (R12) - show on first message
  useEffect(() => {
    if (thread.messages.length === 0) return;
    const dismissed = localStorage.getItem(AUDIT_BANNER_KEY);
    if (!dismissed) {
      setShowAuditBanner(true);
    }
  }, [thread.messages.length]);

  const dismissAuditBanner = () => {
    setShowAuditBanner(false);
    localStorage.setItem(AUDIT_BANNER_KEY, 'true');
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, visibleMessages.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ') || afterAt.trim() === '') {
        setShowMentionDropdown(true);
        setMentionFilter(afterAt.toLowerCase());
        return;
      }
    }
    setShowMentionDropdown(false);
    setMentionFilter('');
  };

  const handleSelectMention = (member: { id: string; name: string }) => {
    const lastAtIndex = inputText.lastIndexOf('@');
    const beforeAt = inputText.slice(0, lastAtIndex);
    const firstName = member.name.split(' ')[0];
    setInputText(`${beforeAt}@${firstName} `);
    setSelectedMentions((prev) => [...prev, member.id]);
    setShowMentionDropdown(false);
    setMentionFilter('');
    inputRef.current?.focus();
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const mentions = selectedMentions.length > 0 ? selectedMentions : undefined;
    sendMessage(thread.id, CURRENT_USER_ID, CURRENT_USER_NAME, trimmed, mentions);
    setInputText('');
    setSelectedMentions([]);
    setShowMentionDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setShowMentionDropdown(false);
    }
  };

  const filteredMembers = familyMembers.filter(
    (m) =>
      m.id !== CURRENT_USER_ID &&
      m.name.toLowerCase().includes(mentionFilter)
  );

  if (!isOpen) return null;

  const contextIcons: Record<string, string> = {
    medication: '💊',
    event: '📅',
    document: '📄',
    task: '📋',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel sliding up from bottom */}
      <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{contextIcons[contextType] || '💬'}</span>
            <h3 className="font-bold text-sm text-foreground truncate">
              {contextLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted text-lg min-h-0 min-w-0 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Audit trail banner (R12) */}
        {showAuditBanner && (
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center gap-2 flex-shrink-0">
            <p className="text-xs text-muted flex-1">
              Zprávy v tomto vlákně jsou trvalou součástí záznamu a nelze je smazat.
            </p>
            <button
              onClick={dismissAuditBanner}
              className="text-muted text-sm min-h-0 min-w-0 px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upsell banner for limited tiers */}
        {hasHiddenMessages && (
          <div className="px-4 py-2 bg-warning-light/50 border-b border-warning/20 flex-shrink-0">
            <p className="text-xs text-muted text-center">
              Vidíte zprávy za posledních 7 dní. <span className="text-medication font-semibold">Premium: Neomezená historie</span>
            </p>
          </div>
        )}

        {/* Offline banner (R10) */}
        {isOffline && (
          <div className="px-4 py-2 bg-offline border-b border-warning/20 flex-shrink-0">
            <p className="text-xs text-foreground text-center font-medium">
              Jste offline. Zprávy se odešlou po obnovení připojení.
            </p>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
          {visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm text-muted text-center">
                Zatím žádné zprávy. Začněte konverzaci.
              </p>
            </div>
          ) : (
            visibleMessages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === CURRENT_USER_ID}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area (R10: stays active even offline) */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0 relative">
          {/* Mention dropdown */}
          {showMentionDropdown && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-10">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMention(member)}
                  className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-surface text-left transition-colors min-h-0 min-w-0"
                >
                  <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted ml-auto">{member.role}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowMentionDropdown(true);
                setMentionFilter('');
                setInputText(inputText + '@');
                inputRef.current?.focus();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-primary font-bold min-h-0 min-w-0 hover:bg-border transition-colors"
              title="Zmínit člena rodiny"
            >
              @
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napište zprávu..."
              className="flex-1 bg-surface rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-chat/30 placeholder:text-muted"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-chat text-white flex items-center justify-center font-bold text-lg min-h-0 min-w-0 disabled:opacity-40 hover:bg-chat/90 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
