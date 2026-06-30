import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SERVICE_PORTS } from '@ecommerce/common';
import { initTracing } from '@ecommerce/observability';

async function bootstrap() {
  initTracing('review-service');
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3010;

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port);
  logger.log(service.name + " is running on: http://localhost:" + port);
}
bootstrap();