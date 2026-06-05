import type { RequestHandler } from 'express';

export const sanitizationMiddleware: RequestHandler = (request, _response, next) => {
  request.body = sanitizeValue(request.body);
  request.params = sanitizeValue(request.params) as typeof request.params;
  request.query = sanitizeValue(request.query) as typeof request.query;

  next();
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.trim().split('').filter(isSafeCharacter).join('');
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, sanitizeValue(entryValue)]),
    );
  }

  return value;
};

const isSafeCharacter = (character: string): boolean => {
  const codePoint = character.codePointAt(0);

  if (codePoint === undefined) {
    return false;
  }

  return codePoint === 9 || codePoint === 10 || codePoint === 13 || (codePoint >= 32 && codePoint !== 127);
};
