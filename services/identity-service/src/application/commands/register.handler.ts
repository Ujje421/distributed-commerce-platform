import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterCommand } from './register.command';
import { User } from '../../domain/entities/user.entity';
import { IdentityPrismaService } from '../../infrastructure/persistence/database.module';
import { OutboxService } from '@ecommerce/kafka';
import { EventType, UserRegisteredData } from '@ecommerce/common';

@CommandHandler(RegisterCommand)
@Injectable()
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject('PrismaService') private readonly prisma: IdentityPrismaService,
    private readonly outboxService: OutboxService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RegisterCommand): Promise<{ userId: string }> {
    const { email, password, firstName, lastName } = command;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    // Create the domain entity
    const user = this.publisher.mergeObjectContext(
      User.register(userId, email, passwordHash, firstName, lastName),
    );

    // Prepare Kafka event data
    const eventData: UserRegisteredData = {
      userId,
      email,
      firstName,
      lastName,
      roles: user.roles,
    };

    // Execute in a single transaction (Outbox Pattern)
    await this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          passwordHash,
          firstName,
          lastName,
          roles: user.roles,
          status: user.status,
          mfaEnabled: user.mfaEnabled,
          loginMethods: ['CREDENTIALS'],
        },
      });

      await tx.outbox.create(
        this.outboxService.createMessage(EventType.USER_REGISTERED, eventData, {
          key: userId,
        })
      );
    });

    user.commit();

    return { userId };
  }
}
