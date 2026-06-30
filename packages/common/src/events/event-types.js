"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
/**
 * All Kafka event types used across the platform.
 * Each event type maps to a Kafka topic.
 */
var EventType;
(function (EventType) {
    // Identity & User Events
    EventType["USER_REGISTERED"] = "user.registered";
    EventType["USER_LOGGED_IN"] = "user.logged_in";
    EventType["USER_PROFILE_UPDATED"] = "user.profile_updated";
    EventType["PASSWORD_CHANGED"] = "user.password_changed";
    // Product Events
    EventType["PRODUCT_CREATED"] = "product.created";
    EventType["PRODUCT_UPDATED"] = "product.updated";
    EventType["PRODUCT_DELETED"] = "product.deleted";
    EventType["PRODUCT_VIEWED"] = "product.viewed";
    // Inventory Events
    EventType["INVENTORY_RESERVED"] = "inventory.reserved";
    EventType["INVENTORY_RELEASED"] = "inventory.released";
    EventType["INVENTORY_UPDATED"] = "inventory.updated";
    EventType["LOW_STOCK_ALERT"] = "inventory.low_stock_alert";
    EventType["INVENTORY_RESERVATION_FAILED"] = "inventory.reservation_failed";
    // Cart Events
    EventType["CART_UPDATED"] = "cart.updated";
    EventType["CART_CHECKOUT_INITIATED"] = "cart.checkout_initiated";
    // Order Events
    EventType["ORDER_PLACED"] = "order.placed";
    EventType["ORDER_CONFIRMED"] = "order.confirmed";
    EventType["ORDER_CANCELLED"] = "order.cancelled";
    EventType["ORDER_COMPLETED"] = "order.completed";
    EventType["ORDER_REFUNDED"] = "order.refunded";
    // Payment Events
    EventType["PAYMENT_INITIATED"] = "payment.initiated";
    EventType["PAYMENT_COMPLETED"] = "payment.completed";
    EventType["PAYMENT_FAILED"] = "payment.failed";
    EventType["REFUND_PROCESSED"] = "payment.refund_processed";
    // Shipping Events
    EventType["SHIPMENT_CREATED"] = "shipment.created";
    EventType["SHIPMENT_PICKED_UP"] = "shipment.picked_up";
    EventType["SHIPMENT_IN_TRANSIT"] = "shipment.in_transit";
    EventType["SHIPMENT_DELIVERED"] = "shipment.delivered";
    // Review Events
    EventType["REVIEW_CREATED"] = "review.created";
    EventType["REVIEW_UPDATED"] = "review.updated";
    // Notification Events
    EventType["NOTIFICATION_SENT"] = "notification.sent";
    EventType["NOTIFICATION_FAILED"] = "notification.failed";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=event-types.js.map