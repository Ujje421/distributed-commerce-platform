import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '../infrastructure/auth/auth.module';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [AuthController],
})
export class PresentationModule {}
