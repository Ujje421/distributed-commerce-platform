import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 * Usage: @CurrentUser() user: IAuthenticatedUser
 * Usage: @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof IAuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IAuthenticatedUser;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
