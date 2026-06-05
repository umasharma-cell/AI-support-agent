export type ChatSender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  content: string;
  createdAt: Date;
}
