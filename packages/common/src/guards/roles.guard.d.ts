import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Role-Based Access Control Guard.
 * Checks if the authenticated user has one of the required roles.
 * Must be used after JwtAuthGuard in the guard chain.
 */
export declare class RolesGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map