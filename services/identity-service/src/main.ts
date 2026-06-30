import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
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

async function bootstrap() {
  // Initialize OpenTelemetry
  initTracing(ServiceName.IDENTITY_SERVICE);

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.IDENTITY_SERVICE_PORT || SERVICE_PORTS[ServiceName.IDENTITY_SERVICE];

  // Global prefixes and pipes
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000), // 30s timeout
  );

  // Enable CORS
  app.enableCors();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Identity Service API')
    .setDescription('The Identity Service handles authentication and authorization')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configure gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ecommerce.identity', // We'll need to create identity.proto or add to common
      protoPath: join(__dirname, '../../proto/common.proto'), // TBD, need full path
      url: `0.0.0.0:${GRPC_PORTS[ServiceName.IDENTITY_SERVICE]}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  
  logger.log(`Identity Service is running on: http://localhost:${port}`);
  logger.log(`gRPC Server is running on port: ${GRPC_PORTS[ServiceName.IDENTITY_SERVICE]}`);
}
bootstrap();
