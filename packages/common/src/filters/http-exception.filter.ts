import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * HTTP-specific exception filter for handling known HTTP exceptions
 * with proper status codes and messages.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const correlationId = (request.headers['x-correlation-id'] as string) || 'N/A';

    const exceptionResponse = exception.getResponse();
    let message: string;
    let details: Record<string, unknown> | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, unknown>;
      if (Array.isArray(resp.message)) {
        message = 'Validation failed';
        details = { validationErrors: resp.message };
      } else {
        message = (resp.message as string) || exception.message;
        details = resp.details as Record<string, unknown>;
      }
    } else {
      message = exception.message;
    }

    this.logger.warn(
      JSON.stringify({
        correlationId,
        statusCode: status,
        message,
        path: request.url,
        method: request.method,
      }),
    );

    const errorResponse = new ErrorResponseDto({
      statusCode: status,
      message,
      error: exception.name,
      details,
      path: request.url,
      correlationId,
    });

    response.status(status).json(errorResponse);
  }
}
