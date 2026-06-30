"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyKey = void 0;
const common_1 = require("@nestjs/common");
/**
 * Parameter decorator that extracts the idempotency key from request headers.
 * Usage: @IdempotencyKey() key: string
 *
 * Expects header: X-Idempotency-Key
 * Used to prevent duplicate processing of the same request.
 */
exports.IdempotencyKey = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const key = request.headers['x-idempotency-key'];
    if (!key && data?.required !== false) {
        throw new common_1.BadRequestException('X-Idempotency-Key header is required');
    }
    return key;
});
//# sourceMappingURL=idempotency-key.decorator.js.map