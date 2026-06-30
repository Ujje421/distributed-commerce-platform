import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { initTracing } from '@ecommerce/observability';

async function bootstrap() {
  initTracing('cart-service');
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3005;

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port);
  logger.log(`Cart Service is running on: http://localhost:${port}`);
}
bootstrap();