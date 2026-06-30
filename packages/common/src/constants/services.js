"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPC_PORTS = exports.SERVICE_PORTS = exports.ServiceName = void 0;
/**
 * Service identifiers used across the platform for
 * inter-service communication, logging, and tracing.
 */
var ServiceName;
(function (ServiceName) {
    ServiceName["API_GATEWAY"] = "api-gateway";
    ServiceName["IDENTITY_SERVICE"] = "identity-service";
    ServiceName["USER_SERVICE"] = "user-service";
    ServiceName["PRODUCT_CATALOG_SERVICE"] = "product-catalog-service";
    ServiceName["INVENTORY_SERVICE"] = "inventory-service";
    ServiceName["CART_SERVICE"] = "cart-service";
    ServiceName["ORDER_SERVICE"] = "order-service";
    ServiceName["PAYMENT_SERVICE"] = "payment-service";
    ServiceName["SHIPPING_SERVICE"] = "shipping-service";
    ServiceName["NOTIFICATION_SERVICE"] = "notification-service";
    ServiceName["REVIEW_SERVICE"] = "review-service";
    ServiceName["RECOMMENDATION_SERVICE"] = "recommendation-service";
})(ServiceName || (exports.ServiceName = ServiceName = {}));
/**
 * Default service ports for local development.
 */
exports.SERVICE_PORTS = {
    [ServiceName.API_GATEWAY]: 3000,
    [ServiceName.IDENTITY_SERVICE]: 3001,
    [ServiceName.USER_SERVICE]: 3002,
    [ServiceName.PRODUCT_CATALOG_SERVICE]: 3003,
    [ServiceName.INVENTORY_SERVICE]: 3004,
    [ServiceName.CART_SERVICE]: 3005,
    [ServiceName.ORDER_SERVICE]: 3006,
    [ServiceName.PAYMENT_SERVICE]: 3007,
    [ServiceName.SHIPPING_SERVICE]: 3008,
    [ServiceName.NOTIFICATION_SERVICE]: 3009,
    [ServiceName.REVIEW_SERVICE]: 3010,
    [ServiceName.RECOMMENDATION_SERVICE]: 8000,
};
/**
 * gRPC service ports for inter-service communication.
 */
exports.GRPC_PORTS = {
    [ServiceName.IDENTITY_SERVICE]: 50051,
    [ServiceName.INVENTORY_SERVICE]: 50052,
    [ServiceName.PAYMENT_SERVICE]: 50053,
    [ServiceName.RECOMMENDATION_SERVICE]: 50054,
    [ServiceName.PRODUCT_CATALOG_SERVICE]: 50055,
};
//# sourceMappingURL=services.js.map