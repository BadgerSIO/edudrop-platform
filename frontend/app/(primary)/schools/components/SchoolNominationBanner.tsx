import React from "react";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";

export const SchoolNominationBanner = () => {
  return (
    <section className="bg-surface-canvas pb-16 sm:pb-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-surface-forest px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16 shadow-bento">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand-lime/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <SectionEyebrow variant="dark">Campus Network</SectionEyebrow>
              <h2 className="mt-4 text-h2 font-semibold tracking-tight text-on-forest">
                Don&apos;t See Your School or Alma Mater?
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-on-forest-muted">
                Nominate your local school or connect your school&apos;s bursar to
                establish a direct, verified classroom hydration delivery
                channel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <ActionPillButton
                variant="lime"
                href="/#contact"
                size="md"
                className="whitespace-nowrap"
              >
                Nominate a School
              </ActionPillButton>
              <ActionPillButton
                variant="outline-glass"
                href="/#contact"
                size="md"
                className="whitespace-nowrap"
              >
                Bursar Enrollment
              </ActionPillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolNominationBanner;
