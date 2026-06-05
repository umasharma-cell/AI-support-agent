import { SendHorizonal } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const maxMessageLength = 2000;

export const ChatInput = ({ isLoading, onSendMessage }: ChatInputProps): ReactElement => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const trimmedMessage = message.trim();
  const isDisabled = isLoading || trimmedMessage.length === 0 || trimmedMessage.length > maxMessageLength;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: { preventDefault: () => void }): void => {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!isDisabled) {
        onSendMessage(trimmedMessage);
        setMessage('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3 sm:p-4">
      <div className="flex items-end gap-2 rounded-2xl bg-gray-100 p-2 ring-1 ring-gray-200 focus-within:bg-white focus-within:ring-gray-400">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={maxMessageLength + 1}
          placeholder="Type your message..."
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-gray-950 outline-none placeholder:text-gray-500"
          disabled={isLoading}
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={isDisabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none"
          aria-label="Send message"
          title="Send message"
        >
          <SendHorizonal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 flex justify-between px-1 text-[11px] text-gray-500">
        <span>Press Enter to send</span>
        <span className={message.length > maxMessageLength ? 'text-red-600' : undefined}>
          {message.length}/{maxMessageLength}
        </span>
      </div>
    </form>
  );
};
