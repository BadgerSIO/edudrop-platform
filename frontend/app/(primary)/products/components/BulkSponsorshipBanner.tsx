import React from "react";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";

export const BulkSponsorshipBanner = () => {
  return (
    <section className="bg-surface-bento/60 pb-20 sm:pb-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-surface-forest px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 shadow-bento">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand-lime/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <SectionEyebrow variant="dark">
                Institutional & Alumni Giving
              </SectionEyebrow>
              <h2 className="mt-4 font-display text-h2 text-on-forest">
                Sponsoring an Entire Grade or School Campus?
              </h2>
              <p className="mt-4 text-base font-normal leading-relaxed text-on-forest-muted sm:text-lg">
                Coordinate recurring semester hydration deliveries, high-capacity
                dispensers, or corporate match sponsorships directly with our
                verified bursar network.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <ActionPillButton
                variant="lime"
                href="/contact?topic=bulk"
                size="lg"
                className="whitespace-nowrap"
              >
                Inquire Bulk Sponsorship
              </ActionPillButton>
              <ActionPillButton
                variant="outline-glass"
                href="/schools"
                size="lg"
                className="whitespace-nowrap"
              >
                View Partner Schools
              </ActionPillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BulkSponsorshipBanner;
