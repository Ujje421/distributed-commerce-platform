import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { ShippingService } from './application/services/shipping.service';
import { OrderConfirmedConsumer } from './application/consumers/order-confirmed.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'shipping-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-shipping-group',
      }),
    }),
  ],
  providers: [ShippingService, OrderConfirmedConsumer],
})
export class AppModule {}