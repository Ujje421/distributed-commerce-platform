import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { InventoryService } from './application/services/inventory.service';
import { InventoryController } from './presentation/controllers/inventory.controller';
import { ProductCreatedConsumer } from './application/consumers/product-created.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'inventory-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-inventory-group',
      }),
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, ProductCreatedConsumer],
})
export class AppModule {}