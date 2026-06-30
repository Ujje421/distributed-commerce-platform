import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
  ],
  providers: [ProxyMiddleware, JwtAuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT Authentication followed by dynamic Route Proxying
    consumer
      .apply(JwtAuthMiddleware, ProxyMiddleware)
      .forRoutes('/api/v1/*');
  }
}
