import React from "react";
import { ChevronDown } from "lucide-react";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import SectionHeader from "@/app/sharedComponents/ui/SectionHeader";

const faqItems = [
  {
    question: "How do I message a specific school bursar?",
    answer:
      "Open the partner school page under Schools and submit the form at the bottom. Messages go straight to that bursar's dashboard inbox.",
  },
  {
    question: "How do I track a supply delivery?",
    answer:
      "Sign in to your Donor Dashboard and open My Orders. Each order lists status updates from Pending to Delivered.",
  },
  {
    question: "How can a school join EduDrop?",
    answer:
      "Select School & Bursar Onboarding in the form above. Include the school name, city, and principal or bursar contact details.",
  },
  {
    question: "How do bulk or corporate matching orders work?",
    answer:
      "Select Bulk & Corporate Giving above with your target campus and supply volume. Our operations team coordinates delivery dates.",
  },
  {
    question: "How are sponsored funds allocated?",
    answer:
      "100% of sponsored item totals convert into physical supplies delivered directly to the selected school bursar.",
  },
];

export const ContactFAQ = () => {
  return (
    <section
      id="faq"
      aria-labelledby="contact-faq-heading"
      className="scroll-mt-24 border-t border-border-subtle/70 bg-surface-bento/60 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-10">
        <SectionHeader
          eyebrow="Common Questions"
          title="Frequently Asked Questions"
          titleId="contact-faq-heading"
          subtitle="Direct answers on school inquiries, deliveries, and enrollment."
          align="center"
        />

        <BentoCard variant="white" className="mx-auto max-w-4xl p-4 sm:p-8 shadow-bento">
          <div className="contact-faq divide-y divide-border-subtle/80">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-4 first:pt-1 last:pb-1">
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-xl py-1 text-left text-sm sm:text-base font-semibold text-text-ink transition-colors hover:text-surface-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-forest">
                  <span className="flex items-center gap-3">
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-surface-forest -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
                    />
                    <span>{item.question}</span>
                  </span>
                </summary>
                <div className="pl-7 pt-2.5 text-sm leading-relaxed text-text-body">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </BentoCard>
      </div>
    </section>
  );
};

export default ContactFAQ;
