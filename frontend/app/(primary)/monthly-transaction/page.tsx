"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteCookie, getCookie } from "@/app/utility/handleCookie";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";
import { IOrder } from "@/app/types/Order";
import { generateOrderInvoice } from "@/app/utility/generateOrderInvoice";
import {
  CheckCircle2,
  Download,
  XCircle,
  Repeat,
  Calendar,
  Hash,
} from "lucide-react";

const MonthlyTransactionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [executed, setExecuted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [renewedOrder, setRenewedOrder] = useState<IOrder | null>(null);

  let payloadId: any = null;
  try {
    const rawData = searchParams.get("data");
    if (rawData) {
      const parsedOnce = JSON.parse(rawData);
      payloadId = typeof parsedOnce === "string" ? JSON.parse(parsedOnce) : parsedOnce;
    }
  } catch {
    payloadId = null;
  }

  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id") || "N/A";
  const card = searchParams.get("card") || "(VISA) ... 4242";
  const transactionId = searchParams.get("transaction_id") || "N/A";

  const updateOrder = async () => {
    const paymentIntent = await getCookie("paymentIntent");
    if (paymentIntent !== "true") {
      return router.replace("/");
    }

    const payload = {
      orderId,
      card,
      transactionId,
      paymentStatus: true,
    };

    if (status === "success" && paymentIntent === "true" && payloadId) {
      setUpdating(true);
      try {
        const jwt = await getCookie("jwt");
        if (!jwt) return;

        const response = await axios.patch(
          `${SERVERURLAPI}/order/payment-update/${payloadId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );

        if (response.status === 200) {
          if (response.data?.data) {
            setRenewedOrder(response.data.data);
          }
          await deleteCookie("paymentIntent");
          await handleRevalidation("orderInfo");
          await handleRevalidation("orderCollection");
          toast.success("Recurring monthly sponsorship renewed successfully!");
        }
      } catch (error) {
        console.error("Monthly renewal error:", error);
        toast.error(`Renewal update error: ${error}`);
      } finally {
        setUpdating(false);
      }
    }
  };

  useEffect(() => {
    if (!executed) {
      setExecuted(true);
      updateOrder();
    }
  }, [executed]);

  const isSuccess = status === "success";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface-canvas px-5 py-16">
      <div className="w-full max-w-lg">
        <BentoCard
          variant="white"
          className="border-border-subtle/80 p-8 sm:p-10 text-center shadow-bento"
        >
          {/* Status Icon */}
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ring-8 ${
              isSuccess
                ? "bg-brand-lime/20 text-surface-forest ring-brand-lime/10"
                : "bg-red-100 text-red-600 ring-red-50"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-9 w-9 text-surface-forest" />
            ) : (
              <XCircle className="h-9 w-9 text-red-600" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-forest/10 px-3 py-1 text-xs font-bold text-surface-forest">
            <Repeat className="h-3.5 w-3.5" />
            Monthly Sustaining Sponsorship
          </div>

          <h2 className="mt-3 font-display text-2xl font-extrabold text-text-ink sm:text-3xl">
            {isSuccess ? "Monthly Renewal Successful" : "Renewal Failed"}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-text-body sm:text-sm">
            {isSuccess
              ? "Your recurring sponsorship has been verified. Supplies for this cycle are queued for classroom delivery."
              : "We were unable to process this recurring cycle. Please update your payment method in your donor dashboard."}
          </p>

          {/* Details Table */}
          {isSuccess && (
            <div className="mt-6 rounded-2xl bg-surface-bento/60 p-4 text-left border border-border-subtle/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-body flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Order ID:
                </span>
                <span className="font-mono font-bold text-text-ink">{orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-body flex items-center gap-1">
                  <Repeat className="h-3 w-3" /> Transaction Ref:
                </span>
                <span className="font-mono font-bold text-text-ink break-all">
                  {transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-body flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Next Cycle:
                </span>
                <span className="font-bold text-surface-forest">30 Days</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isSuccess && renewedOrder && (
              <button
                type="button"
                onClick={() =>
                  generateOrderInvoice(
                    { ...renewedOrder, paymentStatus: true },
                    { audience: "donor" }
                  )
                }
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-full bg-surface-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-surface-forest-light active:scale-[0.98] disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5 text-brand-lime" />
                Download PDF Receipt
              </button>
            )}
            <ActionPillButton
              variant="lime"
              href={
                orderId && orderId !== "N/A"
                  ? `/donar-dashboard/my-orders/${orderId}`
                  : "/donar-dashboard/my-orders"
              }
              size="md"
            >
              View Order in Dashboard
            </ActionPillButton>
            <ActionPillButton
              variant="outline-dark"
              href="/products"
              size="md"
            >
              Browse Supplies
            </ActionPillButton>
          </div>
        </BentoCard>
      </div>
    </div>
  );
};

const MonthlyTransaction = () => {
  return (
    <Suspense
      fallback={
        <EduDropLoader
          size="md"
          label="Loading recurring status..."
          className="min-h-[50vh] bg-surface-canvas"
        />
      }
    >
      <MonthlyTransactionContent />
    </Suspense>
  );
};

export default MonthlyTransaction;
