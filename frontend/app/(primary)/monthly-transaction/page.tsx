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
import {
  CheckCircle2,
  XCircle,
  Repeat,
  Loader2,
  Calendar,
  Hash,
  ArrowRight,
} from "lucide-react";

const MonthlyTransactionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [executed, setExecuted] = useState(false);
  const [updating, setUpdating] = useState(false);

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
            <ActionPillButton
              variant="lime"
              href="/donar-dashboard/my-orders"
              size="md"
            >
              Donor Dashboard
              <ArrowRight className="h-4 w-4 ml-1" />
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
        <div className="flex min-h-[50vh] items-center justify-center bg-surface-canvas">
          <div className="flex flex-col items-center gap-2.5 text-surface-forest">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-semibold">Loading recurring status...</p>
          </div>
        </div>
      }
    >
      <MonthlyTransactionContent />
    </Suspense>
  );
};

export default MonthlyTransaction;
