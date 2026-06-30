import { EventType } from '../events/event-types';

/**
 * Kafka topic names mapped from event types.
 * Each event type has a dedicated topic for clear routing.
 */
export const KAFKA_TOPICS: Record<EventType, string> = {
  // Identity & User
  [EventType.USER_REGISTERED]: 'ecommerce.user.registered',
  [EventType.USER_LOGGED_IN]: 'ecommerce.user.logged-in',
  [EventType.USER_PROFILE_UPDATED]: 'ecommerce.user.profile-updated',
  [EventType.PASSWORD_CHANGED]: 'ecommerce.user.password-changed',

  // Product
  [EventType.PRODUCT_CREATED]: 'ecommerce.product.created',
  [EventType.PRODUCT_UPDATED]: 'ecommerce.product.updated',
  [EventType.PRODUCT_DELETED]: 'ecommerce.product.deleted',
  [EventType.PRODUCT_VIEWED]: 'ecommerce.product.viewed',

  // Inventory
  [EventType.INVENTORY_RESERVED]: 'ecommerce.inventory.reserved',
  [EventType.INVENTORY_RELEASED]: 'ecommerce.inventory.released',
  [EventType.INVENTORY_UPDATED]: 'ecommerce.inventory.updated',
  [EventType.LOW_STOCK_ALERT]: 'ecommerce.inventory.low-stock-alert',
  [EventType.INVENTORY_RESERVATION_FAILED]: 'ecommerce.inventory.reservation-failed',

  // Cart
  [EventType.CART_UPDATED]: 'ecommerce.cart.updated',
  [EventType.CART_CHECKOUT_INITIATED]: 'ecommerce.cart.checkout-initiated',

  // Order
  [EventType.ORDER_PLACED]: 'ecommerce.order.placed',
  [EventType.ORDER_CONFIRMED]: 'ecommerce.order.confirmed',
  [EventType.ORDER_CANCELLED]: 'ecommerce.order.cancelled',
  [EventType.ORDER_COMPLETED]: 'ecommerce.order.completed',
  [EventType.ORDER_REFUNDED]: 'ecommerce.order.refunded',

  // Payment
  [EventType.PAYMENT_INITIATED]: 'ecommerce.payment.initiated',
  [EventType.PAYMENT_COMPLETED]: 'ecommerce.payment.completed',
  [EventType.PAYMENT_FAILED]: 'ecommerce.payment.failed',
  [EventType.REFUND_PROCESSED]: 'ecommerce.payment.refund-processed',

  // Shipping
  [EventType.SHIPMENT_CREATED]: 'ecommerce.shipment.created',
  [EventType.SHIPMENT_PICKED_UP]: 'ecommerce.shipment.picked-up',
  [EventType.SHIPMENT_IN_TRANSIT]: 'ecommerce.shipment.in-transit',
  [EventType.SHIPMENT_DELIVERED]: 'ecommerce.shipment.delivered',

  // Review
  [EventType.REVIEW_CREATED]: 'ecommerce.review.created',
  [EventType.REVIEW_UPDATED]: 'ecommerce.review.updated',

  // Notification
  [EventType.NOTIFICATION_SENT]: 'ecommerce.notification.sent',
  [EventType.NOTIFICATION_FAILED]: 'ecommerce.notification.failed',
};

/**
 * Dead Letter Queue topic suffix.
 */
export const DLQ_SUFFIX = '.dlq';

/**
 * Get the DLQ topic name for a given topic.
 */
export function getDlqTopic(topic: string): string {
  return `${topic}${DLQ_SUFFIX}`;
}

/**
 * Consumer group IDs for each service.
 */
export const CONSUMER_GROUPS = {
  IDENTITY: 'ecommerce-identity-group',
  USER: 'ecommerce-user-group',
  PRODUCT: 'ecommerce-product-group',
  INVENTORY: 'ecommerce-inventory-group',
  CART: 'ecommerce-cart-group',
  ORDER: 'ecommerce-order-group',
  PAYMENT: 'ecommerce-payment-group',
  SHIPPING: 'ecommerce-shipping-group',
  NOTIFICATION: 'ecommerce-notification-group',
  REVIEW: 'ecommerce-review-group',
  RECOMMENDATION: 'ecommerce-recommendation-group',
};
