"use client";
import React from "react";
import Image from "next/image";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import {
  heroMetricData as defaultHeroMetric,
  trustStripData as defaultTrustStrip,
  IHeroMetric,
} from "../data/staticHomeData";

interface HeroProps {
  metricData?: IHeroMetric;
  trustStrip?: { metric: string; label: string }[];
}

const Hero = ({ metricData, trustStrip }: HeroProps) => {
  const metrics = metricData || defaultHeroMetric;
  const strip = trustStrip && trustStrip.length > 0 ? trustStrip : defaultTrustStrip;
  return (
    <section className="relative overflow-hidden bg-surface-canvas">
      {/* Top Deep Forest Emerald Surface that wraps the split header and upper hero frame */}
      <div className="relative bg-surface-forest pt-10 pb-36 sm:pt-14 sm:pb-48 lg:pt-20 lg:pb-64">
        {/* Subtle radial emerald highlight */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(158,240,26,0.10),transparent)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
          {/* Asymmetric Split Header matching reference proportions */}
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Large 2-Line Display Headline */}
            <div className="lg:col-span-7">
              <h1 className="text-display font-medium tracking-tight text-on-forest">
                Pure Hydration for
                <br className="hidden sm:block" /> Every Classroom
              </h1>
            </div>

            {/* Right: Concise Persuasive Copy + Electric Lime Pill CTA */}
            <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:pb-1">
              <p className="max-w-md text-base sm:text-lg leading-relaxed text-on-forest-muted">
                Every case of pure spring water and hygiene supplies you sponsor
                is consolidated and delivered straight to verified school bursars.
              </p>
              <ActionPillButton variant="lime" size="md" href="/schools">
                Sponsor a School
              </ActionPillButton>
            </div>
          </div>
        </div>
      </div>

      {/* Wide Rounded Hero Photograph Overlapping the Forest/White Boundary */}
      <div className="relative z-10 mx-auto -mt-28 max-w-[1320px] px-5 sm:-mt-40 sm:px-8 lg:-mt-52">
        <div className="relative aspect-[4/3] w-full max-h-[540px] overflow-hidden rounded-3xl sm:aspect-[16/9] lg:aspect-[21/9] shadow-2xl ring-1 ring-black/5">
          <Image
            src="/home/w2.webp"
            alt="Student drinking pure spring water on campus"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1320px) 100vw, 1320px"
            className="object-cover object-center"
          />

          {/* Subtle vignette for contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
            aria-hidden="true"
          />

          {/* Frosted-Glass Live Impact Card (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-7 sm:left-7 sm:right-auto sm:w-[360px]">
            <div className="rounded-2xl border border-white/20 bg-black/55 p-5 sm:p-6 text-white backdrop-blur-md shadow-glass">
              <span className="text-xs font-medium text-white/80">
                Total school supplies sponsored
              </span>
              <div className="mt-1.5 flex items-baseline justify-between gap-4">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {metrics.totalSponsored}
                </span>
              </div>

              {/* Warm Amber Progress Bar */}
              <div
                className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-white/25"
                role="progressbar"
                aria-valuenow={metrics.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Semester sponsorship goal progress"
              >
                <div
                  className="h-full rounded-full bg-brand-amber"
                  style={{ width: `${metrics.progressPercent}%` }}
                />
              </div>

              {/* Donor & Goal Row */}
              <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-white/85">
                <span>{metrics.donorCount}</span>
                <span>{metrics.progressPercent}%</span>
              </div>
              <p className="mt-2.5 border-t border-white/15 pt-2.5 text-xs text-white/75">
                {metrics.highlightText}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Verification & Impact Strip on White Canvas (Directly Below Hero Photo) */}
        <div className="mt-10 sm:mt-14 rounded-2xl border border-border-subtle bg-surface-bento/50 px-6 py-6 sm:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-border-subtle">
            {strip.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center text-center lg:px-4"
              >
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-surface-forest">
                  {item.metric}
                </span>
                <span className="mt-1 text-xs sm:text-sm font-medium text-text-body">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
