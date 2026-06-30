import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * API Key Authentication Guard.
 * Validates API keys from the X-API-Key header.
 * 
 * The actual key validation is delegated to a service that must be injected.
 * This guard provides the framework; each service implements the validation.
 */
@Injectable()
export abstract class ApiKeyGuard implements CanActivate {
  constructor(protected readonly reflector: Reflector) {}

  abstract validateApiKey(apiKey: string): Promise<boolean>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const isValid = await this.validateApiKey(apiKey);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
