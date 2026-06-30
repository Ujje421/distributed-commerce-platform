"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSUMER_GROUPS = exports.DLQ_SUFFIX = exports.KAFKA_TOPICS = void 0;
exports.getDlqTopic = getDlqTopic;
const event_types_1 = require("../events/event-types");
/**
 * Kafka topic names mapped from event types.
 * Each event type has a dedicated topic for clear routing.
 */
exports.KAFKA_TOPICS = {
    // Identity & User
    [event_types_1.EventType.USER_REGISTERED]: 'ecommerce.user.registered',
    [event_types_1.EventType.USER_LOGGED_IN]: 'ecommerce.user.logged-in',
    [event_types_1.EventType.USER_PROFILE_UPDATED]: 'ecommerce.user.profile-updated',
    [event_types_1.EventType.PASSWORD_CHANGED]: 'ecommerce.user.password-changed',
    // Product
    [event_types_1.EventType.PRODUCT_CREATED]: 'ecommerce.product.created',
    [event_types_1.EventType.PRODUCT_UPDATED]: 'ecommerce.product.updated',
    [event_types_1.EventType.PRODUCT_DELETED]: 'ecommerce.product.deleted',
    [event_types_1.EventType.PRODUCT_VIEWED]: 'ecommerce.product.viewed',
    // Inventory
    [event_types_1.EventType.INVENTORY_RESERVED]: 'ecommerce.inventory.reserved',
    [event_types_1.EventType.INVENTORY_RELEASED]: 'ecommerce.inventory.released',
    [event_types_1.EventType.INVENTORY_UPDATED]: 'ecommerce.inventory.updated',
    [event_types_1.EventType.LOW_STOCK_ALERT]: 'ecommerce.inventory.low-stock-alert',
    [event_types_1.EventType.INVENTORY_RESERVATION_FAILED]: 'ecommerce.inventory.reservation-failed',
    // Cart
    [event_types_1.EventType.CART_UPDATED]: 'ecommerce.cart.updated',
    [event_types_1.EventType.CART_CHECKOUT_INITIATED]: 'ecommerce.cart.checkout-initiated',
    // Order
    [event_types_1.EventType.ORDER_PLACED]: 'ecommerce.order.placed',
    [event_types_1.EventType.ORDER_CONFIRMED]: 'ecommerce.order.confirmed',
    [event_types_1.EventType.ORDER_CANCELLED]: 'ecommerce.order.cancelled',
    [event_types_1.EventType.ORDER_COMPLETED]: 'ecommerce.order.completed',
    [event_types_1.EventType.ORDER_REFUNDED]: 'ecommerce.order.refunded',
    // Payment
    [event_types_1.EventType.PAYMENT_INITIATED]: 'ecommerce.payment.initiated',
    [event_types_1.EventType.PAYMENT_COMPLETED]: 'ecommerce.payment.completed',
    [event_types_1.EventType.PAYMENT_FAILED]: 'ecommerce.payment.failed',
    [event_types_1.EventType.REFUND_PROCESSED]: 'ecommerce.payment.refund-processed',
    // Shipping
    [event_types_1.EventType.SHIPMENT_CREATED]: 'ecommerce.shipment.created',
    [event_types_1.EventType.SHIPMENT_PICKED_UP]: 'ecommerce.shipment.picked-up',
    [event_types_1.EventType.SHIPMENT_IN_TRANSIT]: 'ecommerce.shipment.in-transit',
    [event_types_1.EventType.SHIPMENT_DELIVERED]: 'ecommerce.shipment.delivered',
    // Review
    [event_types_1.EventType.REVIEW_CREATED]: 'ecommerce.review.created',
    [event_types_1.EventType.REVIEW_UPDATED]: 'ecommerce.review.updated',
    // Notification
    [event_types_1.EventType.NOTIFICATION_SENT]: 'ecommerce.notification.sent',
    [event_types_1.EventType.NOTIFICATION_FAILED]: 'ecommerce.notification.failed',
};
/**
 * Dead Letter Queue topic suffix.
 */
exports.DLQ_SUFFIX = '.dlq';
/**
 * Get the DLQ topic name for a given topic.
 */
function getDlqTopic(topic) {
    return `${topic}${exports.DLQ_SUFFIX}`;
}
/**
 * Consumer group IDs for each service.
 */
exports.CONSUMER_GROUPS = {
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
//# sourceMappingURL=kafka-topics.js.map