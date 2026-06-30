import { Injectable, Logger } from '@nestjs/common';
import { ShippingPrismaService } from '../../infrastructure/persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: ShippingPrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async createShipment(orderId: string, address: any) {
    this.logger.log(`Creating shipment for order ${orderId}`);

    const trackingCode = `TRK-${uuidv4().substring(0, 8).toUpperCase()}`;

    try {
      await this.prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.create({
          data: {
            orderId,
            trackingCode,
            address: address || {},
            courier: 'DEFAULT_COURIER',
          },
        });

        const outboxMessage = this.outboxService.createMessage(
          EventType.SHIPMENT_CREATED,
          {
            orderId,
            trackingCode,
            shipmentId: shipment.id,
            status: 'CREATED',
          },
          { key: orderId, source: 'shipping-service' }
        );

        await tx.outbox.create(outboxMessage as any);
      });

      this.logger.log(`Shipment created for order ${orderId} with tracking code ${trackingCode}`);
    } catch (error) {
      this.logger.error(`Error creating shipment for order ${orderId}: ${(error as Error).message}`);
    }
  }
}
