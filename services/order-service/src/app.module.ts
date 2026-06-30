import { Module, Global, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaModule, OutboxModule } from '@ecommerce/kafka';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderPrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'PrismaService',
      useClass: OrderPrismaService,
    },
    OrderPrismaService
  ],
  exports: ['PrismaService', OrderPrismaService],
})
export class DatabaseModule {}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    CqrsModule,
    DatabaseModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'order-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-order-group',
      }),
    }),
    OutboxModule.register({
      prismaServiceToken: 'PrismaService',
      pollIntervalMs: 2000,
      batchSize: 100,
    }),
    // Application components would be imported here
  ],
})
export class AppModule {}
