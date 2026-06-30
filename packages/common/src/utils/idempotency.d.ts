/**
 * Generates a new idempotency key.
 */
export declare function generateIdempotencyKey(): string;
/**
 * Validates that an idempotency key has the correct format.
 */
export declare function isValidIdempotencyKey(key: string): boolean;
/**
 * Redis key format for idempotency deduplication.
 */
export declare function idempotencyRedisKey(service: string, key: string): string;
//# sourceMappingURL=idempotency.d.ts.map