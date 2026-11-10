"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IProduct, isICategory } from "../types/Product";
import { handleBuildImage } from "../utility/handleBuildImage";
import { useNavbarContext } from "../context/NavContext";
import ActionPillButton from "./ui/ActionPillButton";
import { Check, CheckCircle2, Droplets } from "lucide-react";
import toast from "react-hot-toast";

export const ProductCard = ({
  product,
  style,
}: {
  product: IProduct;
  style?: React.CSSProperties;
}) => {
  const {
    setIsCartOpen,
    setDistinctProductCount,
    captureCount,
    setCaptureCount,
  } = useNavbarContext();

  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleAddToCart = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const storedCart = localStorage.getItem("cart");
      let cart: Record<string, number> = {};

      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          cart = parsed;
        } else {
          throw new Error("Invalid cart data format");
        }
      }

      cart[product.slug] = (cart[product.slug] || 0) + 1;

      localStorage.setItem("cart", JSON.stringify(cart));
      setDistinctProductCount(Object.keys(cart).length);
      setCaptureCount(!captureCount);
      setIsCartOpen(true);

      setJustAdded(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setJustAdded(false);
      }, 1500);

      toast.success(`Added ${product.title} to sponsorship cart!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error updating cart: ${message}`);
    }
  };

  const categoryTitle = isICategory(product?.category)
    ? product?.category?.title
    : product?.category || "Classroom Essential";

  const unitLabel = product?.packagingType === "Single" ? "/ item" : "/ case";
  const productHref = `/products/${product?.slug}`;

  return (
    <article
      style={style}
      className="group/card relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle/80 bg-white p-5 sm:p-6 shadow-bento transition-all duration-300 hover:-translate-y-1 hover:border-surface-forest/30 hover:shadow-bento-hover focus-within:ring-2 focus-within:ring-brand-lime"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-bento/60 p-6">
          <Image
            src={handleBuildImage(
              product?.productImage,
              "/products/edudrop-bottle.webp"
            )}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={product.title}
            className="object-contain p-4 transition-transform duration-500 group-hover/card:scale-105"
          />

          {/* Floating Category Pill */}
          <div className="absolute left-3.5 top-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle/60 bg-white/95 px-3 py-1 text-xs font-semibold text-surface-forest shadow-sm backdrop-blur-sm">
              <Droplets className="h-3 w-3 text-brand-lime shrink-0" />
              {categoryTitle}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="mt-4">
          {/* Direct Delivery Badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-surface-forest">
            <CheckCircle2 className="h-3.5 w-3.5 text-surface-forest" />
            <span>100% Direct Gate Delivery</span>
          </div>

          {/* Semantic Stretched Link Title */}
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-text-ink transition-colors group-hover/card:text-surface-forest line-clamp-2 min-h-[3.1rem]">
            <Link
              href={productHref}
              className="after:absolute after:inset-0 after:z-0 focus:outline-none"
            >
              {product.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Footer Price + Isolated Cart CTA Row */}
      <div className="mt-5 border-t border-border-subtle/70 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold text-text-ink">
              ${product?.sale ? product?.salePrice : product?.price}
            </span>
            {product?.sale && (
              <span className="text-xs font-medium text-text-body line-through">
                ${product?.price}
              </span>
            )}
            <span className="text-xs font-medium text-text-body">
              {unitLabel}
            </span>
          </div>

          <div className="relative z-10 shrink-0">
            <ActionPillButton
              variant="dark"
              size="sm"
              onClick={handleAddToCart}
              ariaLabel={`Sponsor ${product.title}`}
              className={
                justAdded ? "bg-surface-forest text-white" : undefined
              }
            >
              <span
                className="inline-flex items-center gap-1.5"
                aria-live="polite"
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-brand-lime" />
                    <span>Added</span>
                  </>
                ) : (
                  <span>Sponsor Item</span>
                )}
              </span>
            </ActionPillButton>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
