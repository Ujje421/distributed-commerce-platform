import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IAuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class UserHeaderMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    const email = req.headers['x-user-email'] as string;
    const rolesHeader = req.headers['x-user-roles'] as string;

    if (userId && email && rolesHeader) {
      req.user = {
        userId,
        email,
        roles: rolesHeader.split(','),
      } as IAuthenticatedUser;
    }

    next();
  }
}
