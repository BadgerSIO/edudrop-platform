import React from "react";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import { Clock, MailCheck, MapPin, School } from "lucide-react";

const quickFacts = [
  {
    icon: Clock,
    title: "Response Window",
    subtitle: "Within 1 business day",
  },
  {
    icon: MailCheck,
    title: "Support Hours",
    subtitle: "Mon–Fri, 9 AM – 5 PM CT",
  },
  {
    icon: School,
    title: "Campus Inquiries",
    subtitle: "Direct on school pages",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    subtitle: "Austin, Texas",
  },
];

export const ContactHero = () => {
  return (
    <section className="relative overflow-hidden bg-surface-forest py-10 sm:py-12 lg:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(158,240,26,0.10),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Eyebrow, Heading & Short Subtitle */}
          <div className="lg:col-span-7">
            <SectionEyebrow variant="dark">EduDrop Contact</SectionEyebrow>

            <h1 className="mt-4 text-h2 font-semibold tracking-tight text-on-forest">
              Contact EduDrop
            </h1>

            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-on-forest-muted">
              Send support, school enrollment, or sponsorship inquiries.
              Responses arrive within one business day.
            </p>
          </div>

          {/* Right: Compact 2x2 Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:col-span-5">
            {quickFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-3.5 sm:p-4 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-on-forest leading-snug">
                      {fact.title}
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-on-forest-muted">
                      {fact.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
