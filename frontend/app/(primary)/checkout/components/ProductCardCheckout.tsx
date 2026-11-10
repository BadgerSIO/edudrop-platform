"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IProductWithQuantity } from "@/app/types/Product";
import { handleBuildImage } from "@/app/utility/handleBuildImage";

export const ProductCardCheckout = ({
  product,
}: {
  product: IProductWithQuantity;
}) => {
  const router = useRouter();

  const handleProductRoute = () => {
    if (product?.slug) {
      router.push(`/products/${product.slug}`);
    }
  };

  const unitPrice = product?.sale ? product?.salePrice : product?.price;
  const totalPrice = (unitPrice || 0) * (product?.quantity || 1);

  return (
    <div
      onClick={handleProductRoute}
      className="group flex items-center justify-between gap-3.5 rounded-2xl border border-border-subtle/80 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-surface-forest/30 hover:shadow-bento cursor-pointer"
    >
      <div className="flex items-center gap-3">
        {/* Product Thumbnail Frame */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-bento/60 p-1.5">
          <Image
            src={handleBuildImage(
              product?.productImage,
              "/products/edudrop-bottle.webp"
            )}
            alt={product?.title || "Classroom essential"}
            fill
            sizes="64px"
            className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Title & Qty */}
        <div>
          <h4 className="text-xs font-bold leading-snug text-text-ink line-clamp-1 group-hover:text-surface-forest transition-colors sm:text-sm">
            {product?.title}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              Qty: {product?.quantity}
            </span>
            <span className="text-[11px] text-text-body">
              ${unitPrice?.toFixed(2)} / case
            </span>
          </div>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right shrink-0">
        <span className="font-display text-sm font-bold text-text-ink sm:text-base">
          ${totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ProductCardCheckout;
