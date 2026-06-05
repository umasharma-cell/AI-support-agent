import { Router } from 'express';

import { createChatRouter } from './chat.routes.js';
import { createHealthRouter } from './health.routes.js';

export const createApiRouter = (): Router => {
  const router = Router();

  router.use(createHealthRouter());
  router.use('/chat', createChatRouter());

  return router;
};
