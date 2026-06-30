import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { 
  GlobalExceptionFilter, 
  HttpExceptionFilter, 
  LoggingInterceptor, 
  SERVICE_PORTS,
  ServiceName
} from '@ecommerce/common';
import { initTracing } from '@ecommerce/observability';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

async function bootstrap() {
  initTracing(ServiceName.API_GATEWAY);

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.API_GATEWAY_PORT || SERVICE_PORTS[ServiceName.API_GATEWAY];

  // Security and compression
  app.use(helmet());
  app.use(compression());
  app.enableCors();

  // Custom middlewares
  app.use(new CorrelationIdMiddleware().use);

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());
  
  // Note: We don't use TransformInterceptor here because we want to pass 
  // through the downstream service responses exactly as they are.
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  logger.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
