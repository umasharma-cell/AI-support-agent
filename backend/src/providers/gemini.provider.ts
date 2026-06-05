import { GoogleGenAI } from '@google/genai';

import { env } from '../config/env.js';
import { PromptBuilder } from '../services/prompt-builder.service.js';
import type { LLMHistoryMessage, LLMProvider } from '../types/llm.types.js';
import { LLMProviderError } from './llm.error.js';

interface GeminiProviderOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  maxPromptChars: number;
  promptBuilder: PromptBuilder;
}

export class GeminiProvider implements LLMProvider {
  private readonly client: GoogleGenAI;

  public constructor(private readonly options: GeminiProviderOptions = defaultGeminiOptions()) {
    this.client = new GoogleGenAI({
      apiKey: this.options.apiKey,
    });
  }

  public async generateReply(history: LLMHistoryMessage[], message: string): Promise<string> {
    const prompt = this.options.promptBuilder.build(history, message);
    this.assertPromptSize(prompt.systemInstruction, prompt.prompt);

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.options.timeoutMs);

    try {
      const response = await this.client.models.generateContent({
        model: this.options.model,
        contents: prompt.prompt,
        config: {
          systemInstruction: prompt.systemInstruction,
          maxOutputTokens: this.options.maxOutputTokens,
          temperature: 0.3,
          topP: 0.9,
          abortSignal: abortController.signal,
        },
      });

      const reply = response.text?.trim();

      if (reply === undefined || reply.length === 0) {
        throw new LLMProviderError('LLM_EMPTY_RESPONSE', 'Gemini returned an empty response.');
      }

      return reply;
    } catch (error) {
      throw this.toProviderError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async *streamReply(history: LLMHistoryMessage[], message: string): AsyncGenerator<string> {
    const prompt = this.options.promptBuilder.build(history, message);
    this.assertPromptSize(prompt.systemInstruction, prompt.prompt);

    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.options.timeoutMs);
    let emittedText = false;

    try {
      const stream = await this.client.models.generateContentStream({
        model: this.options.model,
        contents: prompt.prompt,
        config: {
          systemInstruction: prompt.systemInstruction,
          maxOutputTokens: this.options.maxOutputTokens,
          temperature: 0.3,
          topP: 0.9,
          abortSignal: abortController.signal,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;

        if (text !== undefined && text.length > 0) {
          emittedText = true;
          yield text;
        }
      }

      if (!emittedText) {
        throw new LLMProviderError('LLM_EMPTY_RESPONSE', 'Gemini returned an empty response.');
      }
    } catch (error) {
      throw this.toProviderError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private assertPromptSize(systemInstruction: string, prompt: string): void {
    const promptSize = `${systemInstruction}\n${prompt}`.length;

    if (promptSize > this.options.maxPromptChars) {
      throw new LLMProviderError('LLM_PROMPT_TOO_LARGE', 'Prompt exceeded configured size limit.');
    }
  }

  private toProviderError(error: unknown): LLMProviderError {
    if (error instanceof LLMProviderError) {
      return error;
    }

    if (isAbortError(error)) {
      return new LLMProviderError('LLM_TIMEOUT', 'Gemini request timed out.', { cause: error });
    }

    const status = getErrorStatus(error);

    if (status === 429) {
      return new LLMProviderError('LLM_RATE_LIMITED', 'Gemini rate limit was reached.', {
        cause: error,
      });
    }

    return new LLMProviderError('LLM_API_ERROR', 'Gemini request failed.', { cause: error });
  }
}

const defaultGeminiOptions = (): GeminiProviderOptions => {
  return {
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
    timeoutMs: env.LLM_TIMEOUT_MS,
    maxOutputTokens: env.LLM_MAX_OUTPUT_TOKENS,
    maxPromptChars: env.LLM_MAX_PROMPT_CHARS,
    promptBuilder: new PromptBuilder({
      maxHistoryMessages: env.LLM_MAX_HISTORY_MESSAGES,
      maxPromptChars: env.LLM_MAX_PROMPT_CHARS,
    }),
  };
};

const isAbortError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message.toLowerCase().includes('aborted'))
  );
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const candidate = error as { status?: unknown; code?: unknown };

  if (typeof candidate.status === 'number') {
    return candidate.status;
  }

  if (typeof candidate.code === 'number') {
    return candidate.code;
  }

  return undefined;
};
