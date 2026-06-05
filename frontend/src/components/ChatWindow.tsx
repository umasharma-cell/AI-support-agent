import { MessageCircle } from 'lucide-react';
import type { ReactElement } from 'react';

import type { ChatMessage } from '../types/chat';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isHydrating: boolean;
  errorMessage: string | null;
  canRetry: boolean;
  onSendMessage: (message: string) => void;
  onRetry: () => void;
}

export const ChatWindow = ({
  messages,
  isLoading,
  isHydrating,
  errorMessage,
  canRetry,
  onSendMessage,
  onRetry,
}: ChatWindowProps): ReactElement => {
  return (
    <section className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 sm:h-[720px]">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-gray-950">Spur Demo Support</h1>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{isLoading ? 'Replying now' : 'Typically replies in a few seconds'}</span>
          </div>
        </div>
      </header>

      {errorMessage !== null && (
        <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="min-w-0 flex-1">{errorMessage}</span>
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isLoading}
              className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {isHydrating && (
        <div className="border-b border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Restoring conversation...
        </div>
      )}

      <MessageList messages={messages} isTyping={isLoading} isHydrating={isHydrating} />
      <ChatInput isLoading={isLoading || isHydrating} onSendMessage={onSendMessage} />
    </section>
  );
};
