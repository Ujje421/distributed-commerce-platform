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
  ServiceName
} from '@ecommerce/common';
import { initTracing } from '@ecommerce/observability';

async function bootstrap() {
  initTracing(ServiceName.ORDER_SERVICE);

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.ORDER_SERVICE_PORT || SERVICE_PORTS[ServiceName.ORDER_SERVICE];

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000),
  );

  const config = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('Orchestrates order placement and fulfillment sagas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  
  logger.log(`Order Service is running on: http://localhost:${port}`);
}
bootstrap();
