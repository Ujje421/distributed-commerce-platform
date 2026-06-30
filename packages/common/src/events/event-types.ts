/**
 * All Kafka event types used across the platform.
 * Each event type maps to a Kafka topic.
 */
export enum EventType {
  // Identity & User Events
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.logged_in',
  USER_PROFILE_UPDATED = 'user.profile_updated',
  PASSWORD_CHANGED = 'user.password_changed',

  // Product Events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_VIEWED = 'product.viewed',

  // Inventory Events
  INVENTORY_RESERVED = 'inventory.reserved',
  INVENTORY_RELEASED = 'inventory.released',
  INVENTORY_UPDATED = 'inventory.updated',
  LOW_STOCK_ALERT = 'inventory.low_stock_alert',
  INVENTORY_RESERVATION_FAILED = 'inventory.reservation_failed',

  // Cart Events
  CART_UPDATED = 'cart.updated',
  CART_CHECKOUT_INITIATED = 'cart.checkout_initiated',

  // Order Events
  ORDER_PLACED = 'order.placed',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_COMPLETED = 'order.completed',
  ORDER_REFUNDED = 'order.refunded',

  // Payment Events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_PROCESSED = 'payment.refund_processed',

  // Shipping Events
  SHIPMENT_CREATED = 'shipment.created',
  SHIPMENT_PICKED_UP = 'shipment.picked_up',
  SHIPMENT_IN_TRANSIT = 'shipment.in_transit',
  SHIPMENT_DELIVERED = 'shipment.delivered',

  // Review Events
  REVIEW_CREATED = 'review.created',
  REVIEW_UPDATED = 'review.updated',

  // Notification Events
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_FAILED = 'notification.failed',
}
