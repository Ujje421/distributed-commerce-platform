import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
/**
 * HTTP-specific exception filter for handling known HTTP exceptions
 * with proper status codes and messages.
 */
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: HttpException, host: ArgumentsHost): void;
}
//# sourceMappingURL=http-exception.filter.d.ts.map