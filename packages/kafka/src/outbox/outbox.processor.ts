import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ModuleRef } from '@nestjs/core';
import { KafkaService } from '../kafka.service';
import { OutboxModuleOptions } from './outbox.module';
import { OutboxMessageStatus } from '@ecommerce/common';

@Injectable()
export class OutboxProcessor implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;
  private prisma: any; // Dynamically resolved

  constructor(
    @Inject('OUTBOX_OPTIONS') private readonly options: OutboxModuleOptions,
    private readonly kafkaService: KafkaService,
    private readonly moduleRef: ModuleRef,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    // Resolve the Prisma service dynamically based on the provided token
    try {
      this.prisma = this.moduleRef.get(this.options.prismaServiceToken, { strict: false });
      
      const intervalMs = this.options.pollIntervalMs || 5000;
      const interval = setInterval(() => this.processOutbox(), intervalMs);
      this.schedulerRegistry.addInterval('outbox_processor', interval);
      
      this.logger.log(`Outbox processor initialized (Polling every ${intervalMs}ms)`);
    } catch (error) {
      this.logger.error(`Failed to resolve Prisma service for outbox processor: ${(error as Error).message}`);
    }
  }

  async processOutbox() {
    if (this.isProcessing || !this.prisma || !this.kafkaService.isHealthy()) {
      return;
    }

    this.isProcessing = true;
    const batchSize = this.options.batchSize || 100;

    try {
      // Find pending messages
      const messages = await this.prisma.outbox.findMany({
        where: {
          status: OutboxMessageStatus.PENDING,
        },
        take: batchSize,
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (messages.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Processing ${messages.length} outbox messages`);

      // Mark as processing
      await this.prisma.outbox.updateMany({
        where: { id: { in: messages.map((m: any) => m.id) } },
        data: { status: OutboxMessageStatus.PROCESSING },
      });

      // Process each message
      for (const message of messages) {
        try {
          const payload = JSON.parse(message.payload);
          
          await this.kafkaService.publish(
            message.eventType,
            payload.data,
            {
              key: message.partitionKey,
              correlationId: message.correlationId,
            }
          );

          // Mark as completed
          await this.prisma.outbox.update({
            where: { id: message.id },
            data: {
              status: OutboxMessageStatus.COMPLETED,
              processedAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(`Failed to process outbox message ${message.id}: ${(error as Error).message}`);
          
          const retryCount = message.retryCount + 1;
          const maxRetries = this.options.maxRetries || 5;
          const status = retryCount >= maxRetries ? OutboxMessageStatus.DEAD_LETTER : OutboxMessageStatus.PENDING;

          // Update failed status
          await this.prisma.outbox.update({
            where: { id: message.id },
            data: {
              status,
              retryCount,
              error: (error as Error).message,
            },
          });

          // If it reached max retries, it might be moved to a DLQ logic later
          if (status === OutboxMessageStatus.DEAD_LETTER) {
            this.logger.error(`Outbox message ${message.id} moved to DEAD_LETTER after ${retryCount} retries`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error in outbox processing cycle: ${(error as Error).message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
