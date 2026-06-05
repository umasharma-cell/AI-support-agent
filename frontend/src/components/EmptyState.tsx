import { MessageCircleQuestion } from 'lucide-react';
import type { ReactElement } from 'react';

export const EmptyState = (): ReactElement => {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <MessageCircleQuestion className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-950">Start a support conversation</h2>
      <p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">
        Ask about shipping, returns, refunds, or support hours.
      </p>
    </div>
  );
};
