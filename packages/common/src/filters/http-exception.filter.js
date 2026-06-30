"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const error_response_dto_1 = require("../dto/error-response.dto");
/**
 * HTTP-specific exception filter for handling known HTTP exceptions
 * with proper status codes and messages.
 */
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger('HttpExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const correlationId = request.headers['x-correlation-id'] || 'N/A';
        const exceptionResponse = exception.getResponse();
        let message;
        let details;
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }
        else if (typeof exceptionResponse === 'object') {
            const resp = exceptionResponse;
            if (Array.isArray(resp.message)) {
                message = 'Validation failed';
                details = { validationErrors: resp.message };
            }
            else {
                message = resp.message || exception.message;
                details = resp.details;
            }
        }
        else {
            message = exception.message;
        }
        this.logger.warn(JSON.stringify({
            correlationId,
            statusCode: status,
            message,
            path: request.url,
            method: request.method,
        }));
        const errorResponse = new error_response_dto_1.ErrorResponseDto({
            statusCode: status,
            message,
            error: exception.name,
            details,
            path: request.url,
            correlationId,
        });
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map