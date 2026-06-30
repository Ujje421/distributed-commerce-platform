import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getOrCreateCorrelationId } from '@ecommerce/common';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = getOrCreateCorrelationId(req.headers);
    
    // Attach to request for downstream handlers
    req.headers['x-correlation-id'] = correlationId;
    
    // Attach to response
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
