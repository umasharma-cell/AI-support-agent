export type LLMMessageSender = 'user' | 'ai';

export interface LLMHistoryMessage {
  sender: LLMMessageSender;
  content: string;
  createdAt?: Date;
}

export interface GenerateReplyInput {
  history: LLMHistoryMessage[];
  message: string;
}

export interface LLMProvider {
  generateReply(history: LLMHistoryMessage[], message: string): Promise<string>;
  streamReply(history: LLMHistoryMessage[], message: string): AsyncGenerator<string>;
}
