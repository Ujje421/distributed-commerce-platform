import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '@ecommerce/kafka';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { OpenSearchModule } from './infrastructure/search/opensearch.module';
import { ProductService } from './application/services/product.service';
import { ProductController } from './presentation/controllers/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    OpenSearchModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: 'product-catalog-service',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-product-group',
      }),
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class AppModule {}
