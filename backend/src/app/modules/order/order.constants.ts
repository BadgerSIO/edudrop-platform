export const orderFilterableFields = [
  "searchTerms",
  "email",
  "orderId",
  "transactionId",
  "orderStatus",
  "paymentStatus",
  "payMonthly",
];
export const orderSearchableFields = ["email", "orderId", "transactionId"];

export const CANONICAL_ORDER_STAGES = [
  "pending",
  "processing",
  "on the way",
  "received",
] as const;

export type CanonicalOrderStage = (typeof CANONICAL_ORDER_STAGES)[number];

/**
 * Maps legacy seed statuses (e.g. "delivered") and casing variations
 * into one of the four canonical OrderSchema fulfillment stages.
 */
export const normalizeOrderStatus = (
  status?: string | null
): CanonicalOrderStage => {
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
