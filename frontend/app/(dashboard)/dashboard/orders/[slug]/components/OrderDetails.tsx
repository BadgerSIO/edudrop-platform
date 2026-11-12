"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IOrder } from "@/app/types/Order";
import ProductCardCheckout from "@/app/(primary)/checkout/components/ProductCardCheckout";
import { dateConverter } from "@/app/utility/dateConverter";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
import { revalidateOrderTags } from "@/app/utility/handleRevalidation";
import { getCookie } from "@/app/utility/handleCookie";
import CustomAlertDialouge from "../../../../../sharedComponents/CustomAlertDialouge";
import OrderTimeline from "@/app/sharedComponents/OrderTimeline";
import OrderReferenceHeader from "@/app/sharedComponents/OrderReferenceHeader";
import { Download, Loader2 } from "lucide-react";
import { generateOrderInvoice } from "@/app/utility/generateOrderInvoice";

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

  const handleOrderStatus = async (status: string) => {
    if (status === currentStatus || statusLoading) return;
    const previousStatus = currentStatus;

    // 1. Instant optimistic UI update
    setCurrentStatus(status);
    setStatusLoading(true);

    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/order/status/${order?.orderId || order?._id}`,
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
        await revalidateOrderTags();
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
      <OrderReferenceHeader order={order} audience="admin" />

      {/* Progress Timeline Card */}
      <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Order Tracking Status
          </h3>
          {order?.paymentStatus && (
            <button
              type="button"
              onClick={() => generateOrderInvoice(order, { audience: "admin" })}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-ink shadow-sm transition-all hover:bg-surface-bento hover:border-surface-forest/30 active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5 text-surface-forest" />
              Download Invoice
            </button>
          )}
        </div>

        <OrderTimeline currentStatus={currentStatus} />

        {/* Status Change Controls for Admin */}
        <div className="mt-6 pt-5 border-t border-border-subtle/80">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Change Order Status
            </span>
            {statusLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-surface-forest" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {orderSteps.map((status) => {
              const isActive = currentStatus === status;
              return (
                <CustomAlertDialouge
                  key={status}
                  disableTrigger={statusLoading}
                  triggerText={status}
                  triggerClass={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${
                    statusLoading ? "cursor-not-allowed opacity-60" : ""
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
