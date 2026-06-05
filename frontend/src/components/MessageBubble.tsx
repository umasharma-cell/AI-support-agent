import { Bot, User } from 'lucide-react';
import type { ReactElement } from 'react';

import type { ChatMessage } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps): ReactElement => {
  const isUser = message.sender === 'user';
  const sentAt = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.createdAt);

  return (
    <article className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </div>
      )}

      <div className={`flex max-w-[82%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${
            isUser
              ? 'rounded-br-md bg-gray-950 text-white'
              : 'rounded-bl-md bg-white text-gray-900 ring-1 ring-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <time className="mt-1 px-1 text-[11px] text-gray-500" dateTime={message.createdAt.toISOString()}>
          {sentAt}
        </time>
      </div>

      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
          <User className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </article>
  );
};
