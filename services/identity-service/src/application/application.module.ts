import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterCommandHandler } from './commands/register.handler';

const CommandHandlers = [RegisterCommandHandler];
const QueryHandlers: any[] = [];

@Module({
  imports: [CqrsModule],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ApplicationModule {}
