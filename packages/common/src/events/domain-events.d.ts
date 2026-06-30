/**
 * Strongly-typed domain event data payloads.
 * Each interface defines the shape of data for a specific event type.
 */
export interface UserRegisteredData {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}
export interface UserLoggedInData {
    userId: string;
    email: string;
    loginMethod: 'credentials' | 'google' | 'github';
    ipAddress: string;
    userAgent: string;
}
export interface UserProfileUpdatedData {
    userId: string;
    updatedFields: string[];
}
export interface ProductCreatedData {
    productId: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    sellerId: string;
    sku: string;
}
export interface ProductUpdatedData {
    productId: string;
    updatedFields: string[];
    previousValues: Record<string, unknown>;
    newValues: Record<string, unknown>;
}
export interface ProductDeletedData {
    productId: string;
    deletedBy: string;
}
export interface ProductViewedData {
    productId: string;
    userId: string | null;
    sessionId: string;
    referrer: string | null;
}
export interface InventoryReservedData {
    reservationId: string;
    orderId: string;
    items: Array<{
        productId: string;
        sku: string;
        quantity: number;
    }>;
    expiresAt: string;
}
export interface InventoryReleasedData {
    reservationId: string;
    orderId: string;
    reason: 'order_cancelled' | 'payment_failed' | 'reservation_expired';
}
export interface InventoryReservationFailedData {
    orderId: string;
    failedItems: Array<{
        productId: string;
        sku: string;
        requestedQuantity: number;
        availableQuantity: number;
    }>;
}
export interface LowStockAlertData {
    productId: string;
    sku: string;
    currentQuantity: number;
    threshold: number;
    warehouseId: string;
}
export interface OrderPlacedData {
    orderId: string;
    userId: string;
    items: Array<{
        productId: string;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }>;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    totalAmount: number;
    currency: string;
}
export interface OrderConfirmedData {
    orderId: string;
    userId: string;
    confirmedAt: string;
}
export interface OrderCancelledData {
    orderId: string;
    userId: string;
    reason: string;
    cancelledBy: 'user' | 'system' | 'admin';
}
export interface OrderCompletedData {
    orderId: string;
    userId: string;
    completedAt: string;
}
export interface PaymentInitiatedData {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
}
export interface PaymentCompletedData {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    transactionId: string;
    paidAt: string;
}
export interface PaymentFailedData {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    reason: string;
    attempt: number;
    maxAttempts: number;
}
export interface RefundProcessedData {
    refundId: string;
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    reason: string;
}
export interface ShipmentCreatedData {
    shipmentId: string;
    orderId: string;
    userId: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
}
export interface ShipmentDeliveredData {
    shipmentId: string;
    orderId: string;
    userId: string;
    deliveredAt: string;
    signature: string | null;
}
export interface ReviewCreatedData {
    reviewId: string;
    productId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
}
//# sourceMappingURL=domain-events.d.ts.map