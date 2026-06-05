const sessionStorageKey = 'spur-support-session-id';
const maxSessionIdLength = 128;

export const getStoredSessionId = (): string | null => {
  const sessionId = window.localStorage.getItem(sessionStorageKey);

  if (sessionId === null) {
    return null;
  }

  if (!isValidSessionId(sessionId)) {
    clearStoredSessionId();
    return null;
  }

  return sessionId;
};

export const setStoredSessionId = (sessionId: string): void => {
  if (!isValidSessionId(sessionId)) {
    return;
  }

  window.localStorage.setItem(sessionStorageKey, sessionId);
};

export const clearStoredSessionId = (): void => {
  window.localStorage.removeItem(sessionStorageKey);
};

export const isValidSessionId = (sessionId: string): boolean => {
  const trimmedSessionId = sessionId.trim();

  return trimmedSessionId.length > 0 && trimmedSessionId.length <= maxSessionIdLength;
};
