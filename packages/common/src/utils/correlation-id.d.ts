/**
 * Generates a correlation ID or extracts one from the request headers.
 * Correlation IDs are used to trace requests across microservices.
 */
export declare function generateCorrelationId(): string;
/**
 * Extracts the correlation ID from headers, or generates a new one.
 */
export declare function getOrCreateCorrelationId(headers: Record<string, string | string[] | undefined>): string;
//# sourceMappingURL=correlation-id.d.ts.map