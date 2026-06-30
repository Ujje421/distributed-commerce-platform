"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
/**
 * Logging interceptor that logs request/response details
 * with timing information and correlation IDs.
 */
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip } = request;
        const correlationId = request.headers['x-correlation-id'] || 'N/A';
        const userAgent = request.headers['user-agent'] || 'Unknown';
        const userId = request.user?.userId || 'anonymous';
        const startTime = Date.now();
        this.logger.log(JSON.stringify({
            type: 'REQUEST',
            correlationId,
            method,
            url,
            userId,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        }));
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const response = context.switchToHttp().getResponse();
                const duration = Date.now() - startTime;
                this.logger.log(JSON.stringify({
                    type: 'RESPONSE',
                    correlationId,
                    method,
                    url,
                    statusCode: response.statusCode,
                    duration: `${duration}ms`,
                    userId,
                    timestamp: new Date().toISOString(),
                }));
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(JSON.stringify({
                    type: 'ERROR',
                    correlationId,
                    method,
                    url,
                    statusCode: error.status || 500,
                    duration: `${duration}ms`,
                    userId,
                    error: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString(),
                }));
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map