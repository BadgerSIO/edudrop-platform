"use client";
import React from "react";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import Reveal from "@/app/sharedComponents/ui/Reveal";
import { howItWorksSteps as defaultSteps, IProcessStep } from "../data/staticHomeData";
import { School, ShoppingBag, Truck } from "lucide-react";

const stepIcons = [
  <School key="1" className="h-6 w-6 text-surface-forest" />,
  <ShoppingBag key="2" className="h-6 w-6 text-surface-forest" />,
  <Truck key="3" className="h-6 w-6 text-surface-forest" />,
];

interface SupportYourSchoolProps {
  steps?: IProcessStep[];
}

const SupportYourSchool = ({ steps }: SupportYourSchoolProps) => {
  const processSteps = steps && steps.length > 0 ? steps : defaultSteps;
  return (
    <section className="bg-surface-canvas py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="How It Works"
            title="Direct School Sponsorship in 3 Simple Steps"
            subtitle="No complex paperwork. Choose a campus, sponsor verified classroom essentials, and receive photo proof of delivery."
          />
        </Reveal>

        {/* 3-Step Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <Reveal
              key={step.step}
              delayMs={index * 80}
              className="h-full"
            >
              <BentoCard
                variant="bento"
                className="flex h-full flex-col justify-between p-8 hover:shadow-bento-hover transition-all duration-300"
              >
                <div>
                  {/* Step Number & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-border-subtle">
                      {stepIcons[index]}
                    </div>
                    <span className="font-mono text-2xl font-bold text-surface-forest/35">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-body">
                    {step.description}
                  </p>
                </div>

                {/* Progress indicator pill */}
                <div className="mt-8 pt-4 border-t border-border-subtle/60 flex items-center gap-2 text-xs font-semibold text-surface-forest">
                  <span className="h-2 w-2 rounded-full bg-brand-lime" />
                  <span>Step {step.step} of 03</span>
                </div>
              </BentoCard>
            </Reveal>
          ))}
        </div>

        {/* Action Row */}
        <div className="mt-12 text-center">
          <ActionPillButton variant="lime" size="lg" href="/schools">
            Start Sponsoring a School
          </ActionPillButton>
        </div>
      </div>
    </section>
  );
};

export default SupportYourSchool;
