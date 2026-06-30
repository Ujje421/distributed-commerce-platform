import { IAuthenticatedUser } from '../interfaces/authenticated-user.interface';
/**
 * Parameter decorator that extracts the authenticated user from the request.
 * Usage: @CurrentUser() user: IAuthenticatedUser
 * Usage: @CurrentUser('userId') userId: string
 */
export declare const CurrentUser: (...dataOrPipes: (keyof IAuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
//# sourceMappingURL=current-user.decorator.d.ts.map