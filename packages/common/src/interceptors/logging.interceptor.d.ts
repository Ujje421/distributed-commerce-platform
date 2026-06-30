import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * Logging interceptor that logs request/response details
 * with timing information and correlation IDs.
 */
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
//# sourceMappingURL=logging.interceptor.d.ts.map