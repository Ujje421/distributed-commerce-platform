import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a new idempotency key.
 */
export function generateIdempotencyKey(): string {
  return `idem_${uuidv4()}`;
}

/**
 * Validates that an idempotency key has the correct format.
 */
export function isValidIdempotencyKey(key: string): boolean {
  // Accept UUID format with optional prefix
  const uuidRegex = /^(idem_)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key);
}

/**
 * Redis key format for idempotency deduplication.
 */
export function idempotencyRedisKey(service: string, key: string): string {
  return `idempotency:${service}:${key}`;
}
