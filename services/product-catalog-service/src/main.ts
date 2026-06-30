import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { 
  GlobalExceptionFilter, 
  HttpExceptionFilter, 
  LoggingInterceptor, 
  TimeoutInterceptor, 
  TransformInterceptor,
  SERVICE_PORTS,
  ServiceName,
  GRPC_PORTS
} from '@ecommerce/common';
import { initTracing } from '@ecommerce/observability';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  initTracing(ServiceName.PRODUCT_CATALOG_SERVICE);

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PRODUCT_CATALOG_SERVICE_PORT || SERVICE_PORTS[ServiceName.PRODUCT_CATALOG_SERVICE];

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000),
  );

  const config = new DocumentBuilder()
    .setTitle('Product Catalog Service API')
    .setDescription('Manages products, categories, variants and OpenSearch integration')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configure gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ecommerce.product',
      protoPath: join(__dirname, '../../proto/common.proto'), 
      url: `0.0.0.0:${GRPC_PORTS[ServiceName.PRODUCT_CATALOG_SERVICE]}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  
  logger.log(`Product Catalog Service is running on: http://localhost:${port}`);
  logger.log(`gRPC Server is running on port: ${GRPC_PORTS[ServiceName.PRODUCT_CATALOG_SERVICE]}`);
}
bootstrap();
