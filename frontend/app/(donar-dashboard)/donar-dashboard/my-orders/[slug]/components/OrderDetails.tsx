"use client";
import React from "react";
import { IOrder } from "@/app/types/Order";
import ProductCardCheckout from "@/app/(primary)/checkout/components/ProductCardCheckout";
import makePayment from "@/app/utility/makePayment";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";

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
  const orderSteps = ["pending", "processing", "on the way", "received"];
  const stepIndex = orderSteps.indexOf(orderStatus?.toLowerCase() || "pending");

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

        {!order?.paymentStatus && (
          <ActionPillButton onClick={handlePayment} variant="lime" size="sm">
            Complete Payment Now
          </ActionPillButton>
        )}
      </div>

      {/* Progress Timeline Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-6">
          Sponsorship Fulfillment Timeline
        </h3>

        {/* Desktop / Tablet Timeline */}
        <div className="hidden sm:block px-2">
          <div className="flex items-start w-full">
            {orderSteps.map((step, idx) => {
              const isPassed = idx <= stepIndex;
              const isCurrent = idx === stepIndex;
              const isLast = idx === orderSteps.length - 1;

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center flex-shrink-0 min-w-[72px]">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCurrent
                          ? "border-surface-forest bg-surface-forest text-white ring-4 ring-surface-forest/15 shadow-sm"
                          : isPassed
                          ? "border-surface-forest bg-surface-forest text-white shadow-sm"
                          : "border-border-subtle bg-white text-text-muted"
                      }`}
                    >
                      {isPassed ? (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <span className="text-xs font-semibold">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2.5 text-xs font-semibold capitalize whitespace-nowrap transition-colors duration-200 ${
                        isCurrent
                          ? "text-surface-forest font-bold"
                          : isPassed
                          ? "text-text-ink"
                          : "text-text-muted"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {!isLast && (
                    <div className="flex-1 h-1 bg-surface-bento mt-4 mx-2 sm:mx-3 rounded-full overflow-hidden self-start">
                      <div
                        className={`h-full bg-surface-forest transition-all duration-500 rounded-full ${
                          idx < stepIndex ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile Status Badge */}
        <div className="sm:hidden flex items-center justify-between py-1">
          <span className="text-sm font-medium text-text-body">Current State:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-forest/20 bg-surface-forest/10 px-3 py-1 text-xs font-semibold text-surface-forest capitalize">
            <span className="h-1.5 w-1.5 rounded-full bg-surface-forest animate-pulse" />
            {orderStatus}
          </span>
        </div>
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
