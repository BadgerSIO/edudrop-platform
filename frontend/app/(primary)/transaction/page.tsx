"use client";
import { useNavbarContext } from "@/app/context/NavContext";
import { IOrder } from "@/app/types/Order";
import { deleteCookie, getCookie, setCookie } from "@/app/utility/handleCookie";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";
import {
  Check,
  Copy,
  Download,
  UserCheck,
  CheckCircle2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Calendar,
  CreditCard,
  Hash,
} from "lucide-react";
import { generateOrderInvoice } from "@/app/utility/generateOrderInvoice";

interface ICredentials {
  email: string;
  password: string;
}

const TransactionContent = () => {
  const [showOrder, setShowOrder] = useState<IOrder>();
  const executedOrderIdRef = useRef<string | null>(null);
  const { cartProducts, captureCount, setCaptureCount } = useNavbarContext();
  const [orderLoading, setOrderLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] =
    useState<ICredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderRaw = searchParams.get("data");
  const order = orderRaw ? JSON.parse(orderRaw) : null;
  let newOrder = (order ? JSON.parse(order) : {}) as IOrder;

  const handleCopyPassword = () => {
    if (!createdCredentials?.password) return;
    navigator.clipboard.writeText(createdCredentials.password).then(() => {
      setCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const makeOrder = async (orderPayload: any) => {
    const maxAge = 60 * 10;
    await setCookie("paymentIntent", "true", maxAge);
    try {
      const guestEmail = await getCookie("guestEmail");
      setOrderLoading(true);
      const response = await axios.post(
        `${SERVERURLAPI}/order/create`,
        orderPayload,
      );
      if (response.status === 200) {
        const createdOrder = response.data?.data;
        if (createdOrder) {
          setShowOrder((prev) => ({
            ...(prev || ({} as IOrder)),
            ...createdOrder,
            products:
              Array.isArray(createdOrder?.products) && createdOrder.products.length > 0
                ? createdOrder.products
                : prev?.products || [],
            paymentStatus: true,
          }));
        }
        const creds = createdOrder?.newAccountCredentials;
        if (creds) {
          setCreatedCredentials(creds);
        }

        toast.success(
          guestEmail || creds
            ? "Account created! You can now log into your Donor portal."
            : "Sponsorship order confirmed successfully",
          { duration: 5000 },
        );
        await handleRevalidation("orderInfo");
        await handleRevalidation("orderCollection");
        localStorage.removeItem("cart");
        await deleteCookie("paymentIntent");
        setCaptureCount(!captureCount);
        localStorage.setItem("orderMade", "true");
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(`Failed to create Order: ${error}`);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "success") return;
    const orderId = searchParams.get("order_id");
    if (!orderId) return;

    // Strict synchronous ref guard to prevent double-execution
    if (executedOrderIdRef.current === orderId) {
      return;
    }
    executedOrderIdRef.current = orderId;

    newOrder["orderId"] = orderId;
    newOrder["card"] =
      (searchParams.get("card") as string) || "(VISA) ... 4242";
    newOrder["transactionId"] =
      (searchParams.get("transaction_id") as string) || `TX-${orderId}`;
    newOrder.totalAmount = Number(newOrder.totalAmount);
    if (!newOrder.products || newOrder.products.length === 0) {
      newOrder.products = cartProducts;
    }

    setShowOrder(newOrder);
    makeOrder(newOrder);
  }, [status, searchParams]);

  if (orderLoading) {
    return (
      <EduDropLoader
        size="lg"
        label="Recording your sponsorship requisition..."
        sublabel="Routing physical supplies to the campus delivery queue."
        className="min-h-[60vh] bg-surface-canvas"
      />
    );
  }

  const orderId = showOrder?.orderId || searchParams.get("order_id") || "N/A";
  const transactionId =
    showOrder?.transactionId || searchParams.get("transaction_id") || "N/A";
  const card = showOrder?.card || searchParams.get("card") || "(VISA) ... 4242";
  const totalAmount = showOrder?.totalAmount || 0;
  const products = showOrder?.products || [];

  return (
    <div className="min-h-screen bg-surface-canvas py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[860px] px-5 sm:px-8 space-y-8">
        {/* Celebration Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lime/20 text-surface-forest ring-8 ring-brand-lime/10">
            <CheckCircle2 className="h-9 w-9 text-surface-forest" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-forest/10 px-3.5 py-1 text-xs font-bold text-surface-forest">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Direct Sponsorship
          </span>

          <h1 className="mt-3 font-display text-3xl font-extrabold text-text-ink sm:text-4xl lg:text-5xl">
            Sponsorship Confirmed! Thank You.
          </h1>

          <p className="mt-2.5 text-sm leading-relaxed text-text-body sm:text-base max-w-xl mx-auto">
            Your physical classroom supply order has been received and scheduled
            for direct gate dispatch to partner campus bursars.
          </p>
        </div>

        {/* Bento Order Receipt Card */}
        <BentoCard
          variant="white"
          className="border-border-subtle/80 p-6 sm:p-8 shadow-bento space-y-6"
        >
          {/* Top Meta Bar */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-surface-bento/60 p-4 sm:grid-cols-4 sm:p-5 border border-border-subtle/60">
            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-body">
                <Hash className="h-3 w-3" /> Order ID
              </span>
              <span className="mt-1 block font-mono text-sm font-bold text-text-ink">
                {orderId}
              </span>
            </div>

            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-body">
                <CheckCircle2 className="h-3 w-3 text-surface-forest" /> Status
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 font-semibold text-xs text-surface-forest">
                <span className="h-2 w-2 rounded-full bg-brand-lime ring-2 ring-surface-forest/20 animate-pulse" />
                {status === "success" ? "Verified" : status || "Success"}
              </span>
            </div>

            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-body">
                <CreditCard className="h-3 w-3" /> Payment Method
              </span>
              <span className="mt-1 block text-xs font-semibold text-text-ink">
                {card}
              </span>
            </div>

            <div>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-body">
                <Calendar className="h-3 w-3" /> Requisition Cadence
              </span>
              <span className="mt-1 block text-xs font-semibold text-text-ink">
                {showOrder?.payMonthly === "yes"
                  ? "Monthly Sustaining"
                  : "One-Time Delivery"}
              </span>
            </div>
          </div>

          {/* Transaction Reference Strip */}
          <div className="rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs text-text-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="font-medium text-text-body">
              Transaction Reference:
            </span>
            <span className="font-mono text-xs font-bold text-text-ink break-all">
              {transactionId}
            </span>
          </div>

          {/* Sponsored Supplies List (if present) */}
          {products.length > 0 && (
            <div className="border-t border-border-subtle/70 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-body mb-3">
                Sponsored Classroom Essentials
              </h3>
              <div className="space-y-2.5">
                {products.map((prod: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-surface-canvas/60 p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-white p-1">
                        <Image
                          src={handleBuildImage(
                            prod?.productImage,
                            "/products/edudrop-bottle.webp"
                          )}
                          alt={prod?.title || "Item"}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-ink line-clamp-1">
                          {prod?.title}
                        </h4>
                        <span className="text-xs text-text-body">
                          Qty: {prod?.quantity || 1} × $
                          {(prod?.salePrice || prod?.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-text-ink">
                      $
                      {(
                        (prod?.salePrice || prod?.price || 0) *
                        (prod?.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Row & Receipt Action */}
          <div className="border-t border-border-subtle/70 pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-body">
                Total Direct Contribution
              </span>
              <p className="text-xs text-text-body">
                Official 501(c)(3) tax receipt emailed
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4">
              <span className="font-display text-2xl font-extrabold text-surface-forest sm:text-3xl">
                ${totalAmount ? totalAmount.toFixed(2) : "0.00"}
              </span>
              {showOrder && (
                <button
                  type="button"
                  onClick={() =>
                    generateOrderInvoice(
                      { ...showOrder, paymentStatus: true },
                      { audience: "donor" }
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-surface-forest px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-surface-forest-light active:scale-[0.98]"
                >
                  <Download className="h-3.5 w-3.5 text-brand-lime" />
                  Download PDF Receipt
                </button>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Auto-Generated Credentials Card */}
        {createdCredentials && (
          <div className="relative overflow-hidden rounded-3xl bg-surface-forest p-6 sm:p-8 text-on-forest shadow-bento">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-lime/15 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lime/20 text-brand-lime shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-brand-lime px-2.5 py-0.5 text-[10px] font-bold text-surface-forest uppercase tracking-wider mb-1">
                  Automatic Setup
                </span>
                <h2 className="font-display text-xl font-bold sm:text-2xl">
                  Your Donor Portal Account is Ready
                </h2>
                <p className="mt-1 text-xs text-on-forest-muted sm:text-sm">
                  We created a donor account for you so you can follow the live
                  truck delivery, view signed bursar delivery receipts, and download
                  annual tax summaries.
                </p>
              </div>
            </div>

            <div className="relative mt-6 space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10 text-sm">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-on-forest-muted">
                  Username / Email:
                </span>
                <span className="font-mono text-sm font-bold text-on-forest">
                  {createdCredentials.email}
                </span>
              </div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-t border-white/10 pt-2.5">
                <span className="text-xs font-semibold text-on-forest-muted">
                  Temporary Password:
                </span>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-black/20 px-3 py-1 font-mono text-xs font-bold text-brand-lime">
                    {createdCredentials.password}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-lime px-3 py-1 text-xs font-bold text-surface-forest transition hover:bg-brand-lime/90"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap items-center gap-3">
              <ActionPillButton
                variant="lime"
                href={`/login?email=${encodeURIComponent(createdCredentials.email)}`}
                size="md"
              >
                Log In to Donor Dashboard
              </ActionPillButton>
              <ActionPillButton
                variant="outline-glass"
                href="/products"
                size="md"
              >
                Browse More Supplies
              </ActionPillButton>
            </div>
          </div>
        )}

        {/* 3-Step Physical Delivery Pipeline Reassurance */}
        <BentoCard
          variant="white"
          className="border-border-subtle/80 p-6 sm:p-8 shadow-bento"
        >
          <h3 className="font-display text-base font-bold text-text-ink sm:text-lg mb-4">
            Direct-to-Classroom Delivery Pipeline
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-bento/60 p-4 border border-border-subtle/50">
              <div className="flex items-center gap-2 text-surface-forest">
                <CheckCircle2 className="h-4 w-4 text-surface-forest" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Step 1: Confirmed
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-text-ink">
                Requisition Logged
              </h4>
              <p className="mt-1 text-xs text-text-body">
                Supplies allocated from our local warehouse inventory.
              </p>
            </div>

            <div className="rounded-2xl bg-surface-bento/60 p-4 border border-border-subtle/50">
              <div className="flex items-center gap-2 text-surface-forest">
                <Truck className="h-4 w-4 text-surface-forest animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Step 2: En Route
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-text-ink">
                Consolidated Dispatch
              </h4>
              <p className="mt-1 text-xs text-text-body">
                Cases routed on scheduled delivery van directly to campus gate.
              </p>
            </div>

            <div className="rounded-2xl bg-surface-bento/60 p-4 border border-border-subtle/50">
              <div className="flex items-center gap-2 text-text-body">
                <PackageCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Step 3: Verification
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-text-ink">
                Bursar Photo Sign-off
              </h4>
              <p className="mt-1 text-xs text-text-body">
                School administration verifies receipt and photos are posted.
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Regular Action Links if already logged in */}
        {!createdCredentials && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <ActionPillButton
              variant="dark"
              href="/donar-dashboard/my-orders"
              size="lg"
            >
              <PackageCheck className="h-4 w-4 shrink-0" />
              <span>View My Orders in Dashboard</span>
            </ActionPillButton>
            <ActionPillButton
              variant="outline-dark"
              href="/products"
              size="lg"
            >
              Continue Browsing Supplies
            </ActionPillButton>
          </div>
        )}
      </div>
    </div>
  );
};

const Transaction = () => {
  return (
    <Suspense
      fallback={
        <EduDropLoader
          size="md"
          label="Loading receipt details..."
          className="min-h-[50vh] bg-surface-canvas"
        />
      }
    >
      <TransactionContent />
    </Suspense>
  );
};

export default Transaction;
