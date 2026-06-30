import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { OrderPrismaService } from '../../infrastructure/persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { PlaceOrderDto } from '../../presentation/dto/order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: OrderPrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async placeOrder(userId: string, dto: PlaceOrderDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Order aggregate (Write Model / Current State)
      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount,
          shippingAddress: dto.shippingAddress,
          billingAddress: dto.billingAddress,
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // 2. Append to Event Store (Event Sourcing)
      const eventPayload = {
        orderId: order.id,
        userId,
        items: dto.items,
        totalAmount,
        shippingAddress: dto.shippingAddress,
      };

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          eventType: EventType.ORDER_PLACED,
          payload: JSON.parse(JSON.stringify(eventPayload)), // Ensure it's a valid JSON object
          version: 1,
        },
      });

      // 3. Emit Kafka Event for Saga Orchestration
      const outboxMessage = this.outboxService.createMessage(
        EventType.ORDER_PLACED,
        eventPayload,
        { key: order.id, source: 'order-service' }
      );
      await tx.outbox.create(outboxMessage as any);

      this.logger.log(`Order ${order.id} placed by user ${userId}`);
      return order;
    });
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, status: string, eventType: EventType, eventPayload: any, broadcastEvent?: EventType) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');

      // Update aggregate state
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          version: { increment: 1 },
        },
      });

      // Append event to event store
      await tx.orderEvent.create({
        data: {
          orderId,
          eventType,
          payload: eventPayload,
          version: updatedOrder.version,
        },
      });

      // Optionally broadcast an event to Kafka via Outbox
      if (broadcastEvent) {
        const outboxMessage = this.outboxService.createMessage(
          broadcastEvent,
          { orderId, status, payload: eventPayload },
          { key: orderId, source: 'order-service' }
        );
        await tx.outbox.create(outboxMessage as any);
      }

      return updatedOrder;
    });
  }
}
