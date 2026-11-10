"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IOrder } from "@/app/types/Order";
import ProductCardCheckout from "@/app/(primary)/checkout/components/ProductCardCheckout";
import { dateConverter } from "@/app/utility/dateConverter";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import { getCookie } from "@/app/utility/handleCookie";
import CustomAlertDialouge from "../../../../../sharedComponents/CustomAlertDialouge";
import { Check, Clock, AlertCircle, Truck, CheckCircle2 } from "lucide-react";

const OrderDetails = ({ order }: { order: IOrder }) => {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(
    order?.orderStatus || "pending"
  );

  useEffect(() => {
    if (order?.orderStatus) {
      setCurrentStatus(order.orderStatus);
    }
  }, [order?.orderStatus]);

  if (!order) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-white p-8 text-center text-text-muted shadow-bento">
        No order data available
      </div>
    );
  }

  const { createdAt } = order;
  const convertedDate = dateConverter(createdAt);
  const orderSteps = ["pending", "processing", "on the way", "received"];

  const stepIndex = orderSteps.indexOf(currentStatus?.toLowerCase() || "pending");

  const handleOrderStatus = async (status: string) => {
    if (status === currentStatus || statusLoading) return;
    const previousStatus = currentStatus;

    // 1. Instant optimistic UI update
    setCurrentStatus(status);
    setStatusLoading(true);

    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/order/status/${order?._id}`,
        { orderStatus: status },
        {
          headers: jwt
            ? {
                Authorization: `Bearer ${jwt}`,
              }
            : {},
        }
      );

      if (response.status === 200) {
        toast.success(`Order status changed to "${status}"`);
        await handleRevalidation("orderInfo");
        await handleRevalidation("orderCollection");
        router.refresh();
      } else {
        // Revert on failure
        setCurrentStatus(previousStatus);
        toast.error("Failed to update status");
      }
    } catch (error: any) {
      // Revert on error
      setCurrentStatus(previousStatus);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status";
      toast.error(message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Timeline Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-6">
          Order Tracking Status
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
            {currentStatus}
          </span>
        </div>

        {/* Status Change Controls for Admin */}
        <div className="mt-6 pt-5 border-t border-border-subtle/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-3">
            Change Order Status
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {orderSteps.map((status) => {
              const isActive = currentStatus === status;
              return (
                <CustomAlertDialouge
                  key={status}
                  triggerText={status}
                  triggerClass={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                    statusLoading && "animate-pulse cursor-not-allowed opacity-60"
                  } ${
                    isActive
                      ? "bg-surface-forest text-white shadow-sm ring-2 ring-surface-forest/20"
                      : "border border-border-subtle bg-white text-text-body hover:bg-surface-bento hover:text-text-ink"
                  }`}
                  onConfirm={() => handleOrderStatus(status)}
                  alertDescription={`Are you sure you want to change order status to "${status}"?`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Items & Order Summary Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
        <div>
          <h3 className="text-base font-bold tracking-tight text-text-ink">
            Sponsored Items
          </h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {order.products.map((product) => (
              <ProductCardCheckout key={product?._id} product={product} />
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-xl border border-border-subtle bg-surface-bento/30 p-4 space-y-2.5">
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Subtotal</span>
            <span className="font-semibold text-text-ink">${order?.totalAmount}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Shipping & Logistics</span>
            <span className="font-semibold text-emerald-700">Free Sponsored</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-text-ink pt-2 border-t border-border-subtle">
            <span>Total Funding</span>
            <span className="text-base font-extrabold text-surface-forest">
              ${order?.totalAmount}
            </span>
          </div>
        </div>

        {/* Stakeholder Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle/80">
          {/* Donor Column */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/20 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Donor Information
            </h4>
            <div className="space-y-1.5 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Donor Name</span>
                <span className="font-medium text-text-ink">
                  {order?.name?.firstName} {order?.name?.lastName}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Contact</span>
                <span className="font-medium text-text-ink">{order?.contactNo || "--"}</span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Payment Frequency</span>
                <span className="font-medium text-text-ink">
                  {order?.payMonthly === "yes" || (order as any)?.payMonthly === true
                    ? "Monthly Recurring"
                    : "One-Time"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Order Placed</span>
                <span className="font-medium text-text-ink">{convertedDate}</span>
              </div>
            </div>
          </div>

          {/* School Recipient Column */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/20 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Recipient School
            </h4>
            <div className="space-y-1.5 text-sm">
              <div>
                <span className="text-xs text-text-muted block">School Name</span>
                <span className="font-medium text-text-ink">
                  {order?.schoolId?.name || "Target Institution"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Contact Phone</span>
                <span className="font-medium text-text-ink">
                  {order?.schoolId?.contactNo || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Delivery Address</span>
                <span className="font-medium text-text-ink">
                  {order?.schoolId?.address?.street || ""} {order?.schoolId?.address?.city || ""}{" "}
                  {order?.schoolId?.address?.zipCode ? `(${order.schoolId.address.zipCode})` : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
