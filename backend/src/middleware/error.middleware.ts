import type { ErrorRequestHandler, RequestHandler } from 'express';

import { LLMProviderError } from '../providers/llm.error.js';
import { RepositoryError } from '../repositories/repository.error.js';
import { AppError } from '../utils/app-error.js';

interface ErrorResponse {
  error: string;
  code: string;
}

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;

  const appError = normalizeError(error);

  if (appError.statusCode >= 500) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'request_error',
        code: appError.code,
        message: appError.message,
        cause: appError.cause instanceof Error ? appError.cause.message : undefined,
      }),
    );
  }

  if (response.headersSent) {
    return;
  }

  response.status(appError.statusCode).json({
    error: appError.message,
    code: appError.code,
  } satisfies ErrorResponse);
};

export const notFoundMiddleware = (): RequestHandler => {
  return (request, response) => {
    response.status(404).json({
      error: `Route not found: ${request.method} ${request.path}`,
      code: 'ROUTE_NOT_FOUND',
    } satisfies ErrorResponse);
  };
};

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof LLMProviderError) {
    const statusCode = error.code === 'LLM_RATE_LIMITED' ? 429 : 503;

    return new AppError(statusCode, error.code, toLLMMessage(error), { cause: error });
  }

  if (error instanceof RepositoryError) {
    return new AppError(500, 'DATABASE_ERROR', 'A database error occurred.', { cause: error });
  }

  return new AppError(500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error.', {
    cause: error,
    isOperational: false,
  });
};

const toLLMMessage = (error: LLMProviderError): string => {
  if (error.code === 'LLM_RATE_LIMITED') {
    return 'AI service is rate limited. Please try again shortly.';
  }

  if (error.code === 'LLM_TIMEOUT') {
    return 'AI service timed out. Please try again.';
  }

  return 'AI service unavailable.';
};
