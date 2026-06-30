/**
 * All Kafka event types used across the platform.
 * Each event type maps to a Kafka topic.
 */
export declare enum EventType {
    USER_REGISTERED = "user.registered",
    USER_LOGGED_IN = "user.logged_in",
    USER_PROFILE_UPDATED = "user.profile_updated",
    PASSWORD_CHANGED = "user.password_changed",
    PRODUCT_CREATED = "product.created",
    PRODUCT_UPDATED = "product.updated",
    PRODUCT_DELETED = "product.deleted",
    PRODUCT_VIEWED = "product.viewed",
    INVENTORY_RESERVED = "inventory.reserved",
    INVENTORY_RELEASED = "inventory.released",
    INVENTORY_UPDATED = "inventory.updated",
    LOW_STOCK_ALERT = "inventory.low_stock_alert",
    INVENTORY_RESERVATION_FAILED = "inventory.reservation_failed",
    CART_UPDATED = "cart.updated",
    CART_CHECKOUT_INITIATED = "cart.checkout_initiated",
    ORDER_PLACED = "order.placed",
    ORDER_CONFIRMED = "order.confirmed",
    ORDER_CANCELLED = "order.cancelled",
    ORDER_COMPLETED = "order.completed",
    ORDER_REFUNDED = "order.refunded",
    PAYMENT_INITIATED = "payment.initiated",
    PAYMENT_COMPLETED = "payment.completed",
    PAYMENT_FAILED = "payment.failed",
    REFUND_PROCESSED = "payment.refund_processed",
    SHIPMENT_CREATED = "shipment.created",
    SHIPMENT_PICKED_UP = "shipment.picked_up",
    SHIPMENT_IN_TRANSIT = "shipment.in_transit",
    SHIPMENT_DELIVERED = "shipment.delivered",
    REVIEW_CREATED = "review.created",
    REVIEW_UPDATED = "review.updated",
    NOTIFICATION_SENT = "notification.sent",
    NOTIFICATION_FAILED = "notification.failed"
}
//# sourceMappingURL=event-types.d.ts.map