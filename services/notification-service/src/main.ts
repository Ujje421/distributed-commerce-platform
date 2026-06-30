import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { initTracing } from '@ecommerce/observability';

async function bootstrap() {
  initTracing('notification-service');
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3009;

  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  logger.log(`Notification Service is running on: http://localhost:${port}`);
}
bootstrap();