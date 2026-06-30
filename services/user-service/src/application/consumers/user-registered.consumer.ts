import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '@ecommerce/kafka';
import { EventType, UserRegisteredData } from '@ecommerce/common';
import { UserPrismaService } from '../../infrastructure/persistence/database.module';

@Injectable()
export class UserRegisteredConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserRegisteredConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly prisma: UserPrismaService,
  ) {}

  onModuleInit() {
    // Register subscription on startup
    this.kafkaService.on(EventType.USER_REGISTERED, async (payload) => {
      const data = payload.data as UserRegisteredData;
      this.logger.log(`Processing USER_REGISTERED event for user: ${data.email}`);

      try {
        await this.prisma.userProfile.upsert({
          where: { id: data.userId },
          update: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          },
          create: {
            id: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            preferences: {},
          },
        });
        this.logger.log(`Successfully created/updated profile for user ${data.userId}`);
      } catch (error) {
        this.logger.error(
          `Failed to process USER_REGISTERED event: ${(error as Error).message}`,
          (error as Error).stack,
        );
        // Throwing error allows the DLQ / retry mechanism of the consumer to handle it
        throw error;
      }
    });
  }
}
