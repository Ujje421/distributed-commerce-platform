import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { NotificationService } from './application/services/notification.service';
import { NotificationConsumer } from './application/consumers/notification.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'notification-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-notification-group',
      }),
    }),
  ],
  providers: [NotificationService, NotificationConsumer],
})
export class AppModule {}