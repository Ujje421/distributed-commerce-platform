import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaModule } from '@ecommerce/kafka';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    CqrsModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'payment-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-payment-group',
      }),
    }),
  ],
})
export class AppModule {}