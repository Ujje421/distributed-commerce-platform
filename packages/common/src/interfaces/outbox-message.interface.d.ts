import { EventType } from '../events/event-types';
/**
 * Outbox message interface for the transactional outbox pattern.
 * Messages are written to the outbox table within the same database transaction
 * as the business data, then published to Kafka by a background processor.
 */
export interface IOutboxMessage {
    id: string;
    eventType: EventType;
    topic: string;
    partitionKey: string;
    payload: string;
    correlationId: string;
    createdAt: Date;
    processedAt: Date | null;
    retryCount: number;
    maxRetries: number;
    error: string | null;
    status: OutboxMessageStatus;
}
export declare enum OutboxMessageStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    DEAD_LETTER = "DEAD_LETTER"
}
//# sourceMappingURL=outbox-message.interface.d.ts.map