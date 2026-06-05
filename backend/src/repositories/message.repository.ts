import type { Message, MessageSender } from '../generated/prisma/client.js';
import { prisma, type PrismaDatabaseClient } from '../database/prisma.js';
import { RepositoryError } from './repository.error.js';

export interface CreateMessageInput {
  conversationId: string;
  sender: MessageSender;
  content: string;
}

export interface MessageRepository {
  createMessage(input: CreateMessageInput): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
}

export class PrismaMessageRepository implements MessageRepository {
  public constructor(private readonly database: PrismaDatabaseClient = prisma) {}

  public async createMessage(input: CreateMessageInput): Promise<Message> {
    try {
      return await this.database.message.create({
        data: {
          conversationId: input.conversationId,
          sender: input.sender,
          content: input.content,
        },
      });
    } catch (error) {
      throw new RepositoryError('message.createMessage', error);
    }
  }

  public async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      return await this.database.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch (error) {
      throw new RepositoryError('message.getConversationMessages', error);
    }
  }
}
