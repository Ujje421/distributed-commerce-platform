import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { OrderService } from '../services/order.service';

@Injectable()
export class OrderSaga implements OnModuleInit {
  private readonly logger = new Logger(OrderSaga.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    // 1. Listen for Inventory Reservation Success
    this.kafkaService.on(EventType.INVENTORY_RESERVED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Inventory reserved for order ${orderId}. Transitioning to PAYMENT_PROCESSING.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'PAYMENT_PROCESSING', 
          EventType.INVENTORY_RESERVED, 
          payload.data,
          EventType.PAYMENT_INITIATED // Broadcast to PaymentService
        );
      } catch (error) {
        this.logger.error(`Error in Saga INVENTORY_RESERVED: ${(error as Error).message}`);
      }
    });

    // 2. Listen for Inventory Reservation Failure
    this.kafkaService.on(EventType.INVENTORY_RESERVATION_FAILED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Inventory reservation failed for order ${orderId}. Cancelling order.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'CANCELLED', 
          EventType.INVENTORY_RESERVATION_FAILED, 
          payload.data,
          EventType.ORDER_CANCELLED
        );
      } catch (error) {
        this.logger.error(`Error in Saga INVENTORY_RESERVATION_FAILED: ${(error as Error).message}`);
      }
    });

    // 3. Listen for Payment Success
    this.kafkaService.on(EventType.PAYMENT_COMPLETED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Payment completed for order ${orderId}. Transitioning to CONFIRMED.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'CONFIRMED', 
          EventType.PAYMENT_COMPLETED, 
          payload.data,
          EventType.ORDER_CONFIRMED // Broadcast to ShippingService
        );
      } catch (error) {
        this.logger.error(`Error in Saga PAYMENT_COMPLETED: ${(error as Error).message}`);
      }
    });

    // 4. Listen for Payment Failure
    this.kafkaService.on(EventType.PAYMENT_FAILED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Payment failed for order ${orderId}. Cancelling order.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'CANCELLED', 
          EventType.PAYMENT_FAILED, 
          payload.data
        );
      } catch (error) {
        this.logger.error(`Error in Saga PAYMENT_FAILED: ${(error as Error).message}`);
      }
    });

    // 5. Listen for Shipment Creation
    this.kafkaService.on(EventType.SHIPMENT_CREATED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Shipment created for order ${orderId}. Transitioning to SHIPPING.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'SHIPPING', 
          EventType.SHIPMENT_CREATED, 
          payload.data
        );
      } catch (error) {
        this.logger.error(`Error in Saga SHIPMENT_CREATED: ${(error as Error).message}`);
      }
    });

    // 6. Listen for Delivery
    this.kafkaService.on(EventType.SHIPMENT_DELIVERED, async (payload) => {
      const { orderId } = payload.data as { orderId: string };
      this.logger.log(`[Saga] Shipment delivered for order ${orderId}. Transitioning to DELIVERED.`);
      
      try {
        await this.orderService.updateOrderStatus(
          orderId, 
          'DELIVERED', 
          EventType.SHIPMENT_DELIVERED, 
          payload.data
        );
      } catch (error) {
        this.logger.error(`Error in Saga SHIPMENT_DELIVERED: ${(error as Error).message}`);
      }
    });
  }
}
