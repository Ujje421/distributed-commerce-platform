import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export type TransactionDelegate = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Helper to manage database transactions, especially useful when combining
 * domain operations with the outbox pattern.
 */
@Injectable()
export class TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute a block of operations within a Prisma transaction.
   */
  async execute<T>(action: (tx: TransactionDelegate) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return action(tx as unknown as TransactionDelegate);
    }, {
      maxWait: 5000, // 5s timeout to obtain transaction
      timeout: 10000, // 10s timeout for the entire transaction
    });
  }
}
