import type { Request, Response } from 'express';

export class HealthController {
  public getHealth = (_request: Request, response: Response): void => {
    response.status(200).json({
      status: 'ok',
    });
  };
}
