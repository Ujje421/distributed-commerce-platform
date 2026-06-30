import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaModule, OutboxModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';

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
        clientId: 'identity-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-identity-group',
      }),
    }),
    OutboxModule.register({
      prismaServiceToken: 'PrismaService', // Refers to the service provided by DatabaseModule
      pollIntervalMs: 2000,
      batchSize: 100,
    }),
    AuthModule,
    ApplicationModule,
    PresentationModule,
  ],
})
export class AppModule {}
