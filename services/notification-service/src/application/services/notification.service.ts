import { Injectable, Logger } from '@nestjs/common';
import { NotificationPrismaService } from '../../infrastructure/persistence/database.module';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: NotificationPrismaService) {}

  async sendNotification(userId: string, type: string, payload: any) {
    this.logger.log(`Sending ${type} notification to user ${userId}`);

    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type,
          payload: payload || {},
          status: 'SENT',
        },
      });

      this.logger.log(`Notification ${type} successfully recorded for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}: ${(error as Error).message}`);
    }
  }
}
