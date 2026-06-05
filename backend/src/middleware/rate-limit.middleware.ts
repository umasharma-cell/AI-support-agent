import type { RequestHandler } from 'express';

import { env } from '../config/env.js';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export const rateLimitMiddleware = (): RequestHandler => {
  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip ?? 'unknown';
    const bucket = buckets.get(key);

    if (bucket === undefined || bucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + env.RATE_LIMIT_WINDOW_MS,
      });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > env.RATE_LIMIT_MAX_REQUESTS) {
      response.status(429).json({
        error: 'Too many requests. Please try again shortly.',
        code: 'RATE_LIMITED',
      });
      return;
    }

    next();
  };
};
