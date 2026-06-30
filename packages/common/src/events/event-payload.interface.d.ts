import { EventType } from './event-types';
/**
 * Base interface for all event payloads transmitted via Kafka.
 * Every event must carry metadata for tracing, idempotency, and ordering.
 */
export interface IEventPayload<T = unknown> {
    /** Unique event identifier (UUID v4) */
    eventId: string;
    /** Event type from the centralized enum */
    eventType: EventType;
    /** ISO 8601 timestamp of when the event occurred */
    timestamp: string;
    /** Correlation ID for distributed tracing */
    correlationId: string;
    /** Source service that produced the event */
    source: string;
    /** Event schema version for backward compatibility */
    version: number;
    /** The actual event data */
    data: T;
    /** Optional metadata for additional context */
    metadata?: Record<string, unknown>;
}
/**
 * Interface for outbox messages stored in the transactional outbox table.
 */
export interface IOutboxMessage {
    id: string;
    eventType: EventType;
    topic: string;
    key: string;
    payload: string;
    correlationId: string;
    createdAt: Date;
    processedAt: Date | null;
    retryCount: number;
    maxRetries: number;
    error: string | null;
}
/**
 * Options for publishing events.
 */
export interface IPublishOptions {
    /** Kafka partition key (used for ordering) */
    key?: string;
    /** Custom headers */
    headers?: Record<string, string>;
    /** Whether to use the outbox pattern (default: true) */
    useOutbox?: boolean;
}
//# sourceMappingURL=event-payload.interface.d.ts.map