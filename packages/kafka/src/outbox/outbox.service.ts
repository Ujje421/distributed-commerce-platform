import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventType, IEventPayload, KAFKA_TOPICS, OutboxMessageStatus } from '@ecommerce/common';
import { v4 as uuidv4 } from 'uuid';
import { OutboxModuleOptions } from './outbox.module';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    // We inject Prisma dynamically based on the service using this module
    // This assumes the consuming service provides its PrismaClient instance
    // under the token specified in options.prismaServiceToken
  ) {}

  /**
   * Generates the Prisma creation payload for an outbox message.
   * This is meant to be included in a Prisma transaction alongside business data updates.
   * 
   * Example usage:
   * await prisma.$transaction([
   *   prisma.order.create({ data: orderData }),
   *   prisma.outbox.create(outboxService.createMessage(EventType.ORDER_PLACED, payload))
   * ])
   */
  createMessage<T>(
    eventType: EventType,
    data: T,
    options?: {
      key?: string;
      correlationId?: string;
      source?: string;
    },
  ) {
    const topic = KAFKA_TOPICS[eventType];
    const correlationId = options?.correlationId || uuidv4();
    const eventId = uuidv4();

    const eventPayload: IEventPayload<T> = {
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
      correlationId,
      source: options?.source || 'unknown',
      version: 1,
      data,
    };

    return {
      data: {
        id: uuidv4(),
        eventType,
        topic,
        partitionKey: options?.key || correlationId,
        payload: JSON.stringify(eventPayload),
        correlationId,
        status: OutboxMessageStatus.PENDING,
        retryCount: 0,
        // maxRetries defaults to 5 if not provided in DB schema
      },
    };
  }
}
