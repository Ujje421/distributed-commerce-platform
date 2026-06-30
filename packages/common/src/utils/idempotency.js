"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIdempotencyKey = generateIdempotencyKey;
exports.isValidIdempotencyKey = isValidIdempotencyKey;
exports.idempotencyRedisKey = idempotencyRedisKey;
const uuid_1 = require("uuid");
/**
 * Generates a new idempotency key.
 */
function generateIdempotencyKey() {
    return `idem_${(0, uuid_1.v4)()}`;
}
/**
 * Validates that an idempotency key has the correct format.
 */
function isValidIdempotencyKey(key) {
    // Accept UUID format with optional prefix
    const uuidRegex = /^(idem_)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
}
/**
 * Redis key format for idempotency deduplication.
 */
function idempotencyRedisKey(service, key) {
    return `idempotency:${service}:${key}`;
}
//# sourceMappingURL=idempotency.js.map