import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * API Key Authentication Guard.
 * Validates API keys from the X-API-Key header.
 *
 * The actual key validation is delegated to a service that must be injected.
 * This guard provides the framework; each service implements the validation.
 */
export declare abstract class ApiKeyGuard implements CanActivate {
    protected readonly reflector: Reflector;
    constructor(reflector: Reflector);
    abstract validateApiKey(apiKey: string): Promise<boolean>;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=api-key.guard.d.ts.map