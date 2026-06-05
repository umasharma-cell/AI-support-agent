export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public override readonly cause: unknown;

  public constructor(
    statusCode: number,
    code: string,
    message: string,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options?.isOperational ?? true;
    this.cause = options?.cause;
  }
}
