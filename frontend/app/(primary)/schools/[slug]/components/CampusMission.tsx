import React from "react";
import Image from "next/image";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { Droplets, ShieldCheck, HeartHandshake } from "lucide-react";

export const CampusMission = ({ data }: { data: ISchoolInfo }) => {
  const {
    sectionOneTitle,
    sectionOneDescription,
    sectionOneImage,
    sectionOneImageAlt,
    schoolName,
  } = data || {};

  return (
    <BentoCard variant="white" className="p-6 sm:p-8 lg:p-10 border-border-subtle/80">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        {/* Campus Photo */}
        <div className="relative aspect-[4/3] w-full lg:w-5/12 overflow-hidden rounded-2xl bg-surface-bento shrink-0">
          <Image
            src={handleBuildImage(
              sectionOneImage,
              "/school-single/school-single.webp"
            )}
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            alt={sectionOneImageAlt || `${schoolName} Campus`}
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="w-full lg:w-7/12">
          <SectionEyebrow variant="light">
            Campus Profile
          </SectionEyebrow>

          <h2 className="mt-3.5 font-display text-2xl font-bold text-text-ink sm:text-3xl">
            {sectionOneTitle || `${schoolName} Community`}
          </h2>

          <div
            className="mt-3 text-sm leading-relaxed text-text-body sm:text-base [&>br]:my-1"
            dangerouslySetInnerHTML={{
              __html:
                sectionOneDescription ||
                "Excellence in service, wellness, and education.",
            }}
          />

          {/* Quick Pillar Tags */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-bento px-3 py-1.5 text-text-ink">
              <Droplets className="h-3.5 w-3.5 text-surface-forest" />
              Pure Spring Water
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-bento px-3 py-1.5 text-text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-surface-forest" />
              Bursar Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-bento px-3 py-1.5 text-text-ink">
              <HeartHandshake className="h-3.5 w-3.5 text-surface-forest" />
              Alumni Supported
            </span>
          </div>

          <div className="mt-8">
            <ActionPillButton variant="dark" href="/products" size="md">
              Sponsor Classroom Supplies
            </ActionPillButton>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

export default CampusMission;
