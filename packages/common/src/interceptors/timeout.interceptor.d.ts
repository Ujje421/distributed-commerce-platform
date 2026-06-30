import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * Timeout interceptor that enforces a maximum request processing time.
 * Default timeout is 30 seconds; configurable per-route via metadata.
 */
export declare class TimeoutInterceptor implements NestInterceptor {
    private readonly timeoutMs;
    constructor(timeoutMs?: number);
    intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
//# sourceMappingURL=timeout.interceptor.d.ts.map