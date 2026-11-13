"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOrderStatus = exports.CANONICAL_ORDER_STAGES = exports.orderSearchableFields = exports.orderFilterableFields = void 0;
exports.orderFilterableFields = [
    "searchTerms",
    "email",
    "orderId",
    "transactionId",
    "orderStatus",
    "paymentStatus",
    "payMonthly",
];
exports.orderSearchableFields = ["email", "orderId", "transactionId"];
exports.CANONICAL_ORDER_STAGES = [
    "pending",
    "processing",
    "on the way",
    "received",
];
/**
 * Maps legacy seed statuses (e.g. "delivered") and casing variations
 * into one of the four canonical OrderSchema fulfillment stages.
 */
const normalizeOrderStatus = (status) => {
    const normalized = String(status || "")
        .trim()
        .toLowerCase();
    if (normalized === "delivered" || normalized === "received") {
        return "received";
    }
    if (normalized === "on the way") {
        return "on the way";
    }
    if (normalized === "processing") {
        return "processing";
    }
    return "pending";
};
exports.normalizeOrderStatus = normalizeOrderStatus;
