import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { sanitizationMiddleware } from './middleware/sanitization.middleware.js';
import { timeoutMiddleware } from './middleware/timeout.middleware.js';
import { createApiRouter } from './routes/index.js';

export const createApp = (): express.Express => {
  const app = express();
  const allowedOrigins = new Set([
    env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (origin === undefined || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS origin not allowed: ${origin}`));
      },
    }),
  );
  app.use(requestLoggerMiddleware);
  app.use(timeoutMiddleware);
  app.use(rateLimitMiddleware());
  app.use(express.json({ limit: '1mb' }));
  app.use(sanitizationMiddleware);
  app.use('/api', createApiRouter());
  app.use(notFoundMiddleware());
  app.use(errorMiddleware);

  return app;
};
