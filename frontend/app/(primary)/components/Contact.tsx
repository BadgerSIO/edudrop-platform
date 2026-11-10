"use client";
import React from "react";
import ContactForm from "./ContactForm";
import { IContactInfo } from "@/app/types/ContactInfo";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const Contact = ({ data }: { data: IContactInfo }) => {
  return (
    <section id="contact" className="bg-surface-canvas pb-20 pt-10 sm:pb-28">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-16 sm:space-y-20">
        {/* High-Impact Forest Emerald Conversion Banner */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-surface-forest p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(158,240,26,0.15),transparent_60%)]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-brand-lime">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Empowering School Wellness</span>
              </div>
              <h2 className="text-h2 font-bold tracking-tight text-on-forest">
                Ready to Keep a Classroom Hydrated?
              </h2>
              <p className="text-base sm:text-lg text-on-forest-muted leading-relaxed">
                Start with a single case of pure spring water or set up a recurring
                monthly alumni sponsorship in under two minutes.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <ActionPillButton variant="lime" size="md" href="/schools">
                Start Sponsoring
              </ActionPillButton>
              <ActionPillButton
                variant="outline-glass"
                size="md"
                href="/products"
              >
                View Supplies
              </ActionPillButton>
            </div>
          </div>
        </div>

        {/* Streamlined Bento Contact Split */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Direct Contact Info Bento Card */}
          <div className="lg:col-span-5">
            <BentoCard variant="bento" className="p-8 sm:p-10 space-y-8">
              <div>
                <SectionEyebrow variant="light">Get in Touch</SectionEyebrow>
                <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-text-ink">
                  Partner with EduDrop
                </h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-text-body">
                  Whether you are a school administrator looking to enroll your
                  campus or a community partner wanting to sponsor local classrooms,
                  our team is ready to assist.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Phone Card */}
                <a
                  href={`tel:${data?.phone}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-border-subtle/80 transition-all hover:border-surface-forest hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-colors group-hover:bg-surface-forest group-hover:text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Phone Number
                    </span>
                    <span className="font-semibold text-text-ink text-sm sm:text-base">
                      {data?.phone}
                    </span>
                  </div>
                </a>

                {/* Email Card */}
                <a
                  href={`mailto:${data?.email}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-border-subtle/80 transition-all hover:border-surface-forest hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-colors group-hover:bg-surface-forest group-hover:text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Email Address
                    </span>
                    <span className="font-semibold text-text-ink text-sm sm:text-base">
                      {data?.email}
                    </span>
                  </div>
                </a>

                {/* Location Card */}
                <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-border-subtle/80">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Headquarters
                    </span>
                    <span className="text-xs sm:text-sm text-text-ink font-medium">
                      {data?.location}
                    </span>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Right Column: Contact Form Bento Card */}
          <div className="lg:col-span-7">
            <BentoCard variant="white" className="p-8 sm:p-10 shadow-bento">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink mb-6">
                Send Us a Message
              </h3>
              <ContactForm id="" />
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
