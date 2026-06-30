import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InventoryPrismaService } from '../../infrastructure/persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { UpdateStockDto, ReserveStockDto, ReleaseStockDto } from '../../presentation/dto/inventory.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: InventoryPrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async getStock(sku: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { sku },
    });

    if (!item) {
      throw new NotFoundException(`Inventory for SKU ${sku} not found`);
    }

    return {
      sku: item.sku,
      availableQuantity: item.quantity - item.reservedQuantity,
      totalQuantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
    };
  }

  async updateStock(sku: string, dto: UpdateStockDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { sku } });
    if (!item) {
      throw new NotFoundException(`Inventory for SKU ${sku} not found`);
    }

    return this.prisma.inventoryItem.update({
      where: { sku },
      data: { quantity: dto.quantity },
    });
  }

  async reserveStock(dto: ReserveStockDto) {
    const { sku, quantity, orderId } = dto;
    
    // Optimistic locking loop for reservation
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      const item = await this.prisma.inventoryItem.findUnique({ where: { sku } });
      if (!item) {
        throw new NotFoundException(`Inventory for SKU ${sku} not found`);
      }

      const available = item.quantity - item.reservedQuantity;
      if (available < quantity) {
        throw new BadRequestException(`Insufficient stock for SKU ${sku}`);
      }

      try {
        const result = await this.prisma.$transaction(async (tx) => {
          // 1. Update item with optimistic concurrency control (check version)
          const updatedItem = await tx.inventoryItem.update({
            where: {
              id: item.id,
              version: item.version, // Ensure version hasn't changed
            },
            data: {
              reservedQuantity: item.reservedQuantity + quantity,
              version: { increment: 1 },
            },
          });

          // 2. Create reservation record
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins TTL

          const reservation = await tx.inventoryReservation.create({
            data: {
              inventoryItemId: item.id,
              orderId,
              quantity,
              expiresAt,
            },
          });

          // 3. Emit Event
          const message = this.outboxService.createMessage(
            EventType.INVENTORY_RESERVED,
            { orderId, sku, quantity },
            { key: orderId, source: 'inventory-service' }
          );
          await tx.outbox.create(message as any);

          return { updatedItem, reservation };
        });

        this.logger.log(`Reserved ${quantity} of ${sku} for order ${orderId}`);
        return result.reservation;
      } catch (error) {
        // Prisma throws a known error code P2025 for "record not found"
        // In the context of optimistic locking update, this means the version mismatched
        if ((error as any).code === 'P2025') {
          retries++;
          this.logger.warn(`Optimistic lock failure reserving ${sku}, retrying (${retries}/${MAX_RETRIES})...`);
          continue;
        }
        throw error;
      }
    }

    throw new BadRequestException(`Failed to reserve stock for ${sku} after multiple attempts due to high contention.`);
  }

  async releaseStock(dto: ReleaseStockDto) {
    const { sku, orderId } = dto;

    const reservation = await this.prisma.inventoryReservation.findFirst({
      where: {
        inventoryItem: { sku },
        orderId,
        status: 'RESERVED',
      },
      include: { inventoryItem: true },
    });

    if (!reservation) {
      throw new NotFoundException(`Active reservation for order ${orderId} and SKU ${sku} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark reservation as released
      await tx.inventoryReservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' },
      });

      // 2. Decrement reserved quantity
      await tx.inventoryItem.update({
        where: { id: reservation.inventoryItemId },
        data: {
          reservedQuantity: { decrement: reservation.quantity },
          version: { increment: 1 },
        },
      });

      // 3. Emit event
      const message = this.outboxService.createMessage(
        EventType.INVENTORY_RELEASED,
        { orderId, sku },
        { key: orderId, source: 'inventory-service' }
      );
      await tx.outbox.create(message as any);
    });

    this.logger.log(`Released stock for order ${orderId}, SKU ${sku}`);
  }
}
