"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCorrelationId = generateCorrelationId;
exports.getOrCreateCorrelationId = getOrCreateCorrelationId;
const uuid_1 = require("uuid");
/**
 * Generates a correlation ID or extracts one from the request headers.
 * Correlation IDs are used to trace requests across microservices.
 */
function generateCorrelationId() {
    return (0, uuid_1.v4)();
}
/**
 * Extracts the correlation ID from headers, or generates a new one.
 */
function getOrCreateCorrelationId(headers) {
    const existing = headers['x-correlation-id'];
    if (typeof existing === 'string' && existing.length > 0) {
        return existing;
    }
    return generateCorrelationId();
}
//# sourceMappingURL=correlation-id.js.map