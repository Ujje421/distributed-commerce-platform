import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Global exception filter that catches all unhandled exceptions
 * and formats them into a consistent error response.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request.headers['x-correlation-id'] as string) || 'N/A';

    let status: number;
    let message: string;
    let error: string;
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || exception.message;
        error = (resp.error as string) || exception.name;
        details = resp.details as Record<string, unknown>;

        // Handle class-validator errors (array of messages)
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = { validationErrors: resp.message };
        }
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = exception.name;

      // Log full error details but don't expose to client
      this.logger.error(
        JSON.stringify({
          correlationId,
          error: exception.message,
          stack: exception.stack,
          path: request.url,
          method: request.method,
        }),
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'InternalServerError';

      this.logger.error(
        JSON.stringify({
          correlationId,
          error: 'Unknown exception type',
          exception: String(exception),
          path: request.url,
          method: request.method,
        }),
      );
    }

    const errorResponse = new ErrorResponseDto({
      statusCode: status,
      message,
      error,
      details,
      path: request.url,
      correlationId,
    });

    response.status(status).json(errorResponse);
  }
}
