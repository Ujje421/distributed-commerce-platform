import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyMiddleware } from './middleware/proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
  ],
  providers: [ProxyMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply proxy middleware to all routes starting with /api/v1
    consumer
      .apply(ProxyMiddleware)
      .forRoutes('/api/v1/*');
  }
}
