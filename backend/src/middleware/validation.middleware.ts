import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AnyZodObject, ZodError } from 'zod';

import { AppError } from '../utils/app-error.js';

interface RequestValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest = (schemas: RequestValidationSchemas): RequestHandler => {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      if (schemas.body !== undefined) {
        request.body = schemas.body.parse(request.body);
      }

      if (schemas.params !== undefined) {
        request.params = schemas.params.parse(request.params);
      }

      if (schemas.query !== undefined) {
        request.query = schemas.query.parse(request.query);
      }

      next();
    } catch (error) {
      next(toValidationError(error));
    }
  };
};

const toValidationError = (error: unknown): AppError => {
  if (isZodError(error)) {
    const firstIssue = error.issues[0];

    return new AppError(400, 'VALIDATION_ERROR', firstIssue?.message ?? 'Invalid request.', {
      cause: error,
    });
  }

  return new AppError(400, 'VALIDATION_ERROR', 'Invalid request.', { cause: error });
};

const isZodError = (error: unknown): error is ZodError => {
  return error instanceof Error && error.name === 'ZodError';
};
