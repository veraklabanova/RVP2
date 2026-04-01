'use client';

import { createContext, useContext } from 'react';
import type { ChatThread, ChatMessage } from './types';

export const ChatContext = createContext<{
  threads: ChatThread[];
  getThread: (contextType: string, contextId: string) => ChatThread | undefined;
  sendMessage: (threadId: string, senderId: string, senderName: string, text: string, mentions?: string[]) => void;
  getOrCreateThread: (contextType: string, contextId: string, contextLabel: string) => ChatThread;
}>({
  threads: [],
  getThread: () => undefined,
  sendMessage: () => {},
  getOrCreateThread: () => ({ id: '', contextType: 'task', contextId: '', contextLabel: '', messages: [], lastActivity: '' }),
});

export const useChat = () => useContext(ChatContext);
