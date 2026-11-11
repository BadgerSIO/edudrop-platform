"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IProduct, isICategory } from "@/app/types/Product";
import { useNavbarContext } from "@/app/context/NavContext";
import { useAuthContext } from "@/app/context/AuthContext";
import RoleCheckoutGuard, {
  isStaffRole,
} from "@/app/sharedComponents/RoleCheckoutGuard";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { CheckCircle2, ShieldCheck, Truck, Droplets } from "lucide-react";
import toast from "react-hot-toast";

export const ProductPrice = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const {
    distinctProductCount,
    setDistinctProductCount,
    setCaptureCount,
    captureCount,
    setIsCartOpen,
  } = useNavbarContext();
  const { data: userData } = useAuthContext();
  const staffPreviewOnly = isStaffRole(userData?.role);

  const [count, setCount] = useState(1);

  const handleIncrement = () => {
    setCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCount((prev) => Math.max(1, prev - 1));
  };

  const updateCartWithQuantity = () => {
    const storedCart = localStorage.getItem("cart");
    let cart: Record<string, number> = {};

    if (storedCart) {
      cart = JSON.parse(storedCart);
      if (typeof cart !== "object") {
        throw new Error("Invalid cart data format");
      }
    }

    if (cart[product.slug]) {
      cart[product.slug] += count;
    } else {
      cart[product.slug] = count;
      setDistinctProductCount(distinctProductCount + 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCaptureCount(!captureCount);
  };

  const handleAddToCart = () => {
    if (staffPreviewOnly) {
      toast.error("Bursar & Admin accounts browse in preview mode. Sign in as a Donor to add supplies.");
      return;
    }
    try {
      updateCartWithQuantity();
      setIsCartOpen(true);
      toast.success(`Added ${count}x ${product.title} to sponsorship cart!`);
    } catch (error) {
      toast.error(`Error updating cart: ${error}`);
    }
  };

  const handleCheckout = () => {
    if (staffPreviewOnly) {
      toast.error("Bursar & Admin accounts cannot place sponsorship orders.");
      return;
    }
    try {
      updateCartWithQuantity();
      router.push("/checkout");
    } catch (error) {
      toast.error(`Error updating cart: ${error}`);
    }
  };

  const categoryTitle = isICategory(product?.category)
    ? product?.category?.title
    : product?.category || "Classroom Essential";

  const price = product?.sale ? product?.salePrice : product?.price;

  return (
    <BentoCard variant="white" className="p-6 sm:p-8 lg:p-10 border-border-subtle/80 flex flex-col justify-between h-full">
      <div>
        {/* Category & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-forest/10 px-3 py-1 text-xs font-semibold text-surface-forest">
            <Droplets className="h-3 w-3 text-surface-forest" />
            {categoryTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime/20 px-3 py-1 text-xs font-semibold text-surface-forest">
            <CheckCircle2 className="h-3.5 w-3.5 text-surface-forest" />
            Direct Gate Delivery
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 font-display text-2xl font-bold text-text-ink sm:text-3xl lg:text-4xl">
          {product?.title}
        </h2>

        {/* Price & Packaging */}
        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-display text-3xl font-extrabold text-text-ink sm:text-4xl">
            ${price}
          </span>
          {product?.sale && (
            <span className="text-lg font-medium text-text-body line-through">
              ${product?.price}
            </span>
          )}
          <span className="text-sm font-medium text-text-body">
            / classroom case
          </span>
        </div>

        {/* Sponsorship Impact Callout */}
        <div className="mt-6 rounded-2xl bg-surface-bento/80 p-4 border border-border-subtle/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-surface-forest">
            Classroom Wellness Impact
          </p>
          <p className="mt-1 text-sm text-text-body">
            100% of this gift funds physical spring water cases or essential
            hygiene kits delivered directly into partner school hands.
          </p>
        </div>

        {/* Quantity Controls & Actions (or Role Preview Guard for Staff) */}
        {staffPreviewOnly ? (
          <div className="mt-8">
            <RoleCheckoutGuard
              variant="card"
              compact
              redirectTo={`/products/${product.slug}`}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Pill Counter */}
              <div className="inline-flex items-center gap-3 rounded-full border border-border-subtle bg-surface-bento px-4 py-2 font-bold text-text-ink">
                <span className="text-xs uppercase font-medium text-text-body mr-1">
                  Qty
                </span>
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-sm transition-colors hover:bg-surface-forest hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center text-base">{count}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-sm transition-colors hover:bg-surface-forest hover:text-white"
                >
                  +
                </button>
              </div>

              {/* Total Line */}
              <span className="text-sm font-semibold text-text-body">
                Total:{" "}
                <strong className="text-text-ink font-display text-lg">
                  ${((price || 0) * count).toFixed(2)}
                </strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ActionPillButton
                variant="lime"
                onClick={handleCheckout}
                size="lg"
                className="flex-1 justify-center whitespace-nowrap min-w-[200px]"
              >
                Sponsor Now & Checkout
              </ActionPillButton>
              <ActionPillButton
                variant="dark"
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 justify-center whitespace-nowrap min-w-[180px]"
              >
                Add to Cart
              </ActionPillButton>
            </div>
          </div>
        )}
      </div>

      {/* Direct Delivery Reassurance Box */}
      <div className="mt-8 rounded-2xl border border-border-subtle/80 bg-white p-5 space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-text-ink">
          <Truck className="h-4 w-4 text-surface-forest shrink-0" />
          <span>Free consolidated delivery to all partner schools</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-text-ink">
          <ShieldCheck className="h-4 w-4 text-surface-forest shrink-0" />
          <span>Verified delivery sign-off by school bursar</span>
        </div>
      </div>
    </BentoCard>
  );
};

export default ProductPrice;
