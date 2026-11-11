"use client";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import CartProductCard from "./CartProductCard";
import { useNavbarContext } from "../context/NavContext";
import { useAuthContext } from "../context/AuthContext";
import RoleCheckoutGuard, { isStaffRole } from "./RoleCheckoutGuard";
import { X, ShoppingBag, ShieldCheck } from "lucide-react";
import ActionPillButton from "./ui/ActionPillButton";

const Cart = ({
  setIsCartOpen,
}: {
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    distinctProductCount,
    setDistinctProductCount,
    cartProducts,
    setCartProducts,
    subtotal,
    captureCount,
    setCaptureCount,
  } = useNavbarContext();
  const { data: userData } = useAuthContext();
  const staffBlocked = isStaffRole(userData?.role);

  const removeFromCart = (slug: string) => {
    setCaptureCount(!captureCount);
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const cart = JSON.parse(storedCart);
      if (cart.hasOwnProperty(slug)) {
        delete cart[slug];
        localStorage.setItem("cart", JSON.stringify(cart));

        const updatedCartProducts = cartProducts.filter(
          (product) => product.slug !== slug
        );
        setCartProducts(updatedCartProducts);
        setDistinctProductCount(Math.max(0, distinctProductCount - 1));
      }
    }
  };

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainRef.current && !mainRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsCartOpen]);

  const hasItems = cartProducts && cartProducts.length > 0;

  return (
    <div
      id="cart-wrapper"
      className="drawer-backdrop fixed inset-0 z-[999] flex h-screen w-full overflow-hidden bg-surface-forest/40 backdrop-blur-sm"
    >
      <div
        id="cart-main"
        className="ml-auto flex h-full w-full max-w-[480px] flex-col justify-between bg-white shadow-2xl"
        ref={mainRef}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-text-ink">
              Sponsorship Cart
            </h2>
            <span className="rounded-full bg-brand-lime px-2.5 py-1 text-xs font-bold text-surface-forest">
              {cartProducts ? cartProducts.length : 0}{" "}
              {cartProducts?.length === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-bento text-text-muted transition-colors hover:bg-surface-forest hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {hasItems ? (
            <ul className="space-y-4">
              {cartProducts.map((product) => (
                <CartProductCard
                  key={product?._id || product?.slug}
                  product={product}
                  removeFromCart={removeFromCart}
                />
              ))}
            </ul>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-bento text-text-muted">
                <ShoppingBag className="h-8 w-8 text-surface-forest" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text-ink">
                Your sponsorship cart is empty
              </h3>
              <p className="mt-2 text-sm text-text-body">
                Select bottled spring water cases, dispensers, or hygiene supplies
                to support verified classrooms.
              </p>
              <div className="mt-6">
                <ActionPillButton
                  variant="dark"
                  onClick={() => setIsCartOpen(false)}
                  size="sm"
                >
                  Browse Supplies
                </ActionPillButton>
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {hasItems && (
          <div className="border-t border-border-subtle bg-surface-bento/50 p-6 space-y-4">
            {/* Delivery Reassurance Note */}
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-forest">
              <ShieldCheck className="h-4 w-4 text-brand-lime shrink-0" />
              <span>100% Direct Gate Delivery to Partner School Bursars</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-text-body">Subtotal</span>
              <span className="font-display text-2xl font-extrabold text-text-ink">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout Action (guarded for Staff roles) */}
            {staffBlocked ? (
              <RoleCheckoutGuard
                variant="banner"
                compact
                redirectTo="/checkout"
                onSwitchComplete={() => setIsCartOpen(false)}
              />
            ) : (
              <div onClick={() => setIsCartOpen(false)}>
                <ActionPillButton
                  variant="lime"
                  href="/checkout"
                  size="lg"
                  className="w-full justify-between"
                >
                  Proceed to Sponsorship Checkout
                </ActionPillButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
