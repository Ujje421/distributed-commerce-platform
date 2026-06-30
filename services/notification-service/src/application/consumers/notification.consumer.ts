import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    this.kafkaService.on(EventType.ORDER_CONFIRMED, async (payload) => {
      try {
        const { orderId } = payload.data as any;
        const userId = payload.source === 'order-service' ? 'system-or-extracted-user-id' : 'mock-user-id';
        
        await this.notificationService.sendNotification(userId, 'EMAIL', {
          subject: 'Order Confirmed',
          message: `Your order ${orderId} has been confirmed.`,
        });
      } catch (error) {
        this.logger.error(`Failed to process ORDER_CONFIRMED: ${(error as Error).message}`);
      }
    });

    this.kafkaService.on(EventType.USER_REGISTERED, async (payload) => {
      try {
        const { email, id } = payload.data as any;
        await this.notificationService.sendNotification(id, 'EMAIL', {
          subject: 'Welcome to E-commerce Platform',
          message: `Hello ${email}, welcome!`,
        });
      } catch (error) {
        this.logger.error(`Failed to process USER_REGISTERED: ${(error as Error).message}`);
      }
    });

    this.kafkaService.on(EventType.PAYMENT_FAILED, async (payload) => {
      try {
        const { orderId } = payload.data as any;
        await this.notificationService.sendNotification('mock-user-id', 'EMAIL', {
          subject: 'Payment Failed',
          message: `Payment failed for order ${orderId}. Order cancelled.`,
        });
      } catch (error) {
        this.logger.error(`Failed to process PAYMENT_FAILED: ${(error as Error).message}`);
      }
    });
  }
}
