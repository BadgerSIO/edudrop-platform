"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { CheckCircle2, MapPin, ShieldCheck, Users } from "lucide-react";

const STATE_ABBR: Record<string, string> = {
  Texas: "TX",
  Colorado: "CO",
  Washington: "WA",
  Massachusetts: "MA",
  California: "CA",
  "New York": "NY",
};

export function extractSchoolMeta(school?: ISchoolInfo): {
  location?: string;
  students?: string;
} {
  if (!school) return {};

  let location = school.schoolStats?.find(
    (s) =>
      s.title.includes("Texas") ||
      s.title.includes("Colorado") ||
      s.title.includes("Massachusetts") ||
      s.title.includes("Washington") ||
      s.title.includes(",")
  )?.title;

  let students = school.schoolStats?.find((s) =>
    s.title.toLowerCase().includes("student")
  )?.title;

  const desc = school.shortDescription || "";

  if (!location && desc) {
    const locMatch = desc.match(/in\s+([A-Z][a-zA-Z\s.]+),\s*([A-Z][a-zA-Z\s]+)/);
    if (locMatch) {
      const city = locMatch[1].trim();
      const rawState = locMatch[2].replace(/[.,].*$/, "").trim();
      const stateAbbr = STATE_ABBR[rawState] || rawState;
      location = `${city}, ${stateAbbr}`;
    }
  } else if (location) {
    for (const [full, abbr] of Object.entries(STATE_ABBR)) {
      if (location.includes(full)) {
        location = location.replace(full, abbr);
      }
    }
  }

  if (!students && desc) {
    const stuMatch = desc.match(/([\d,]+)\+?\s+students/i);
    if (stuMatch) {
      students = `${stuMatch[1]}+ Students`;
    }
  }

  return { location, students };
}

export const SchoolCard = ({ school }: { school: ISchoolInfo }) => {
  const router = useRouter();

  if (!school) return null;

  const { schoolLogo, shortDescription, schoolName, featuredImage, slug } =
    school;

  const { location, students } = extractSchoolMeta(school);

  return (
    <div
      onClick={() => router.push(`/schools/${slug}`)}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-bento transition-all duration-300 hover:-translate-y-1 hover:border-surface-forest/30 hover:shadow-bento-hover cursor-pointer"
    >
      <div>
        {/* Outer relative wrapper so the overlapping crest badge is never clipped by overflow-hidden */}
        <div className="relative">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-bento">
            <Image
              src={handleBuildImage(
                featuredImage,
                "/school/banner-image-gallery-page.webp"
              )}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={schoolName || "School Campus"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle top gradient for badge contrast */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent"
              aria-hidden="true"
            />

            {/* Top Verification Pill */}
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-surface-forest/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-lime" />
                Verified Campus
              </span>
            </div>
          </div>

          {/* Unclipped School Crest Emblem overlapping bottom-right of image */}
          <div className="absolute -bottom-6 right-5 z-10 h-16 w-16 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <Image
              src={handleBuildImage(schoolLogo, "/home/s1.webp")}
              fill
              sizes="64px"
              alt={`${schoolName} crest`}
              className="object-contain p-1.5"
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 pt-7 sm:p-7 sm:pt-8">
          {/* Quick Info Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-text-body">
            {location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-bento px-2.5 py-1 text-text-ink font-semibold">
                <MapPin className="h-3 w-3 text-surface-forest" />
                {location}
              </span>
            )}
            {students && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-bento px-2.5 py-1 text-text-body">
                <Users className="h-3 w-3 text-surface-forest" />
                {students}
              </span>
            )}
          </div>

          {/* School Name */}
          <h2 className="mt-3 text-xl font-bold leading-snug text-text-ink transition-colors group-hover:text-surface-forest line-clamp-2 min-h-[3.2rem]">
            {schoolName}
          </h2>

          {/* Concise Mission Excerpt */}
          <p className="mt-2 text-sm leading-relaxed text-text-body line-clamp-3">
            {shortDescription ||
              "Verified partner school requesting direct deliveries of bottled pure spring water and essential classroom sanitization packs."}
          </p>
        </div>
      </div>

      {/* Footer Action Row */}
      <div className="border-t border-border-subtle/70 px-6 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-forest">
            <ShieldCheck className="h-4 w-4 text-surface-forest" />
            Direct Bursar Portal
          </span>
          <ActionPillButton
            href={`/schools/${slug}`}
            variant="dark"
            size="sm"
            className="pointer-events-none group-hover:bg-brand-lime group-hover:text-surface-forest"
          >
            Sponsor Campus
          </ActionPillButton>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
