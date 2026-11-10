"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IProduct, isICategory } from "../types/Product";
import { handleBuildImage } from "../utility/handleBuildImage";
import { useNavbarContext } from "../context/NavContext";
import ActionPillButton from "./ui/ActionPillButton";
import { CheckCircle2, Droplets } from "lucide-react";
import toast from "react-hot-toast";

export const ProductCard = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const {
    setIsCartOpen,
    distinctProductCount,
    setDistinctProductCount,
    captureCount,
    setCaptureCount,
  } = useNavbarContext();

  const handleRouting = () => {
    router.push(`/products/${product?.slug}`);
  };

  const handleAddToCart = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    try {
      const storedCart = localStorage.getItem("cart");
      let cart: Record<string, number> = {};

      if (storedCart) {
        cart = JSON.parse(storedCart);
        if (typeof cart !== "object") {
          throw new Error("Invalid cart data format");
        }
      }

      if (cart[product.slug]) {
        cart[product.slug] += 1;
      } else {
        cart[product.slug] = 1;
        setDistinctProductCount(distinctProductCount + 1);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setCaptureCount(!captureCount);
      setIsCartOpen(true);
      toast.success(`Added ${product.title} to sponsorship cart!`);
    } catch (error) {
      toast.error(`Error updating cart: ${error}`);
    }
  };

  const categoryTitle = isICategory(product?.category)
    ? product?.category?.title
    : product?.category || "Classroom Essential";

  return (
    <div
      onClick={handleRouting}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle/80 bg-white p-5 sm:p-6 shadow-bento transition-all duration-300 hover:-translate-y-1 hover:border-surface-forest/30 hover:shadow-bento-hover cursor-pointer"
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
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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

          {/* Title */}
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-text-ink transition-colors group-hover:text-surface-forest line-clamp-2 min-h-[3.1rem]">
            {product.title}
          </h3>
        </div>
      </div>

      {/* Footer Price + Action Row */}
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
              / case
            </span>
          </div>

          <ActionPillButton
            variant="dark"
            size="sm"
            onClick={() => handleAddToCart()}
            className="group-hover:bg-brand-lime group-hover:text-surface-forest"
          >
            Sponsor Item
          </ActionPillButton>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
