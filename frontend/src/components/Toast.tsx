import { X } from 'lucide-react';
import type { ReactElement } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast = ({ message, onDismiss }: ToastProps): ReactElement => {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-xl bg-gray-950 px-4 py-3 text-sm text-white shadow-2xl sm:right-6 sm:top-6">
      <p className="min-w-0 flex-1 leading-6">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
