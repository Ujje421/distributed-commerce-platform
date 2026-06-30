import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a correlation ID or extracts one from the request headers.
 * Correlation IDs are used to trace requests across microservices.
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Extracts the correlation ID from headers, or generates a new one.
 */
export function getOrCreateCorrelationId(headers: Record<string, string | string[] | undefined>): string {
  const existing = headers['x-correlation-id'];

  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }

  return generateCorrelationId();
}
