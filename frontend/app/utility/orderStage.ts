import { CanonicalOrderStage } from "@/app/types/Analytics";

export const CANONICAL_ORDER_STAGES: CanonicalOrderStage[] = [
  "pending",
  "processing",
  "on the way",
  "received",
];

/**
 * Normalizes legacy order statuses (such as "delivered" in historical records)
 * into the four canonical EduDrop fulfillment stages.
 */
export function normalizeFulfillmentStage(
  status?: string | null
): CanonicalOrderStage {
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
}

export function getStageLabel(stage: CanonicalOrderStage): string {
  switch (stage) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "on the way":
      return "On the Way";
    case "received":
      return "Received";
  }
}

export function formatUsd(amount?: number | null): string {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
