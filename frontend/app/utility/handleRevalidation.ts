"use server";

import { revalidateTag } from "next/cache";

export const handleRevalidation = async (tag: string) => {
  revalidateTag(tag, "default");
};

/**
 * Revalidates order tables and analytics summaries across Admin, Bursar, and Donor dashboards.
 */
export const revalidateOrderTags = async () => {
  for (const tag of [
    "orderInfo",
    "orderCollection",
    "getCounts",
    "bursarSummary",
    "donarSummary",
  ]) {
    revalidateTag(tag, "default");
  }
};
