import type { Conversation } from '../generated/prisma/client.js';
import { prisma, type PrismaDatabaseClient } from '../database/prisma.js';
import { RepositoryError } from './repository.error.js';

export interface ConversationRepository {
  findBySessionId(sessionId: string): Promise<Conversation | null>;
  createConversation(sessionId: string): Promise<Conversation>;
}

export class PrismaConversationRepository implements ConversationRepository {
  public constructor(private readonly database: PrismaDatabaseClient = prisma) {}

  public async findBySessionId(sessionId: string): Promise<Conversation | null> {
    try {
      return await this.database.conversation.findUnique({
        where: {
          sessionId,
        },
      });
    } catch (error) {
      throw new RepositoryError('conversation.findBySessionId', error);
    }
  }

  public async createConversation(sessionId: string): Promise<Conversation> {
    try {
      return await this.database.conversation.create({
        data: {
          sessionId,
        },
      });
    } catch (error) {
      throw new RepositoryError('conversation.createConversation', error);
    }
  }
}
