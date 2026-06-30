import { Module, Global } from '@nestjs/common';
import { PrismaService } from '@ecommerce/database';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/**
 * Service-specific Prisma Service that overrides the generic one if needed,
 * or simply provides the configured client.
 */
@Injectable()
export class IdentityPrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    });
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'PrismaService', // The token expected by OutboxModule
      useClass: IdentityPrismaService,
    },
    IdentityPrismaService
  ],
  exports: ['PrismaService', IdentityPrismaService],
})
export class DatabaseModule {}

import { Injectable } from '@nestjs/common';
