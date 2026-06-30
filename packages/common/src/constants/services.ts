/**
 * Service identifiers used across the platform for
 * inter-service communication, logging, and tracing.
 */
export enum ServiceName {
  API_GATEWAY = 'api-gateway',
  IDENTITY_SERVICE = 'identity-service',
  USER_SERVICE = 'user-service',
  PRODUCT_CATALOG_SERVICE = 'product-catalog-service',
  INVENTORY_SERVICE = 'inventory-service',
  CART_SERVICE = 'cart-service',
  ORDER_SERVICE = 'order-service',
  PAYMENT_SERVICE = 'payment-service',
  SHIPPING_SERVICE = 'shipping-service',
  NOTIFICATION_SERVICE = 'notification-service',
  REVIEW_SERVICE = 'review-service',
  RECOMMENDATION_SERVICE = 'recommendation-service',
}

/**
 * Default service ports for local development.
 */
export const SERVICE_PORTS: Record<ServiceName, number> = {
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
export const GRPC_PORTS: Record<string, number> = {
  [ServiceName.IDENTITY_SERVICE]: 50051,
  [ServiceName.INVENTORY_SERVICE]: 50052,
  [ServiceName.PAYMENT_SERVICE]: 50053,
  [ServiceName.RECOMMENDATION_SERVICE]: 50054,
  [ServiceName.PRODUCT_CATALOG_SERVICE]: 50055,
};
