import { randomUUID } from 'node:crypto';

export const createSessionId = (): string => {
  return randomUUID();
};
