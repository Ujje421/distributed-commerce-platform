import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Base Prisma service that all microservices will extend or use directly.
 * Handles connection lifecycle and logging.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Add query logging in development
      if (process.env.NODE_ENV !== 'production') {
        (this as any).$on('query', (e: any) => {
          this.logger.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
        });
      }
    } catch (error) {
      this.logger.error(`Database connection failed: ${(error as Error).message}`);
      // Depending on resilience strategy, we might want to crash or let health checks handle it
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
