"use client";

import React from "react";
import BrandLogo from "@/app/sharedComponents/ui/BrandLogo";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import { CheckCircle2, Lock, Sparkles, ShieldCheck } from "lucide-react";

interface AuthPillarProps {
  eyebrow?: string;
  title: string;
  description: string;
  highlights?: string[];
  mode?: "login" | "register" | "bursar" | "admin";
}

const defaultHighlights = [
  "100% Direct Delivery to Verified Schools",
  "Official Signed Receipts & Photo Proof",
  "Instant 501(c)(3) Tax-Deductible Records",
];

export const AuthPillar: React.FC<AuthPillarProps> = ({
  eyebrow = "Verified Direct Sponsorship",
  title,
  description,
  highlights = defaultHighlights,
}) => {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface-forest p-6 sm:p-8 lg:p-9 text-white shadow-bento h-full">
      {/* Subtle Background Glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-lime/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 space-y-4 sm:space-y-5">
        <BrandLogo variant="on-dark" size="sm" showTagline />

        <div>
          <SectionEyebrow variant="dark">{eyebrow}</SectionEyebrow>
        </div>

        <h2 className="font-display text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight text-on-forest leading-snug">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-on-forest-muted leading-relaxed max-w-md">
          {description}
        </p>

        {/* Streamlined Checklist */}
        <div className="space-y-2.5 pt-1">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur-sm"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-lime/20 text-brand-lime">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-on-forest">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Bottom Trust Bar */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-on-forest-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-lime" />
          Direct-to-Bursar Handoff
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Lock className="h-3 w-3 text-brand-lime" />
          256-Bit SSL
        </span>
      </div>
    </div>
  );
};

export default AuthPillar;
