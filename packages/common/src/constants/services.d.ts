/**
 * Service identifiers used across the platform for
 * inter-service communication, logging, and tracing.
 */
export declare enum ServiceName {
    API_GATEWAY = "api-gateway",
    IDENTITY_SERVICE = "identity-service",
    USER_SERVICE = "user-service",
    PRODUCT_CATALOG_SERVICE = "product-catalog-service",
    INVENTORY_SERVICE = "inventory-service",
    CART_SERVICE = "cart-service",
    ORDER_SERVICE = "order-service",
    PAYMENT_SERVICE = "payment-service",
    SHIPPING_SERVICE = "shipping-service",
    NOTIFICATION_SERVICE = "notification-service",
    REVIEW_SERVICE = "review-service",
    RECOMMENDATION_SERVICE = "recommendation-service"
}
/**
 * Default service ports for local development.
 */
export declare const SERVICE_PORTS: Record<ServiceName, number>;
/**
 * gRPC service ports for inter-service communication.
 */
export declare const GRPC_PORTS: Record<string, number>;
//# sourceMappingURL=services.d.ts.map