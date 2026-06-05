import type { Message, MessageSender } from '../generated/prisma/client.js';

export type ChatMessageSender = MessageSender;

export type PersistedChatMessage = Message;

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

export interface SendChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendChatMessageResponse {
  reply: string;
  sessionId: string;
}

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessageDto[];
}
