import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * JWT Authentication Guard.
 * Validates the JWT token from the Authorization header.
 * Skips validation for routes decorated with @Public().
 *
 * Note: Token validation logic is injected per-service.
 * This guard checks for the presence of a validated user on the request.
 */
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=jwt-auth.guard.d.ts.map