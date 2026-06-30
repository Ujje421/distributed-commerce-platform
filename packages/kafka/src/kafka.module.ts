import { Module, DynamicModule, Global } from '@nestjs/common';
import { KafkaService } from './kafka.service';

export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
  groupId: string;
  /** SSL configuration */
  ssl?: boolean;
  /** SASL authentication */
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
    username: string;
    password: string;
  };
  /** Consumer retry options */
  retry?: {
    maxRetries: number;
    initialRetryTime: number;
    retryFactor: number;
  };
}

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options,
        },
        KafkaService,
      ],
      exports: [KafkaService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<KafkaModuleOptions> | KafkaModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        KafkaService,
      ],
      exports: [KafkaService],
      global: true,
    };
  }
}
