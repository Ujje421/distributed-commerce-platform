import { Injectable, OnModuleInit, OnModuleDestroy, Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [PaymentPrismaService],
  exports: [PaymentPrismaService],
})
export class DatabaseModule {}
