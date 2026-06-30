import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { PaymentService } from '../services/payment.service';

@Injectable()
export class PaymentInitiatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentInitiatedConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly paymentService: PaymentService,
  ) {}

  async onModuleInit() {
    this.kafkaService.on(EventType.PAYMENT_INITIATED, async (payload) => {
      try {
        const { orderId, payload: orderData } = payload.data as any;
        const amount = orderData?.totalAmount || 0; // The original ORDER_PLACED payload is nested inside INVENTORY_RESERVED -> PAYMENT_INITIATED
        
        if (!amount) {
          this.logger.warn(`Missing amount in PAYMENT_INITIATED for order ${orderId}. Defaulting to 100.`);
        }

        await this.paymentService.processPayment(orderId, amount || 100);
      } catch (error) {
        this.logger.error(`Failed to process PAYMENT_INITIATED: ${(error as Error).message}`);
      }
    });
  }
}
