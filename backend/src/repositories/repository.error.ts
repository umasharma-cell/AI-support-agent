export type RepositoryOperation =
  | 'conversation.findBySessionId'
  | 'conversation.createConversation'
  | 'message.createMessage'
  | 'message.getConversationMessages';

export class RepositoryError extends Error {
  public readonly operation: RepositoryOperation;
  public override readonly cause: unknown;

  public constructor(operation: RepositoryOperation, cause: unknown) {
    super(`Repository operation failed: ${operation}`);
    this.name = 'RepositoryError';
    this.operation = operation;
    this.cause = cause;
  }
}
