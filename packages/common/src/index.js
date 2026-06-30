"use strict";
// ============================================================
// @ecommerce/common - Shared library for all microservices
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// --- DTOs ---
__exportStar(require("./dto/pagination.dto"), exports);
__exportStar(require("./dto/response-envelope.dto"), exports);
__exportStar(require("./dto/error-response.dto"), exports);
// --- Events ---
__exportStar(require("./events/event-types"), exports);
__exportStar(require("./events/event-payload.interface"), exports);
__exportStar(require("./events/domain-events"), exports);
// --- Decorators ---
__exportStar(require("./decorators/current-user.decorator"), exports);
__exportStar(require("./decorators/idempotency-key.decorator"), exports);
__exportStar(require("./decorators/roles.decorator"), exports);
__exportStar(require("./decorators/public.decorator"), exports);
// --- Guards ---
__exportStar(require("./guards/jwt-auth.guard"), exports);
__exportStar(require("./guards/roles.guard"), exports);
__exportStar(require("./guards/api-key.guard"), exports);
// --- Interceptors ---
__exportStar(require("./interceptors/transform.interceptor"), exports);
__exportStar(require("./interceptors/logging.interceptor"), exports);
__exportStar(require("./interceptors/timeout.interceptor"), exports);
// --- Filters ---
__exportStar(require("./filters/global-exception.filter"), exports);
__exportStar(require("./filters/http-exception.filter"), exports);
// --- Interfaces ---
__exportStar(require("./interfaces/authenticated-user.interface"), exports);
__exportStar(require("./interfaces/outbox-message.interface"), exports);
__exportStar(require("./interfaces/saga-step.interface"), exports);
__exportStar(require("./interfaces/service-health.interface"), exports);
// --- Utils ---
__exportStar(require("./utils/correlation-id"), exports);
__exportStar(require("./utils/hash"), exports);
__exportStar(require("./utils/idempotency"), exports);
// --- Constants ---
__exportStar(require("./constants/roles"), exports);
__exportStar(require("./constants/services"), exports);
__exportStar(require("./constants/kafka-topics"), exports);
//# sourceMappingURL=index.js.map