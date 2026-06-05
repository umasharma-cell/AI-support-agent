import { Router } from 'express';
import { z } from 'zod';

import { ChatController } from '../controllers/chat.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const sendMessageSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required.',
      invalid_type_error: 'Message must be a string.',
    })
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(2000, 'Message must be 2000 characters or fewer.'),
  sessionId: z
    .string({
      invalid_type_error: 'Session ID must be a string.',
    })
    .trim()
    .min(1, 'Session ID cannot be empty.')
    .max(128, 'Session ID must be 128 characters or fewer.')
    .optional(),
});

const historyParamsSchema = z.object({
  sessionId: z
    .string({
      required_error: 'Session ID is required.',
      invalid_type_error: 'Session ID must be a string.',
    })
    .trim()
    .min(1, 'Session ID cannot be empty.')
    .max(128, 'Session ID must be 128 characters or fewer.'),
});

export const createChatRouter = (): Router => {
  const router = Router();
  const controller = new ChatController();

  router.post(
    '/message',
    validateRequest({ body: sendMessageSchema }),
    asyncHandler(controller.sendMessage),
  );
  router.post(
    '/message/stream',
    validateRequest({ body: sendMessageSchema }),
    asyncHandler(controller.streamMessage),
  );
  router.get(
    '/history/:sessionId',
    validateRequest({ params: historyParamsSchema }),
    asyncHandler(controller.getHistory),
  );

  return router;
};
