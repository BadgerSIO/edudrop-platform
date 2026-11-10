"use client";
import React from "react";
import ProductCardCheckout from "./ProductCardCheckout";
import { useNavbarContext } from "@/app/context/NavContext";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { ShoppingBag, CheckCircle2, Truck, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";

export const ShoppingCart = () => {
  const { cartProducts, subtotal, distinctProductCount } = useNavbarContext();

  return (
    <div className="w-full lg:max-w-[420px]">
      <BentoCard
        variant="white"
        className="sticky top-28 border-border-subtle/80 p-6 sm:p-7 shadow-bento"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-ink sm:text-xl">
              Sponsorship Summary
            </h3>
          </div>
          <span className="inline-flex items-center rounded-full bg-brand-lime px-2.5 py-0.5 text-xs font-bold text-surface-forest">
            {distinctProductCount} {distinctProductCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Product Items List */}
        {cartProducts && cartProducts.length > 0 ? (
          <div className="my-5 max-h-[300px] space-y-3 overflow-y-auto pr-1">
            {cartProducts.map((product) => (
              <ProductCardCheckout
                key={product?._id || product?.slug}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="my-6 rounded-2xl border border-dashed border-border-subtle bg-surface-bento/40 p-6 text-center">
            <Heart className="mx-auto h-8 w-8 text-text-body/40" />
            <p className="mt-2 text-xs font-medium text-text-body">
              Your sponsorship cart is currently empty.
            </p>
            <Link
              href="/products"
              className="mt-3 inline-block text-xs font-bold text-surface-forest hover:underline"
            >
              Browse Classroom Supplies →
            </Link>
          </div>
        )}

        {/* Financial Breakdown */}
        <div className="space-y-3 border-t border-border-subtle/70 py-4 text-xs sm:text-sm">
          <div className="flex justify-between text-text-body">
            <span>Classroom Supplies Subtotal</span>
            <span className="font-semibold text-text-ink">
              ${subtotal?.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-text-body">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-surface-forest" />
              Consolidated Campus Dispatch
            </span>
            <span className="font-semibold text-surface-forest">FREE</span>
          </div>

          <div className="flex justify-between text-text-body">
            <span>Administrative Diversion</span>
            <span className="font-semibold text-surface-forest">$0.00 (0%)</span>
          </div>
        </div>

        {/* Total Row */}
        <div className="border-t border-border-subtle/70 pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="block text-xs uppercase font-bold tracking-wider text-text-body">
                Total Contribution
              </span>
              <span className="text-[11px] text-text-body">
                100% Tax-Deductible
              </span>
            </div>
            <span className="font-display text-2xl font-extrabold text-surface-forest sm:text-3xl">
              ${subtotal?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 rounded-2xl bg-surface-bento/60 p-4 space-y-2 border border-border-subtle/50">
          <div className="flex items-center gap-2 text-xs font-medium text-text-body">
            <CheckCircle2 className="h-3.5 w-3.5 text-surface-forest shrink-0" />
            <span>Direct handover to verified campus bursar</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-body">
            <ShieldCheck className="h-3.5 w-3.5 text-surface-forest shrink-0" />
            <span>Photo receipt & delivery sign-off in donor portal</span>
          </div>
        </div>
      </BentoCard>
    </div>
  );
};

export default ShoppingCart;
