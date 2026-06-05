import type { ChatMessage, ChatSender } from '../types/chat';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface ApiChatMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

interface StreamSessionEvent {
  sessionId: string;
}

interface StreamDeltaEvent {
  token: string;
}

interface StreamDoneEvent {
  reply: string;
  sessionId: string;
}

interface ChatHistoryResponse {
  sessionId: string;
  messages: ApiChatMessage[];
}

interface ApiErrorResponse {
  error?: string;
  code?: string;
}

export class ChatApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  public constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
    this.code = code;
  }
}

export const sendChatMessage = async (request: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return parseJsonResponse<SendMessageResponse>(response);
};

export interface StreamChatMessageHandlers {
  onSession: (sessionId: string) => void;
  onDelta: (token: string) => void;
  onDone: (reply: string, sessionId: string) => void;
}

export const streamChatMessage = async (
  request: SendMessageRequest,
  handlers: StreamChatMessageHandlers,
): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/chat/message/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok || response.body === null) {
    await parseJsonResponse<never>(response);
    return;
  }

  await readSseStream(response.body, handlers);
};

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  const response = await fetch(`${apiBaseUrl}/api/chat/history/${encodeURIComponent(sessionId)}`);
  const history = await parseJsonResponse<ChatHistoryResponse>(response);

  return history.messages.map(toChatMessage);
};

const parseJsonResponse = async <TResponse>(response: Response): Promise<TResponse> => {
  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse | TResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;

    throw new ChatApiError(
      response.status,
      errorData.error ?? 'Unable to reach support. Please try again.',
      errorData.code,
    );
  }

  return data as TResponse;
};

const readSseStream = async (
  body: ReadableStream<Uint8Array>,
  handlers: StreamChatMessageHandlers,
): Promise<void> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let isReading = true;

  while (isReading) {
    const { done, value } = await reader.read();

    if (done) {
      isReading = false;
      continue;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      handleSseMessage(part, handlers);
    }
  }

  if (buffer.trim().length > 0) {
    handleSseMessage(buffer, handlers);
  }
};

const handleSseMessage = (rawMessage: string, handlers: StreamChatMessageHandlers): void => {
  const lines = rawMessage.split('\n');
  const eventLine = lines.find((line) => line.startsWith('event:'));
  const dataLine = lines.find((line) => line.startsWith('data:'));

  if (eventLine === undefined || dataLine === undefined) {
    return;
  }

  const event = eventLine.replace('event:', '').trim();
  const data = JSON.parse(dataLine.replace('data:', '').trim()) as unknown;

  if (event === 'session') {
    const session = data as StreamSessionEvent;
    handlers.onSession(session.sessionId);
    return;
  }

  if (event === 'delta') {
    const delta = data as StreamDeltaEvent;
    handlers.onDelta(delta.token);
    return;
  }

  if (event === 'done') {
    const done = data as StreamDoneEvent;
    handlers.onDone(done.reply, done.sessionId);
    return;
  }

  if (event === 'error') {
    const error = data as ApiErrorResponse;
    throw new ChatApiError(503, error.error ?? 'Unable to stream AI response.', error.code);
  }
};

const toChatMessage = (message: ApiChatMessage): ChatMessage => {
  return {
    id: message.id,
    sender: toChatSender(message.sender),
    content: message.content,
    createdAt: parseMessageDate(message.createdAt),
  };
};

const toChatSender = (sender: ApiChatMessage['sender']): ChatSender => {
  return sender === 'USER' ? 'user' : 'ai';
};

const parseMessageDate = (value: string): Date => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};
