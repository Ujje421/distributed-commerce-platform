import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { ShippingService } from '../services/shipping.service';

@Injectable()
export class OrderConfirmedConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderConfirmedConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly shippingService: ShippingService,
  ) {}

  async onModuleInit() {
    this.kafkaService.on(EventType.ORDER_CONFIRMED, async (payload) => {
      try {
        const { orderId, payload: orderData } = payload.data as any;
        const address = orderData?.shippingAddress || {};

        await this.shippingService.createShipment(orderId, address);
      } catch (error) {
        this.logger.error(`Failed to process ORDER_CONFIRMED: ${(error as Error).message}`);
      }
    });
  }
}
