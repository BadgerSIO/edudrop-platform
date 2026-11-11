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
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
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

  const handleOrderStatus = async () => {
    if (statusLoading) return;
    const previousStatus = currentStatus;
    setCurrentStatus("received");
    setStatusLoading(true);

    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/order/status/${order?.orderId || order?._id}`,
        { orderStatus: "received" },
        {
          headers: jwt
            ? {
                Authorization: `Bearer ${jwt}`,
              }
            : {},
        }
      );
      if (response.status === 200) {
        toast.success("Delivery confirmed as received");
        await handleRevalidation("orderInfo");
        await handleRevalidation("orderCollection");
        router.refresh();
      } else {
        setCurrentStatus(previousStatus);
        toast.error("Failed to update status");
      }
    } catch (error: any) {
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
      <OrderReferenceHeader order={order} audience="bursar" />

      {/* Progress Timeline Card */}
      <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Supply Shipment Progress
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            {order?.paymentStatus && (
              <button
                type="button"
                onClick={() => generateOrderInvoice(order, { audience: "bursar" })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-ink shadow-sm transition-all hover:bg-surface-bento hover:border-surface-forest/30 active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5 text-surface-forest" />
                Download Campus Receipt
              </button>
            )}
            {currentStatus === "on the way" && (
              <CustomAlertDialouge
                disableTrigger={statusLoading}
                triggerText={
                  statusLoading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Confirm Delivery Received"
                  )
                }
                triggerClass={`inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] motion-reduce:active:scale-100 hover:bg-surface-forest-light ${
                  statusLoading ? "cursor-not-allowed opacity-60" : ""
                }`}
                onConfirm={handleOrderStatus}
                alertDescription="Confirm that these sponsored school supplies have arrived safely on campus?"
              />
            )}
          </div>
        </div>

        <OrderTimeline currentStatus={currentStatus} />
      </div>

      {/* Items & Shipping Summary Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
        <div>
          <h3 className="text-base font-bold tracking-tight text-text-ink">
            Order Inventory
          </h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {order.products.map((product) => (
              <ProductCardCheckout key={product?._id} product={product} />
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="rounded-xl border border-border-subtle bg-surface-bento/30 p-4 space-y-2.5">
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Sponsored Value</span>
            <span className="font-semibold text-text-ink">${order?.totalAmount}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted font-medium">
            <span>Campus Delivery Cost</span>
            <span className="font-semibold text-emerald-700">Free Donor Coverage</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-text-ink pt-2 border-t border-border-subtle">
            <span>Total Value</span>
            <span className="text-base font-extrabold text-surface-forest">
              ${order?.totalAmount}
            </span>
          </div>
        </div>

        {/* Beneficiary Campus Info */}
        <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/20 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Destination & Delivery Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-text-muted block">School Name</span>
              <span className="font-semibold text-text-ink">{order?.schoolId?.name}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Contact Phone</span>
              <span className="font-medium text-text-ink">{order?.schoolId?.contactNo || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Campus City</span>
              <span className="font-medium text-text-ink">{order?.schoolId?.address?.city || "--"}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Order Placed</span>
              <span className="font-medium text-text-ink">{convertedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
