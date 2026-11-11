"use client";

import React, { useState } from "react";
import { Check, Copy, Hash, Calendar, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/types/Order";
import { dateConverter } from "@/app/utility/dateConverter";
import type { InvoiceAudience } from "@/app/utility/generateOrderInvoice";

interface OrderReferenceHeaderProps {
  order: IOrder;
  audience: InvoiceAudience;
}

export const OrderReferenceHeader = ({
  order,
  audience,
}: OrderReferenceHeaderProps) => {
  const [copiedField, setCopiedField] = useState<"orderId" | "tx" | null>(null);

  const displayOrderId =
    order?.orderId ||
    (order?._id ? `ORD-${order._id.slice(-8).toUpperCase()}` : "N/A");
  const isMonthly =
    order?.payMonthly === "yes" || (order as any)?.payMonthly === true;

  const handleCopy = async (value: string, field: "orderId" | "tx") => {
    if (!value || value === "N/A") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(
        field === "orderId"
          ? `Order ID ${value} copied`
          : "Transaction reference copied"
      );
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  return (
    <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <Hash className="h-3.5 w-3.5 text-surface-forest" />
              Order Reference
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-bento px-2.5 py-0.5 text-[11px] font-semibold text-surface-forest">
              {isMonthly ? "Monthly Recurring" : "One-Time Sponsorship"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-mono text-lg sm:text-xl font-extrabold tracking-tight text-text-ink">
              {displayOrderId}
            </h2>
            <button
              type="button"
              onClick={() => handleCopy(displayOrderId, "orderId")}
              aria-label={`Copy Order ID ${displayOrderId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-bento/60 px-2.5 py-1 text-xs font-semibold text-text-ink transition-colors hover:bg-surface-bento hover:border-surface-forest/30 cursor-pointer"
            >
              {copiedField === "orderId" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-surface-forest" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {order?.createdAt && (
            <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 px-3.5 py-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <Calendar className="h-3 w-3 text-surface-forest" />
                Placed On
              </span>
              <span className="mt-0.5 block font-semibold text-text-ink">
                {dateConverter(order.createdAt)}
              </span>
            </div>
          )}

          {audience !== "bursar" && order?.transactionId && (
            <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 px-3.5 py-2 max-w-[260px]">
              <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <ReceiptText className="h-3 w-3 text-surface-forest" />
                Transaction Ref
              </span>
              <button
                type="button"
                onClick={() => handleCopy(order.transactionId!, "tx")}
                title={order.transactionId}
                className="mt-0.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-text-ink hover:text-surface-forest truncate max-w-full cursor-pointer"
              >
                <span className="truncate">{order.transactionId}</span>
                {copiedField === "tx" ? (
                  <Check className="h-3 w-3 shrink-0 text-emerald-700" />
                ) : (
                  <Copy className="h-3 w-3 shrink-0 text-text-muted" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderReferenceHeader;
