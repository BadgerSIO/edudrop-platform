import Image from "next/image";
import React from "react";
import ProductPrice from "./ProductPrice";
import ProductSpecs from "./ProductSpecs";
import RelatedProduct from "./RelatedProduct";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { IProduct } from "@/app/types/Product";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import { CheckCircle2 } from "lucide-react";

export const ProductInfo = ({ product }: { product: IProduct }) => {
  return (
    <>
      <section className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 space-y-10">
          {/* Main Top Row: 12-Column Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* Product Image Bento Card */}
            <div className="lg:col-span-5 flex">
              <BentoCard
                variant="white"
                className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-border-subtle/80 p-8 sm:p-12 shadow-bento"
              >
                {/* Verified Delivery Seal */}
                <div className="absolute left-5 top-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle/60 bg-white/95 px-3 py-1 text-xs font-semibold text-surface-forest shadow-sm backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime" />
                    Verified Campus Supply
                  </span>
                </div>

                <div className="relative h-full w-full">
                  <Image
                    src={handleBuildImage(
                      product?.productImage,
                      "/products/edudrop-bottle.webp"
                    )}
                    alt={product?.title || "Classroom essential"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-contain p-6 transition-transform duration-500 hover:scale-105"
                    priority
                  />
                </div>
              </BentoCard>
            </div>

            {/* Product Price & Actions */}
            <div className="lg:col-span-7 flex">
              <ProductPrice product={product} />
            </div>
          </div>

          {/* Product Specifications & Classroom Impact Bento */}
          <ProductSpecs product={product} />
        </div>
      </section>

      {/* Frequently Sponsored Together */}
      <RelatedProduct product={product} />
    </>
  );
};

export default ProductInfo;
