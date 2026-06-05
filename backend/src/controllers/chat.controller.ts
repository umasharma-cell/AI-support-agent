import type { Request, Response } from 'express';

import { LLMProviderError } from '../providers/llm.error.js';
import { ChatService } from '../services/chat.service.js';
import type { SendChatMessageRequest } from '../types/chat.types.js';

interface ChatHistoryParams {
  sessionId: string;
}

export class ChatController {
  public constructor(private readonly chatService: ChatService = new ChatService()) {}

  public sendMessage = async (request: Request, response: Response): Promise<void> => {
    const body = request.body as SendChatMessageRequest;
    const result = await this.chatService.sendMessage(body.message, body.sessionId);

    response.status(200).json(result);
  };

  public streamMessage = async (request: Request, response: Response): Promise<void> => {
    const body = request.body as SendChatMessageRequest;
    const result = await this.chatService.streamMessage(body.message, body.sessionId);
    let reply = '';

    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();

    writeSseEvent(response, 'session', { sessionId: result.sessionId });

    try {
      for await (const token of result.stream) {
        reply += token;
        writeSseEvent(response, 'delta', { token });
      }

      await result.saveReply(reply);
      writeSseEvent(response, 'done', { reply, sessionId: result.sessionId });
      response.end();
    } catch (error) {
      const normalizedError = normalizeStreamError(error);

      writeSseEvent(response, 'error', normalizedError);
      response.end();
    }
  };

  public getHistory = async (request: Request, response: Response): Promise<void> => {
    const { sessionId } = request.params as unknown as ChatHistoryParams;
    const result = await this.chatService.getHistory(sessionId);

    response.status(200).json(result);
  };
}

const writeSseEvent = (response: Response, event: string, data: unknown): void => {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
};

const normalizeStreamError = (error: unknown): { error: string; code: string } => {
  if (error instanceof LLMProviderError) {
    return {
      error: toLLMMessage(error),
      code: error.code,
    };
  }

  return {
    error: 'Unable to stream AI response. Please try again.',
    code: 'STREAM_ERROR',
  };
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
