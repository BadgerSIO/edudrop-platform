import React from "react";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import { PackageCheck, Droplets, School } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Droplets,
    title: "Select Classroom Supplies",
    description:
      "Choose pure spring water cases, water stands, or sanitization packs tailored to school wellness needs.",
  },
  {
    step: "02",
    icon: School,
    title: "Designate a Partner School",
    description:
      "Choose your preferred partner school during checkout or let EduDrop route supplies to the campus with highest urgency.",
  },
  {
    step: "03",
    icon: PackageCheck,
    title: "Direct Delivery & Photo Proof",
    description:
      "Supplies are delivered straight to the bursar with zero diversion. Photo receipts and delivery sign-offs are published online.",
  },
];

export const SupplyImpactReassurance = () => {
  return (
    <section className="border-t border-border-subtle bg-surface-bento/60 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHeader
          eyebrow="Transparent Logistics"
          title="How Your Supply Sponsorship Works"
          subtitle="A transparent direct-to-classroom distribution model with verified bursar receipts."
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <BentoCard
                key={idx}
                variant="white"
                className="flex flex-col justify-between border-border-subtle/80 p-8 shadow-bento"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-sm font-bold text-text-body">
                      {st.step}
                    </span>
                  </div>
                  <h4 className="mt-6 text-lg font-bold text-text-ink">
                    {st.title}
                  </h4>
                  <p className="mt-2.5 text-sm leading-relaxed text-text-body">
                    {st.description}
                  </p>
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SupplyImpactReassurance;
