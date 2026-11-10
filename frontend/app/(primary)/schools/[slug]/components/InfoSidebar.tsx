import React from "react";
import Image from "next/image";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const InfoSidebar = ({ data }: { data: ISchoolInfo }) => {
  const {
    schoolName,
    schoolLogo,
    schoolStats,
    achievements,
    principal,
    vicePrincipal,
    bursar,
    schoolWebsiteLink,
  } = data || {};

  // Format bursar display name
  const bursarName =
    typeof bursar === "object" && bursar?.name
      ? `${bursar.name.firstName || ""} ${bursar.name.lastName || ""}`.trim()
      : typeof bursar === "string" && !bursar.startsWith("65")
      ? bursar
      : "Campus Bursar Office";

  return (
    <aside className="space-y-6">
      {/* 1. Quick Campus Snapshot Card */}
      <BentoCard variant="white" className="p-6 border-border-subtle/80">
        <div className="flex items-center gap-4 border-b border-border-subtle/70 pb-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-bento p-1.5 shadow-sm">
            <Image
              src={handleBuildImage(schoolLogo, "/home/s1.webp")}
              alt={`${schoolName} crest`}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Partner
            </span>
            <h4 className="font-display text-base font-bold text-text-ink line-clamp-2">
              {schoolName}
            </h4>
          </div>
        </div>

        {/* Stats List */}
        {schoolStats && schoolStats.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Campus Profile
            </p>
            <ul className="space-y-2.5 text-sm text-text-body">
              {schoolStats.map((st, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-lime shrink-0" />
                  <span>{st.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Website Link */}
        {schoolWebsiteLink && (
          <div className="mt-6 pt-5 border-t border-border-subtle/70">
            <a
              href={schoolWebsiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-surface-forest hover:underline"
            >
              <span>Visit Official School Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </BentoCard>

      {/* 2. Key Achievements Card */}
      {achievements && achievements.length > 0 && (
        <BentoCard variant="white" className="p-6 border-border-subtle/80">
          <div className="flex items-center gap-2 text-surface-forest">
            <Award className="h-5 w-5 text-brand-lime" />
            <h4 className="font-display text-base font-bold text-text-ink">
              Campus Achievements
            </h4>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-text-body">
            {achievements.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl bg-surface-bento/60 p-3"
              >
                <GraduationCap className="h-4 w-4 text-surface-forest shrink-0 mt-0.5" />
                <span className="text-xs font-medium leading-relaxed sm:text-sm">
                  {item.title}
                </span>
              </li>
            ))}
          </ul>
        </BentoCard>
      )}

      {/* 3. Verified Leadership Card */}
      {(principal || vicePrincipal || bursar) && (
        <BentoCard variant="white" className="p-6 border-border-subtle/80">
          <div className="flex items-center gap-2 text-surface-forest">
            <UserCheck className="h-5 w-5 text-brand-lime" />
            <h4 className="font-display text-base font-bold text-text-ink">
              Verified Leadership
            </h4>
          </div>

          <div className="mt-4 divide-y divide-border-subtle/60 text-sm">
            {principal && (
              <div className="py-2.5 first:pt-0">
                <span className="text-xs font-semibold text-text-muted">
                  Principal
                </span>
                <p className="font-semibold text-text-ink">{principal}</p>
              </div>
            )}
            {vicePrincipal && (
              <div className="py-2.5">
                <span className="text-xs font-semibold text-text-muted">
                  Vice Principal
                </span>
                <p className="font-semibold text-text-ink">{vicePrincipal}</p>
              </div>
            )}
            {bursarName && (
              <div className="py-2.5 last:pb-0">
                <span className="text-xs font-semibold text-text-muted">
                  Delivery Sign-Off (Bursar)
                </span>
                <p className="font-semibold text-text-ink flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-surface-forest" />
                  {bursarName}
                </p>
              </div>
            )}
          </div>
        </BentoCard>
      )}

      {/* 4. Sticky Sponsorship Reassurance Box */}
      <div className="sticky top-28 rounded-3xl bg-surface-forest p-6 text-on-forest shadow-bento">
        <h4 className="font-display text-lg font-bold text-on-forest">
          Support {schoolName}
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-on-forest-muted sm:text-sm">
          Every sponsored spring water case and dispenser is tracked and
          delivered straight to this school&apos;s campus bursar.
        </p>
        <div className="mt-5">
          <ActionPillButton
            variant="lime"
            href="/products"
            size="md"
            className="w-full justify-between"
          >
            Sponsor Supplies Now
          </ActionPillButton>
        </div>
      </div>
    </aside>
  );
};

export default InfoSidebar;
