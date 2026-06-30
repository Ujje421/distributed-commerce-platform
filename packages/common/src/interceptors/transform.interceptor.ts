import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseEnvelope } from '../dto/response-envelope.dto';

/**
 * Transform interceptor that wraps all successful responses
 * in a standardized ResponseEnvelope format.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'];

    return next.handle().pipe(
      map((data) => {
        // If the response is already a ResponseEnvelope, return as-is
        if (data instanceof ResponseEnvelope) {
          return data;
        }

        return ResponseEnvelope.ok(data, correlationId);
      }),
    );
  }
}
