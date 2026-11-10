"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import FloatingPillTags from "@/app/sharedComponents/ui/FloatingPillTags";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import Reveal from "@/app/sharedComponents/ui/Reveal";
import { whyEduDropData as defaultWhyEduDrop, IWhyEduDrop } from "../data/staticHomeData";
import { ArrowRight } from "lucide-react";

interface WeSupportProps {
  data?: IWhyEduDrop;
}

const WeSupport = ({ data }: WeSupportProps) => {
  const content = data || defaultWhyEduDrop;
  return (
    <section className="bg-surface-canvas py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Soft Bento Card with Eyebrow, Heading & Tagged Photo */}
          <Reveal className="lg:col-span-6">
            <BentoCard variant="bento" className="p-6 sm:p-8 lg:p-10">
              <SectionEyebrow variant="light">
                {content.eyebrow}
              </SectionEyebrow>
              <h2 className="mt-5 text-h2 font-bold tracking-tight text-text-ink">
                {content.heading}
              </h2>

              {/* Photo with Overlaid Floating Pill Tags */}
              <div className="relative mt-8 min-h-[280px] sm:min-h-[340px] w-full overflow-hidden rounded-2xl">
                <Image
                  src={content.image || "/home/w7.webp"}
                  alt="Students smiling with clean classroom water supplies"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                  <FloatingPillTags tags={content.tags || []} />
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* Right Column: High-Conviction Editorial Copy & Actions */}
          <Reveal
            delayMs={90}
            className="flex flex-col items-start gap-6 lg:col-span-6 lg:pl-6"
          >
            <p className="text-lead font-medium text-text-ink">
              {content.leadStatement}
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-text-body">
              {content.body}
            </p>

            {/* Quick Proof Points */}
            <div className="my-2 grid w-full grid-cols-2 gap-6 border-y border-border-subtle py-6">
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-surface-forest">
                  48 Schools
                </span>
                <span className="mt-1 block text-xs sm:text-sm font-medium text-text-body">
                  Verified active campuses
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-surface-forest">
                  100% Direct
                </span>
                <span className="mt-1 block text-xs sm:text-sm font-medium text-text-body">
                  Zero administrative diversion
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <ActionPillButton variant="dark" size="md" href="/schools">
                Browse Partner Schools
              </ActionPillButton>
              <Link
                href="/products"
                className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-text-ink transition-colors hover:text-surface-forest"
              >
                <span>Explore Supplies</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default WeSupport;
