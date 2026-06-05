import type { RequestHandler } from 'express';

import { env } from '../config/env.js';

export const timeoutMiddleware: RequestHandler = (_request, response, next) => {
  response.setTimeout(env.API_TIMEOUT_MS, () => {
    if (!response.headersSent) {
      response.status(503).json({
        error: 'Request timed out. Please try again.',
        code: 'REQUEST_TIMEOUT',
      });
    }
  });

  next();
};
