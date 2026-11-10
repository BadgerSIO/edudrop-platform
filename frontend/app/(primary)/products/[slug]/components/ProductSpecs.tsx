import React from "react";
import { IProduct } from "@/app/types/Product";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import { CheckCircle2, ShieldCheck, Box } from "lucide-react";

export const ProductSpecs = ({ product }: { product: IProduct }) => {
  const hasBenefits = product?.benefits && product.benefits.length > 0;
  const hasDetails = product?.productDetails && product.productDetails.length > 0;

  return (
    <BentoCard variant="white" className="p-6 sm:p-8 lg:p-10 border-border-subtle/80 space-y-8">
      {/* Overview */}
      <div>
        <SectionEyebrow variant="light">
          Classroom Specifications
        </SectionEyebrow>
        <h3 className="mt-3.5 font-display text-2xl font-bold text-text-ink sm:text-3xl">
          Product Overview & Impact
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-body sm:text-base">
          {product?.description ||
            "Pure, refreshing hydration and wellness essentials packaged specifically for classroom delivery and student wellness."}
        </p>
      </div>

      {/* Benefits Grid */}
      {hasBenefits && (
        <div className="border-t border-border-subtle/70 pt-6">
          <h4 className="flex items-center gap-2 font-display text-lg font-bold text-text-ink">
            <ShieldCheck className="h-5 w-5 text-surface-forest" />
            Classroom Wellness Benefits
          </h4>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.benefits.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl bg-surface-bento/60 p-3.5 text-sm text-text-body"
              >
                <CheckCircle2 className="h-4 w-4 text-surface-forest shrink-0 mt-0.5" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packaging & Details Grid */}
      {hasDetails && (
        <div className="border-t border-border-subtle/70 pt-6">
          <h4 className="flex items-center gap-2 font-display text-lg font-bold text-text-ink">
            <Box className="h-5 w-5 text-surface-forest" />
            Packaging & Delivery Specifications
          </h4>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.productDetails.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl bg-surface-bento/60 p-3.5 text-sm text-text-body"
              >
                <span className="h-2 w-2 rounded-full bg-brand-lime shrink-0 mt-1.5" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </BentoCard>
  );
};

export default ProductSpecs;
