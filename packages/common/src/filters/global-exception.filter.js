"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_response_dto_1 = require("../dto/error-response.dto");
/**
 * Global exception filter that catches all unhandled exceptions
 * and formats them into a consistent error response.
 */
let GlobalExceptionFilter = class GlobalExceptionFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.headers['x-correlation-id'] || 'N/A';
        let status;
        let message;
        let error;
        let details;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            }
            else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse;
                message = resp.message || exception.message;
                error = resp.error || exception.name;
                details = resp.details;
                // Handle class-validator errors (array of messages)
                if (Array.isArray(resp.message)) {
                    message = 'Validation failed';
                    details = { validationErrors: resp.message };
                }
            }
            else {
                message = exception.message;
                error = exception.name;
            }
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = exception.name;
            // Log full error details but don't expose to client
            this.logger.error(JSON.stringify({
                correlationId,
                error: exception.message,
                stack: exception.stack,
                path: request.url,
                method: request.method,
            }));
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred';
            error = 'InternalServerError';
            this.logger.error(JSON.stringify({
                correlationId,
                error: 'Unknown exception type',
                exception: String(exception),
                path: request.url,
                method: request.method,
            }));
        }
        const errorResponse = new error_response_dto_1.ErrorResponseDto({
            statusCode: status,
            message,
            error,
            details,
            path: request.url,
            correlationId,
        });
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map