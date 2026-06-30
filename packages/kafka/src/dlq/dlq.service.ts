import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { IEventPayload, getDlqTopic } from '@ecommerce/common';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  /**
   * Send a failed message to the Dead Letter Queue topic.
   */
  async sendToDlq(
    originalTopic: string,
    payload: IEventPayload,
    error: Error,
  ): Promise<void> {
    const dlqTopic = getDlqTopic(originalTopic);
    
    // Enrich payload with DLQ metadata
    const dlqPayload = {
      ...payload,
      metadata: {
        ...payload.metadata,
        dlq: {
          originalTopic,
          failedAt: new Date().toISOString(),
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
    };

    try {
      // Use the internal producer directly to send to a custom topic 
      // (KafkaService.publish only sends to predefined event topics)
      // Accessing private property for simplicity in this architecture demo
      const producer = (this.kafkaService as any).producer;
      
      await producer.send({
        topic: dlqTopic,
        messages: [
          {
            key: payload.correlationId,
            value: JSON.stringify(dlqPayload),
            headers: {
              'correlation-id': payload.correlationId,
              'original-topic': originalTopic,
              'is-dlq': 'true',
            },
          },
        ],
      });

      this.logger.warn(
        `Message ${payload.eventId} successfully moved to DLQ ${dlqTopic}`
      );
    } catch (dlqError) {
      this.logger.error(
        `CRITICAL: Failed to send message to DLQ ${dlqTopic}: ${(dlqError as Error).message}`,
        (dlqError as Error).stack
      );
    }
  }
}
