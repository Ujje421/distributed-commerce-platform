import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ResponseEnvelope } from '../dto/response-envelope.dto';
/**
 * Transform interceptor that wraps all successful responses
 * in a standardized ResponseEnvelope format.
 */
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>>;
}
//# sourceMappingURL=transform.interceptor.d.ts.map