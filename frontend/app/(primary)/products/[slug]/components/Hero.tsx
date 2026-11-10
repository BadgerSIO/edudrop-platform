import React from "react";
import Link from "next/link";
import { IProduct, isICategory } from "@/app/types/Product";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";

export const Hero = ({ product }: { product?: IProduct }) => {
  const categoryTitle = isICategory(product?.category)
    ? product?.category?.title
    : product?.category || "Classroom Essential";

  return (
    <section className="relative overflow-hidden bg-surface-forest py-8 sm:py-10 lg:py-12">
      {/* Subtle radial emerald highlight */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(158,240,26,0.10),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-on-forest-muted sm:text-sm"
        >
          <Link href="/" className="transition-colors hover:text-on-forest">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <Link
            href="/products"
            className="transition-colors hover:text-on-forest"
          >
            Classroom Supplies
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="truncate font-semibold text-on-forest">
            {product?.title || "Product Details"}
          </span>
        </nav>

        {/* Title Row */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <SectionEyebrow variant="dark">{categoryTitle}</SectionEyebrow>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime/20 px-3 py-1 text-xs font-semibold text-brand-lime">
              Verified Classroom Requisition
            </span>
          </div>

          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-on-forest sm:text-3xl lg:text-4xl">
            {product?.title || "Classroom Supply Details"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-forest-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-brand-lime" />
              100% Direct Delivery to Verified School Bursars
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-lime" />
              Photo Confirmation Published to Donor Portal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
