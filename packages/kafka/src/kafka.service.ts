import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  Kafka,
  Producer,
  Consumer,
  EachMessagePayload,
  logLevel,
  CompressionTypes,
  RecordMetadata,
} from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { EventType, IEventPayload, KAFKA_TOPICS } from '@ecommerce/common';
import { KafkaModuleOptions } from './kafka.module';

export type MessageHandler = (payload: IEventPayload) => Promise<void>;

interface Subscription {
  topic: string;
  handler: MessageHandler;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly subscriptions: Subscription[] = [];
  private isConnected = false;

  constructor(@Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions) {
    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      ssl: options.ssl,
      sasl: options.sasl,
      logLevel: logLevel.WARN,
      retry: {
        initialRetryTime: options.retry?.initialRetryTime || 300,
        retries: options.retry?.maxRetries || 8,
        factor: options.retry?.retryFactor || 0.2,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: options.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
      retry: {
        retries: options.retry?.maxRetries || 5,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');

      if (this.subscriptions.length > 0) {
        await this.consumer.connect();
        this.logger.log('Kafka consumer connected');

        for (const sub of this.subscriptions) {
          await this.consumer.subscribe({
            topic: sub.topic,
            fromBeginning: false,
          });
          this.logger.log(`Subscribed to topic: ${sub.topic}`);
        }

        await this.consumer.run({
          eachMessage: async (payload: EachMessagePayload) => {
            await this.handleMessage(payload);
          },
        });
      }

      this.isConnected = true;
    } catch (error) {
      this.logger.error(`Failed to connect to Kafka: ${(error as Error).message}`);
      // Don't throw — allow service to start even if Kafka is down
      // The resilience layer will handle retries
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka connections closed');
    } catch (error) {
      this.logger.error(`Error disconnecting from Kafka: ${(error as Error).message}`);
    }
  }

  /**
   * Publish an event to Kafka.
   */
  async publish<T>(
    eventType: EventType,
    data: T,
    options?: {
      key?: string;
      correlationId?: string;
      source?: string;
      headers?: Record<string, string>;
    },
  ): Promise<RecordMetadata[]> {
    const topic = KAFKA_TOPICS[eventType];
    const correlationId = options?.correlationId || uuidv4();

    const eventPayload: IEventPayload<T> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      correlationId,
      source: options?.source || this.options.clientId,
      version: 1,
      data,
    };

    try {
      const result = await this.producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [
          {
            key: options?.key || correlationId,
            value: JSON.stringify(eventPayload),
            headers: {
              'correlation-id': correlationId,
              'event-type': eventType,
              'source': options?.source || this.options.clientId,
              ...options?.headers,
            },
          },
        ],
      });

      this.logger.log(
        JSON.stringify({
          action: 'EVENT_PUBLISHED',
          eventType,
          eventId: eventPayload.eventId,
          topic,
          correlationId,
        }),
      );

      return result;
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'EVENT_PUBLISH_FAILED',
          eventType,
          topic,
          correlationId,
          error: (error as Error).message,
        }),
      );
      throw error;
    }
  }

  /**
   * Subscribe to a Kafka topic.
   * Must be called before onModuleInit (typically in module setup).
   */
  subscribe(topic: string, handler: MessageHandler): void {
    this.subscriptions.push({ topic, handler });
  }

  /**
   * Subscribe to a specific event type.
   */
  on(eventType: EventType, handler: MessageHandler): void {
    const topic = KAFKA_TOPICS[eventType];
    this.subscribe(topic, handler);
  }

  /**
   * Internal message handler that routes messages to registered handlers.
   */
  private async handleMessage(messagePayload: EachMessagePayload): Promise<void> {
    const { topic, message, partition } = messagePayload;
    const correlationId = message.headers?.['correlation-id']?.toString() || 'unknown';

    try {
      if (!message.value) {
        this.logger.warn(`Received null message on topic ${topic}`);
        return;
      }

      const payload: IEventPayload = JSON.parse(message.value.toString());

      this.logger.log(
        JSON.stringify({
          action: 'EVENT_RECEIVED',
          eventType: payload.eventType,
          eventId: payload.eventId,
          topic,
          partition,
          correlationId,
        }),
      );

      const handlers = this.subscriptions.filter((sub) => sub.topic === topic);

      for (const sub of handlers) {
        await sub.handler(payload);
      }
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          action: 'EVENT_PROCESSING_FAILED',
          topic,
          partition,
          correlationId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        }),
      );

      // Don't rethrow — let KafkaJS handle the offset commit
      // Failed messages will be sent to DLQ by the DLQ service
    }
  }

  /**
   * Check if Kafka is connected and healthy.
   */
  isHealthy(): boolean {
    return this.isConnected;
  }
}
