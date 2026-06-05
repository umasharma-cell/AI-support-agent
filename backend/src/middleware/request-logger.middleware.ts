import type { RequestHandler } from 'express';

export const requestLoggerMiddleware: RequestHandler = (request, response, next) => {
  const startedAt = process.hrtime.bigint();

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    console.info(
      JSON.stringify({
        level: 'info',
        event: 'http_request',
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Math.round(durationMs),
        ip: request.ip,
      }),
    );
  });

  next();
};
