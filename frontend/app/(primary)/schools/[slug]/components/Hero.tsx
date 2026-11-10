import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { CheckCircle2, ChevronRight, MapPin, Users } from "lucide-react";

export const Hero = ({ data }: { data: ISchoolInfo }) => {
  const { schoolName, schoolLogo, schoolStats } = data || {};

  // Extract location and student body
  const locationStat = schoolStats?.find(
    (s) =>
      s.title.includes("Texas") ||
      s.title.includes("Colorado") ||
      s.title.includes("Massachusetts") ||
      s.title.includes("Washington") ||
      s.title.includes(",")
  )?.title;

  const studentStat = schoolStats?.find((s) =>
    s.title.toLowerCase().includes("student")
  )?.title;

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
            href="/schools"
            className="transition-colors hover:text-on-forest"
          >
            Partner Schools
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="truncate font-semibold text-on-forest">
            {schoolName}
          </span>
        </nav>

        {/* Hero Header Row */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* School Crest Badge */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white p-2 shadow-xl sm:h-20 sm:w-20">
              <Image
                src={handleBuildImage(schoolLogo, "/home/s1.webp")}
                alt={`${schoolName} crest`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </div>

            {/* Title & Metadata */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-on-forest backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime" />
                  Verified Partner School
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-lime/20 px-3 py-1 text-xs font-semibold text-brand-lime">
                  Active Requisition
                </span>
              </div>

              <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-on-forest sm:text-3xl lg:text-4xl">
                {schoolName}
              </h1>

              {/* Location & Details */}
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-medium text-on-forest-muted sm:text-sm">
                {locationStat && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand-lime" />
                    {locationStat}
                  </span>
                )}
                {studentStat && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand-lime" />
                    {studentStat}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" />
                  100% Direct Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ActionPillButton
              variant="lime"
              href="/products"
              size="md"
              className="whitespace-nowrap"
            >
              Sponsor Supplies
            </ActionPillButton>
            <ActionPillButton
              variant="outline-glass"
              href="#contact-bursar"
              size="md"
              className="whitespace-nowrap"
            >
              Contact Bursar
            </ActionPillButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
