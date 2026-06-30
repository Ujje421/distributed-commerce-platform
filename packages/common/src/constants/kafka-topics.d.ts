import { EventType } from '../events/event-types';
/**
 * Kafka topic names mapped from event types.
 * Each event type has a dedicated topic for clear routing.
 */
export declare const KAFKA_TOPICS: Record<EventType, string>;
/**
 * Dead Letter Queue topic suffix.
 */
export declare const DLQ_SUFFIX = ".dlq";
/**
 * Get the DLQ topic name for a given topic.
 */
export declare function getDlqTopic(topic: string): string;
/**
 * Consumer group IDs for each service.
 */
export declare const CONSUMER_GROUPS: {
    IDENTITY: string;
    USER: string;
    PRODUCT: string;
    INVENTORY: string;
    CART: string;
    ORDER: string;
    PAYMENT: string;
    SHIPPING: string;
    NOTIFICATION: string;
    REVIEW: string;
    RECOMMENDATION: string;
};
//# sourceMappingURL=kafka-topics.d.ts.map