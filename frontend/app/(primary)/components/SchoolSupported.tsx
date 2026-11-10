"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const SchoolSupported = ({ schools }: { schools: ISchoolInfo[] }) => {
  const router = useRouter();
  const displaySchools = schools?.slice(0, 8) || [];

  return (
    <section className="border-y border-border-subtle bg-surface-bento/60 py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          eyebrow="Partner Campuses"
          title="Sponsor a Verified School"
          subtitle="Choose an active partner school below to view their bursar's live classroom water and supply requests."
          action={
            <ActionPillButton variant="dark" href="/schools">
              View All Schools
            </ActionPillButton>
          }
        />

        {/* Responsive Bento School Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displaySchools.map((school) => (
            <div
              key={school?.slug}
              onClick={() => router.push(`/schools/${school?.slug}`)}
              className="group cursor-pointer"
            >
              <BentoCard
                variant="white"
                className="flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-surface-forest/30 hover:shadow-bento-hover"
              >
                <div>
                  {/* Card Header with Crest and Verification Pill */}
                  <div className="flex items-center justify-between gap-3 border-b border-border-subtle/70 pb-5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-bento p-2">
                      <Image
                        src={handleBuildImage(
                          school?.schoolLogo,
                          "/home/s1.webp"
                        )}
                        alt={school.schoolName}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-forest/10 px-3 py-1 text-xs font-semibold text-surface-forest">
                      <CheckCircle2 className="h-3.5 w-3.5 text-surface-forest" />
                      Verified
                    </span>
                  </div>

                  {/* School Name & Needs Description */}
                  <div className="mt-5">
                    <h3 className="text-lg font-bold leading-snug text-text-ink transition-colors group-hover:text-surface-forest line-clamp-2 min-h-[3.1rem]">
                      {school?.schoolName}
                    </h3>
                    <p className="mt-2 text-sm text-text-body leading-relaxed line-clamp-3">
                      {school?.shortDescription ||
                        "Active classroom hydration and sanitization supply requests verified by the school bursar."}
                    </p>
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="mt-6 flex items-center justify-between border-t border-border-subtle/70 pt-4 text-sm font-semibold text-surface-forest">
                  <span>Sponsor Campus</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-forest text-white transition-all duration-300 group-hover:bg-brand-lime group-hover:text-surface-forest group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </BentoCard>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <ActionPillButton
            variant="dark"
            href="/schools"
            className="w-full justify-center"
          >
            View All Schools
          </ActionPillButton>
        </div>
      </div>
    </section>
  );
};

export default SchoolSupported;
