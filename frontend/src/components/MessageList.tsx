import { useEffect, useRef, type ReactElement } from 'react';

import type { ChatMessage } from '../types/chat';
import { EmptyState } from './EmptyState';
import { MessageSkeleton } from './MessageSkeleton';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isHydrating: boolean;
}

export const MessageList = ({ messages, isTyping, isHydrating }: MessageListProps): ReactElement => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-4 py-5 sm:px-5">
      {isHydrating ? (
        <MessageSkeleton />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
