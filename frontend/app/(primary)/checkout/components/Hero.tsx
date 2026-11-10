import React from "react";
import Link from "next/link";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import { ChevronRight, ShieldCheck, Truck, FileCheck, Lock } from "lucide-react";

export const Hero = () => {
  return (
    <section className="bg-surface-forest py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-xs font-semibold text-on-forest-muted"
        >
          <Link
            href="/"
            className="transition-colors hover:text-brand-lime"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <Link
            href="/products"
            className="transition-colors hover:text-brand-lime"
          >
            Classroom Supplies
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          <span className="text-brand-lime">Sponsorship Checkout</span>
        </nav>

        {/* 12-Column Split Header */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Eyebrow + Title + Subtitle */}
          <div className="lg:col-span-7">
            <SectionEyebrow variant="dark">
              Verified Direct Sponsorship
            </SectionEyebrow>

            <h1 className="mt-3.5 font-display text-h2 font-extrabold text-on-forest tracking-tight">
              Complete Your Classroom Sponsorship
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-on-forest-muted sm:text-base max-w-2xl">
              Every dollar converts directly into physical hydration cases and
              essential hygiene kits delivered to verified school bursars with
              zero administrative diversion.
            </p>
          </div>

          {/* Right Column: 2x2 Trust Proof Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-lime shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-forest sm:text-sm">
                    100% Direct Delivery
                  </h4>
                  <p className="text-[11px] text-on-forest-muted">
                    Straight to school gate
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-lime shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-forest sm:text-sm">
                    Bursar Sign-off
                  </h4>
                  <p className="text-[11px] text-on-forest-muted">
                    Official receipt issued
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-lime shrink-0">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-forest sm:text-sm">
                    Tax Deductible
                  </h4>
                  <p className="text-[11px] text-on-forest-muted">
                    Instant 501(c)(3) proof
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-lime shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-forest sm:text-sm">
                    256-Bit SSL
                  </h4>
                  <p className="text-[11px] text-on-forest-muted">
                    Encrypted requisition
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
