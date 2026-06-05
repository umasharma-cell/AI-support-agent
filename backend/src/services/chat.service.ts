import { MessageSender, type Message } from '../generated/prisma/client.js';
import { GeminiProvider } from '../providers/gemini.provider.js';
import {
  PrismaConversationRepository,
  type ConversationRepository,
} from '../repositories/conversation.repository.js';
import {
  PrismaMessageRepository,
  type MessageRepository,
} from '../repositories/message.repository.js';
import type {
  ChatHistoryResponse,
  ChatMessageDto,
  SendChatMessageResponse,
} from '../types/chat.types.js';
import type { LLMHistoryMessage, LLMProvider } from '../types/llm.types.js';
import { createSessionId } from '../utils/session.js';

interface ChatServiceDependencies {
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
  llmProvider: LLMProvider;
}

export interface StreamChatMessageResult {
  sessionId: string;
  stream: AsyncGenerator<string>;
  saveReply: (reply: string) => Promise<void>;
}

export class ChatService {
  public constructor(
    private readonly dependencies: ChatServiceDependencies = {
      conversationRepository: new PrismaConversationRepository(),
      messageRepository: new PrismaMessageRepository(),
      llmProvider: new GeminiProvider(),
    },
  ) {}

  public async sendMessage(message: string, sessionId?: string): Promise<SendChatMessageResponse> {
    const normalizedSessionId = sessionId ?? createSessionId();
    const conversation = await this.findOrCreateConversation(normalizedSessionId);

    const userMessage = await this.dependencies.messageRepository.createMessage({
      conversationId: conversation.id,
      sender: MessageSender.USER,
      content: message,
    });

    const persistedHistory = await this.dependencies.messageRepository.getConversationMessages(
      conversation.id,
    );
    const priorHistory = persistedHistory.filter((historyMessage) => historyMessage.id !== userMessage.id);
    const reply = await this.dependencies.llmProvider.generateReply(
      this.toLLMHistory(priorHistory),
      message,
    );

    await this.dependencies.messageRepository.createMessage({
      conversationId: conversation.id,
      sender: MessageSender.AI,
      content: reply,
    });

    return {
      reply,
      sessionId: normalizedSessionId,
    };
  }

  public async streamMessage(message: string, sessionId?: string): Promise<StreamChatMessageResult> {
    const normalizedSessionId = sessionId ?? createSessionId();
    const conversation = await this.findOrCreateConversation(normalizedSessionId);

    const userMessage = await this.dependencies.messageRepository.createMessage({
      conversationId: conversation.id,
      sender: MessageSender.USER,
      content: message,
    });

    const persistedHistory = await this.dependencies.messageRepository.getConversationMessages(
      conversation.id,
    );
    const priorHistory = persistedHistory.filter(
      (historyMessage) => historyMessage.id !== userMessage.id,
    );

    return {
      sessionId: normalizedSessionId,
      stream: this.dependencies.llmProvider.streamReply(this.toLLMHistory(priorHistory), message),
      saveReply: async (reply: string): Promise<void> => {
        await this.dependencies.messageRepository.createMessage({
          conversationId: conversation.id,
          sender: MessageSender.AI,
          content: reply,
        });
      },
    };
  }

  public async getHistory(sessionId: string): Promise<ChatHistoryResponse> {
    const conversation = await this.dependencies.conversationRepository.findBySessionId(sessionId);

    if (conversation === null) {
      return {
        sessionId,
        messages: [],
      };
    }

    const messages = await this.dependencies.messageRepository.getConversationMessages(conversation.id);

    return {
      sessionId,
      messages: messages.map(toChatMessageDto),
    };
  }

  private async findOrCreateConversation(sessionId: string) {
    const conversation = await this.dependencies.conversationRepository.findBySessionId(sessionId);

    if (conversation !== null) {
      return conversation;
    }

    return this.dependencies.conversationRepository.createConversation(sessionId);
  }

  private toLLMHistory(messages: Message[]): LLMHistoryMessage[] {
    return messages.map((message) => ({
      sender: message.sender === MessageSender.USER ? 'user' : 'ai',
      content: message.content,
      createdAt: message.createdAt,
    }));
  }
}

const toChatMessageDto = (message: Message): ChatMessageDto => {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: message.sender,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
};
