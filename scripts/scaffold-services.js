const fs = require('fs');
const path = require('path');

const services = [
  { name: 'user-service', port: 3002 },
  { name: 'inventory-service', port: 3004 },
  { name: 'cart-service', port: 3005 },
  { name: 'payment-service', port: 3007 },
  { name: 'shipping-service', port: 3008 },
  { name: 'notification-service', port: 3009 },
  { name: 'review-service', port: 3010 },
];

const basePath = path.join(__dirname, '..', 'services');

services.forEach(service => {
  const servicePath = path.join(basePath, service.name);
  fs.mkdirSync(servicePath, { recursive: true });

  // package.json
  fs.writeFileSync(path.join(servicePath, 'package.json'), JSON.stringify({
    name: service.name,
    version: "1.0.0",
    private: true,
    scripts: {
      "build": "nest build",
      "start": "nest start",
      "start:dev": "nest start --watch",
      "prisma:generate": "prisma generate"
    },
    dependencies: {
      "@ecommerce/common": "*",
      "@ecommerce/database": "*",
      "@ecommerce/kafka": "*",
      "@ecommerce/observability": "*",
      "@ecommerce/resilience": "*",
      "@nestjs/common": "^10.4.0",
      "@nestjs/config": "^3.2.3",
      "@nestjs/core": "^10.4.0",
      "@nestjs/cqrs": "^10.2.7",
      "@nestjs/microservices": "^10.4.0",
      "@nestjs/platform-express": "^10.4.0",
      "@nestjs/swagger": "^7.4.0",
      "@prisma/client": "^5.18.0",
      "reflect-metadata": "^0.2.2",
      "rxjs": "^7.8.1"
    },
    devDependencies: {
      "@nestjs/cli": "^10.4.4",
      "@types/node": "^22.0.0",
      "prisma": "^5.18.0",
      "typescript": "^5.5.0"
    }
  }, null, 2));

  // tsconfig.json
  fs.writeFileSync(path.join(servicePath, 'tsconfig.json'), JSON.stringify({
    extends: "../../tsconfig.json",
    compilerOptions: {
      module: "commonjs",
      declaration: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      target: "ES2022",
      outDir: "./dist",
      baseUrl: "./"
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "**/*.spec.ts"]
  }, null, 2));

  // tsconfig.build.json
  fs.writeFileSync(path.join(servicePath, 'tsconfig.build.json'), JSON.stringify({
    extends: "./tsconfig.json",
    exclude: ["node_modules", "test", "dist", "**/*spec.ts"]
  }, null, 2));

  // prisma/schema.prisma
  fs.mkdirSync(path.join(servicePath, 'prisma'), { recursive: true });
  fs.writeFileSync(path.join(servicePath, 'prisma', 'schema.prisma'), `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Outbox {
  id            String    @id @default(uuid())
  eventType     String
  topic         String
  partitionKey  String
  payload       String    @db.Text
  correlationId String
  status        String    @default("PENDING")
  retryCount    Int       @default(0)
  maxRetries    Int       @default(5)
  error         String?   @db.Text
  createdAt     DateTime  @default(now())
  processedAt   DateTime?

  @@index([status, createdAt])
}
  `.trim());

  // src directory
  fs.mkdirSync(path.join(servicePath, 'src'), { recursive: true });

  // src/main.ts
  fs.writeFileSync(path.join(servicePath, 'src', 'main.ts'), `
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SERVICE_PORTS } from '@ecommerce/common';
import { initTracing } from '@ecommerce/observability';

async function bootstrap() {
  initTracing('${service.name}');
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || ${service.port};

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port);
  logger.log(service.name + " is running on: http://localhost:" + port);
}
bootstrap();
  `.trim());

  // src/app.module.ts
  fs.writeFileSync(path.join(servicePath, 'src', 'app.module.ts'), `
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaModule } from '@ecommerce/kafka';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    CqrsModule,
    KafkaModule.forRootAsync({
      useFactory: () => ({
        clientId: '${service.name}',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        groupId: 'ecommerce-${service.name.split('-')[0]}-group',
      }),
    }),
  ],
})
export class AppModule {}
  `.trim());

  // Dockerfile
  fs.writeFileSync(path.join(servicePath, 'Dockerfile'), `
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/resilience/package.json ./packages/resilience/
COPY packages/observability/package.json ./packages/observability/
COPY services/${service.name}/package.json ./services/${service.name}/
RUN npm install
COPY packages/ ./packages/
COPY services/${service.name}/ ./services/${service.name}/
WORKDIR /app/services/${service.name}
RUN npx prisma generate
WORKDIR /app
RUN npm run build:packages
RUN npm run build -w services/${service.name}

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/kafka/dist ./packages/kafka/dist
COPY --from=builder /app/packages/resilience/dist ./packages/resilience/dist
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist
COPY --from=builder /app/services/${service.name}/dist ./services/${service.name}/dist
COPY --from=builder /app/services/${service.name}/package.json ./services/${service.name}/
COPY --from=builder /app/services/${service.name}/prisma ./services/${service.name}/prisma
COPY --from=builder /app/services/${service.name}/node_modules/.prisma ./services/${service.name}/node_modules/.prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE ${service.port}
WORKDIR /app/services/${service.name}
CMD ["node", "dist/main"]
  `.trim());

  console.log("Scaffolded " + service.name);
});
