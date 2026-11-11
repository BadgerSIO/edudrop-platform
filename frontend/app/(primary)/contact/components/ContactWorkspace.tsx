"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Clock,
  Code2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  School,
} from "lucide-react";
import ContactForm, {
  CONTACT_TOPICS,
} from "@/app/(primary)/components/ContactForm";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import LinkedInIcon from "@/app/sharedComponents/ui/LinkedInIcon";
import SocialLinkPills from "@/app/sharedComponents/ui/SocialLinkPills";
import { DEVELOPER_INFO } from "@/lib/developerInfo";
import { IContactInfo } from "@/app/types/ContactInfo";

const routingCards = [
  {
    slug: "donor",
    topicLabel: "Donor & Order Support",
    icon: PackageCheck,
    title: "Donor & Order Support",
    description:
      "Track deliveries, update recurring gifts, or request donation receipts.",
  },
  {
    slug: "school",
    topicLabel: "School & Bursar Onboarding",
    icon: School,
    title: "School & Bursar Onboarding",
    description:
      "Nominate a school or request bursar portal verification.",
  },
  {
    slug: "bulk",
    topicLabel: "Bulk & Corporate Giving",
    icon: Building2,
    title: "Bulk & Corporate Giving",
    description:
      "Coordinate multi-case orders, dispensers, or company matching gifts.",
  },
];

interface ContactWorkspaceProps {
  contactInfo: IContactInfo;
}

export const ContactWorkspace: React.FC<ContactWorkspaceProps> = ({
  contactInfo,
}) => {
  const searchParams = useSearchParams();
  const topicParam = (searchParams?.get("topic") || "").toLowerCase();

  const resolvedInitialTopic = useMemo(() => {
    const match = CONTACT_TOPICS.find((t) => t.slug === topicParam);
    return match ? match.label : CONTACT_TOPICS[0].label;
  }, [topicParam]);

  const [selectedTopic, setSelectedTopic] = useState<string>(
    resolvedInitialTopic
  );

  useEffect(() => {
    setSelectedTopic(resolvedInitialTopic);
  }, [resolvedInitialTopic]);

  const handleSelectRoutingCard = (topicLabel: string) => {
    setSelectedTopic(topicLabel);
    const formEl = document.getElementById("contact-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="bg-surface-canvas py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-12 sm:space-y-14">
        {/* 1. Inquiry Routing Bento Cards */}
        <div>
          <div className="mb-6">
            <SectionEyebrow variant="light">Select a Department</SectionEyebrow>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
              Route Your Inquiry
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {routingCards.map((card) => {
              const Icon = card.icon;
              const isSelected = selectedTopic === card.topicLabel;
              return (
                <button
                  key={card.slug}
                  type="button"
                  onClick={() => handleSelectRoutingCard(card.topicLabel)}
                  className={`group flex flex-col justify-between rounded-3xl border p-6 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-forest ${
                    isSelected
                      ? "border-surface-forest bg-surface-forest/5 shadow-bento"
                      : "border-border-subtle bg-surface-bento/60 hover:-translate-y-0.5 hover:border-surface-forest/40 hover:bg-white hover:shadow-bento"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                          isSelected
                            ? "border-surface-forest bg-surface-forest text-brand-lime"
                            : "border-border-subtle bg-white text-surface-forest group-hover:bg-surface-forest group-hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <span className="rounded-full bg-brand-lime px-2.5 py-0.5 text-[11px] font-bold text-surface-forest">
                          Selected
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-base sm:text-lg font-bold text-text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-body">
                      {card.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Main Contact Split: Direct Channels + Inquiry Form */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Direct Channels & School Bursar Redirect */}
          <div className="space-y-6 lg:col-span-5">
            <BentoCard variant="bento" className="p-6 sm:p-8 space-y-6">
              <div>
                <SectionEyebrow variant="light">Direct Channels</SectionEyebrow>
                <h2 className="mt-3.5 text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                  Reach EduDrop
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-body">
                  Use phone, email, or office mail for platform inquiries.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Phone */}
                <a
                  href={`tel:${contactInfo?.phone}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border-subtle/80 bg-white p-4 shadow-xs transition-all hover:border-surface-forest hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-colors group-hover:bg-surface-forest group-hover:text-white">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Phone
                    </span>
                    <span className="block truncate text-sm font-semibold text-text-ink">
                      {contactInfo?.phone}
                    </span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${contactInfo?.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border-subtle/80 bg-white p-4 shadow-xs transition-all hover:border-surface-forest hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-colors group-hover:bg-surface-forest group-hover:text-white">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Email
                    </span>
                    <span className="block truncate text-sm font-semibold text-text-ink">
                      {contactInfo?.email}
                    </span>
                  </div>
                </a>

                {/* Office Address */}
                <div className="flex items-center gap-4 rounded-2xl border border-border-subtle/80 bg-white p-4 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Office Address
                    </span>
                    <span className="block text-sm font-medium text-text-ink">
                      {contactInfo?.location}
                    </span>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-center gap-4 rounded-2xl border border-border-subtle/80 bg-white p-4 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-body">
                      Support Hours
                    </span>
                    <span className="block text-sm font-medium text-text-ink">
                      Monday – Friday, 9:00 AM – 5:00 PM CT
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <SocialLinkPills contactInfo={contactInfo} heading="Social Links" />
            </BentoCard>

            {/* Campus Bursar Direct Callout */}
            <BentoCard variant="white" className="p-6 border-border-subtle">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/25 text-surface-forest">
                  <School className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-text-ink">
                      Messaging a specific school?
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-body">
                      Each partner school page has a direct form for its campus
                      bursar.
                    </p>
                  </div>
                  <ActionPillButton
                    variant="outline-dark"
                    size="sm"
                    href="/schools"
                  >
                    Browse Partner Schools
                  </ActionPillButton>
                </div>
              </div>
            </BentoCard>

            {/* Platform Developer Info Card */}
            <BentoCard variant="forest" className="p-6">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-lime/20 text-brand-lime">
                  <Code2 aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-3">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-lime">
                      Platform Developer
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-on-forest">
                      Built by {DEVELOPER_INFO.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-on-forest-muted">
                      Full-stack web application designed and engineered for
                      transparent school sponsorship.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={DEVELOPER_INFO.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Portfolio — ${DEVELOPER_INFO.name} (opens in a new tab)`}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-brand-lime px-3.5 py-1.5 text-xs font-bold text-surface-forest transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-forest"
                    >
                      <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>Portfolio</span>
                      <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-80" />
                    </a>
                    <a
                      href={DEVELOPER_INFO.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn — ${DEVELOPER_INFO.name} (opens in a new tab)`}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-on-forest transition-colors hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface-forest"
                    >
                      <LinkedInIcon className="h-3.5 w-3.5" />
                      <span>LinkedIn</span>
                      <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-80" />
                    </a>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Right Column: Contact Form */}
          <div
            id="contact-form"
            className="scroll-mt-24 lg:col-span-7"
          >
            <BentoCard variant="white" className="p-6 sm:p-10 shadow-bento">
              <div className="mb-6 border-b border-border-subtle/70 pb-5">
                <SectionEyebrow variant="light">Send Inquiry</SectionEyebrow>
                <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                  Submit a Message
                </h2>
                <p className="mt-1.5 text-sm text-text-body">
                  Select a topic and complete the required fields below.
                </p>
              </div>

              <ContactForm
                id=""
                target="platform"
                showTopicSelector
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
              />
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactWorkspace;
