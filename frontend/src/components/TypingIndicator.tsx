import type { ReactElement } from 'react';

export const TypingIndicator = (): ReactElement => {
  return (
    <div className="flex items-end gap-2 px-1" aria-label="Agent is typing">
      <div className="flex h-8 items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3 shadow-sm ring-1 ring-gray-200">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
      </div>
      <span className="pb-1 text-xs text-gray-500">Agent is typing</span>
    </div>
  );
};
