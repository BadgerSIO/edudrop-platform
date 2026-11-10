import React from "react";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Quote, Sparkles } from "lucide-react";

export const PrincipalWelcome = ({ data }: { data: ISchoolInfo }) => {
  const {
    sectionTwoTitle,
    sectionTwoDescription,
    principal,
    schoolName,
  } = data || {};

  return (
    <BentoCard
      variant="white"
      className="relative overflow-hidden border-border-subtle/80 p-6 sm:p-8 lg:p-10"
    >
      {/* Decorative large quote in background */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 text-surface-forest/[0.04]">
        <Quote className="h-44 w-44" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <SectionEyebrow variant="light">
            Campus Leadership
          </SectionEyebrow>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-lime/30 text-surface-forest">
            <Quote className="h-5 w-5" />
          </div>
        </div>

        <h3 className="mt-4 font-display text-2xl font-bold text-text-ink sm:text-3xl">
          {sectionTwoTitle || "Principal's Welcome"}
        </h3>

        {/* Message */}
        <blockquote className="mt-4 border-l-2 border-brand-lime pl-4 text-base italic leading-relaxed text-text-body sm:text-lg">
          &ldquo;{sectionTwoDescription}&rdquo;
        </blockquote>

        {/* Author sign-off & assurance row */}
        <div className="mt-8 flex flex-col gap-6 border-t border-border-subtle/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-text-ink sm:text-base">
              {principal || "School Principal"}
            </p>
            <p className="text-xs text-text-muted sm:text-sm">
              Head of School • {schoolName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ActionPillButton variant="dark" href="/products" size="sm">
              Sponsor Water Cases
            </ActionPillButton>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

export default PrincipalWelcome;
