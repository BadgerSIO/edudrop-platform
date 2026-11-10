"use client";
import React from "react";
import { IOrder } from "@/app/types/Order";
import ProductCardCheckout from "@/app/(primary)/checkout/components/ProductCardCheckout";
import makePayment from "@/app/utility/makePayment";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Download, ShieldCheck } from "lucide-react";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";
import OrderTimeline from "@/app/sharedComponents/OrderTimeline";
import { generateOrderInvoice } from "@/app/utility/generateOrderInvoice";

const OrderDetails = ({ order }: { order: IOrder }) => {
  const router = useRouter();

  if (!order) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center text-text-muted shadow-bento">
        No order data available
      </div>
    );
  }

  const { orderStatus } = order;

  const handlePayment = async () => {
    try {
      const parameters = await makePayment(order);
      router.push(`/monthly-transaction?${parameters.toString()}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to process payment: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Banner / Action Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              order?.paymentStatus
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : "bg-amber-50 text-amber-700 border border-amber-200/80"
            }`}
          >
            {order?.paymentStatus ? (
              <ShieldCheck className="h-6 w-6" />
            ) : (
              <CreditCard className="h-6 w-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
              Payment Status
            </span>
            <span
              className={`text-base font-bold ${
                order?.paymentStatus ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {order?.paymentStatus ? "Completed (Paid)" : "Awaiting Payment"}
            </span>
          </div>
        </div>

        {order?.paymentStatus ? (
          <button
            type="button"
            onClick={() => generateOrderInvoice(order, { audience: "donor" })}
            className="inline-flex items-center gap-2 rounded-full bg-surface-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-surface-forest-light active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-brand-lime" />
            Download Invoice
          </button>
        ) : (
          <ActionPillButton onClick={handlePayment} variant="lime" size="sm">
            Complete Payment Now
          </ActionPillButton>
        )}
      </div>

      {/* Progress Timeline Card */}
      <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-6">
          Sponsorship Fulfillment Timeline
        </h3>

        <OrderTimeline currentStatus={orderStatus} />
      </div>

      {/* Items & Beneficiary Summary Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
        <div>
          <h3 className="text-base font-bold tracking-tight text-text-ink">
            Sponsored Materials
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.products.map((product) => (
              <ProductCardCheckout key={product?._id} product={product} />
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="rounded-xl border border-border-subtle bg-surface-bento/30 p-4 space-y-2.5">
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Sponsorship Subtotal</span>
            <span className="font-semibold text-text-ink">${order?.totalAmount}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Direct Delivery to Campus</span>
            <span className="font-semibold text-emerald-700">Included (Free)</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-text-ink pt-2 border-t border-border-subtle">
            <span>Total Sponsored</span>
            <span className="text-base font-extrabold text-surface-forest">
              ${order?.totalAmount}
            </span>
          </div>
        </div>

        {/* Beneficiary Campus Info */}
        <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/20 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Destination School
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-text-muted block">School Name</span>
              <span className="font-semibold text-text-ink">{order?.schoolId?.name}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Location</span>
              <span className="font-medium text-text-ink">{order?.schoolId?.address?.city || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Campus Contact</span>
              <span className="font-medium text-text-ink">{order?.schoolId?.contactNo || "--"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
