import { Injectable, Logger } from '@nestjs/common';
import { PaymentPrismaService } from '../../infrastructure/persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType } from '@ecommerce/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PaymentPrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async processPayment(orderId: string, amount: number) {
    this.logger.log(`Processing payment for order ${orderId}, amount: ${amount}`);

    // Mock payment processing logic. 80% success rate.
    const isSuccess = Math.random() < 0.8;
    const transactionId = `txn_${uuidv4()}`;

    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const eventType = isSuccess ? EventType.PAYMENT_COMPLETED : EventType.PAYMENT_FAILED;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Upsert to handle retries gracefully (idempotency)
        const payment = await tx.payment.upsert({
          where: { orderId },
          update: {
            status,
            transactionId,
          },
          create: {
            orderId,
            amount,
            status,
            transactionId,
          },
        });

        const outboxMessage = this.outboxService.createMessage(
          eventType,
          {
            orderId,
            paymentId: payment.id,
            transactionId,
            amount,
            status,
          },
          { key: orderId, source: 'payment-service' }
        );

        await tx.outbox.create(outboxMessage as any);
      });

      this.logger.log(`Payment for order ${orderId} resolved with status: ${status}`);
    } catch (error) {
      this.logger.error(`Error processing payment for order ${orderId}: ${(error as Error).message}`);
    }
  }
}
