import { Module, DynamicModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';

export interface OutboxModuleOptions {
  /** The PrismaClient instance for database access */
  prismaServiceToken: string;
  /** Polling interval in milliseconds (default: 5000) */
  pollIntervalMs?: number;
  /** Maximum number of messages to process per batch (default: 100) */
  batchSize?: number;
  /** Maximum retry attempts for failed messages (default: 5) */
  maxRetries?: number;
}

@Module({})
export class OutboxModule {
  static register(options: OutboxModuleOptions): DynamicModule {
    return {
      module: OutboxModule,
      imports: [ScheduleModule.forRoot()],
      providers: [
        {
          provide: 'OUTBOX_OPTIONS',
          useValue: options,
        },
        OutboxService,
        OutboxProcessor,
      ],
      exports: [OutboxService],
    };
  }
}
