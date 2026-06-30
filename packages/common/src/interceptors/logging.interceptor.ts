import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor that logs request/response details
 * with timing information and correlation IDs.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const correlationId = request.headers['x-correlation-id'] || 'N/A';
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const userId = request.user?.userId || 'anonymous';

    const startTime = Date.now();

    this.logger.log(
      JSON.stringify({
        type: 'REQUEST',
        correlationId,
        method,
        url,
        userId,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;

          this.logger.log(
            JSON.stringify({
              type: 'RESPONSE',
              correlationId,
              method,
              url,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              userId,
              timestamp: new Date().toISOString(),
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            JSON.stringify({
              type: 'ERROR',
              correlationId,
              method,
              url,
              statusCode: error.status || 500,
              duration: `${duration}ms`,
              userId,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }
}
