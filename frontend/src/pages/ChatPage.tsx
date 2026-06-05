import { useEffect, useState, type ReactElement } from 'react';

import { ChatWindow } from '../components/ChatWindow';
import { Toast } from '../components/Toast';
import { ChatApiError, getChatHistory, streamChatMessage } from '../services/chatApi';
import {
  clearStoredSessionId,
  getStoredSessionId,
  setStoredSessionId,
} from '../store/sessionStorage';
import type { ChatMessage } from '../types/chat';

export const ChatPage = (): ReactElement => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage === null) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const storedSessionId = getStoredSessionId();

      if (storedSessionId === null) {
        setMessages([]);
        setIsHydrating(false);
        return;
      }

      setSessionId(storedSessionId);

      try {
        const history = await getChatHistory(storedSessionId);

        setMessages(history);
      } catch (error) {
        if (error instanceof ChatApiError && error.status >= 400 && error.status < 500) {
          clearStoredSessionId();
          setSessionId(null);
        }

        setMessages([]);
        showError(toUserMessage(error));
      } finally {
        setIsHydrating(false);
      }
    };

    void restoreSession();
  }, []);

  const sendMessageToApi = (content: string, shouldAppendUserMessage: boolean): void => {
    const aiMessageId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content,
      createdAt: new Date(),
    };

    if (shouldAppendUserMessage) {
      setMessages((currentMessages) => [...currentMessages, userMessage]);
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLastFailedMessage(null);

    void streamChatMessage(
      {
      message: content,
      sessionId: sessionId ?? undefined,
      },
      {
        onSession: (nextSessionId) => {
          setSessionId(nextSessionId);
          setStoredSessionId(nextSessionId);
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: aiMessageId,
              sender: 'ai',
              content: '',
              createdAt: new Date(),
            },
          ]);
        },
        onDelta: (token) => {
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === aiMessageId
                ? {
                    ...message,
                    content: `${message.content}${token}`,
                  }
                : message,
            ),
          );
        },
        onDone: (reply, nextSessionId) => {
          setSessionId(nextSessionId);
          setStoredSessionId(nextSessionId);
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === aiMessageId
                ? {
                    ...message,
                    content: reply,
                  }
                : message,
            ),
          );
        },
      },
    )
      .catch((error: unknown) => {
        setMessages((currentMessages) =>
          currentMessages.filter((message) => message.id !== aiMessageId),
        );
        setLastFailedMessage(content);
        showError(toUserMessage(error));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSendMessage = (content: string): void => {
    sendMessageToApi(content, true);
  };

  const handleRetry = (): void => {
    if (lastFailedMessage === null || isLoading) {
      return;
    }

    sendMessageToApi(lastFailedMessage, false);
  };

  const showError = (message: string): void => {
    setErrorMessage(message);
    setToastMessage(message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-3 py-4 sm:px-6">
      {toastMessage !== null && (
        <Toast
          message={toastMessage}
          onDismiss={() => {
            setToastMessage(null);
          }}
        />
      )}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        isHydrating={isHydrating}
        errorMessage={errorMessage}
        canRetry={lastFailedMessage !== null}
        onSendMessage={handleSendMessage}
        onRetry={handleRetry}
      />
    </main>
  );
};

const toUserMessage = (error: unknown): string => {
  if (error instanceof ChatApiError) {
    return error.message;
  }

  return 'Unable to reach support. Please try again.';
};
