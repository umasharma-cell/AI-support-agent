export type LLMErrorCode =
  | 'LLM_TIMEOUT'
  | 'LLM_RATE_LIMITED'
  | 'LLM_API_ERROR'
  | 'LLM_EMPTY_RESPONSE'
  | 'LLM_PROMPT_TOO_LARGE';

export class LLMProviderError extends Error {
  public readonly code: LLMErrorCode;
  public readonly retryable: boolean;
  public override readonly cause: unknown;

  public constructor(code: LLMErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'LLMProviderError';
    this.code = code;
    this.retryable = code === 'LLM_TIMEOUT' || code === 'LLM_RATE_LIMITED' || code === 'LLM_API_ERROR';
    this.cause = options?.cause;
  }
}
