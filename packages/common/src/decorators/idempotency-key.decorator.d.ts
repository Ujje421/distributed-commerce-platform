/**
 * Parameter decorator that extracts the idempotency key from request headers.
 * Usage: @IdempotencyKey() key: string
 *
 * Expects header: X-Idempotency-Key
 * Used to prevent duplicate processing of the same request.
 */
export declare const IdempotencyKey: (...dataOrPipes: ({
    required?: boolean;
} | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
//# sourceMappingURL=idempotency-key.decorator.d.ts.map