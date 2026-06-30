import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { InventoryPrismaService } from '../../infrastructure/persistence/database.module';

@Injectable()
export class ProductCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductCreatedConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly prisma: InventoryPrismaService,
  ) {}

  async onModuleInit() {
    this.kafkaService.on(EventType.PRODUCT_CREATED, async (payload) => {
      try {
        const product = payload.data as { id: string; sku: string };

        // Upsert inventory record
        await this.prisma.inventoryItem.upsert({
          where: { sku: product.sku },
          update: {},
          create: {
            productId: product.id,
            sku: product.sku,
            quantity: 0,
            reservedQuantity: 0,
          },
        });

        this.logger.log(`Created inventory record for new product ${product.sku}`);
      } catch (error) {
        this.logger.error(`Failed to process PRODUCT_CREATED: ${(error as Error).message}`);
        throw error;
      }
    });
  }
}
