import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Parameter decorator that extracts the idempotency key from request headers.
 * Usage: @IdempotencyKey() key: string
 * 
 * Expects header: X-Idempotency-Key
 * Used to prevent duplicate processing of the same request.
 */
export const IdempotencyKey = createParamDecorator(
  (data: { required?: boolean } | undefined, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const key = request.headers['x-idempotency-key'] as string | undefined;

    if (!key && data?.required !== false) {
      throw new BadRequestException('X-Idempotency-Key header is required');
    }

    return key;
  },
);
