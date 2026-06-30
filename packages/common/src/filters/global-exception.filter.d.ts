import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
/**
 * Global exception filter that catches all unhandled exceptions
 * and formats them into a consistent error response.
 */
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
//# sourceMappingURL=global-exception.filter.d.ts.map