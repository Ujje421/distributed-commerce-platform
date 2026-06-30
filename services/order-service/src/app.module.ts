import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { OrderService } from './application/services/order.service';
import { OrderController } from './presentation/controllers/order.controller';
import { OrderSaga } from './application/sagas/order.saga';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'order-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-order-group',
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderSaga],
})
export class AppModule {}
