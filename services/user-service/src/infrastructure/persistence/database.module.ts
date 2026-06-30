import { Module, Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserPrismaService extends PrismaClient {
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
      provide: 'PrismaService', // expected by OutboxModule
      useClass: UserPrismaService,
    },
    UserPrismaService,
  ],
  exports: ['PrismaService', UserPrismaService],
})
export class DatabaseModule {}
