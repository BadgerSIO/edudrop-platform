import ContactForm from "@/app/(primary)/components/ContactForm";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import SectionEyebrow from "@/app/sharedComponents/ui/SectionEyebrow";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import React from "react";

export const Contact = ({ propData }: { propData: ISchoolInfo }) => {
  const { schoolName, bursar } = propData || {};

  // Safely resolve the bursar string ID
  const bursarId =
    typeof bursar === "object"
      ? bursar?._id || bursar?.id || ""
      : typeof bursar === "string"
      ? bursar
      : "";

  const bursarName =
    typeof bursar === "object" && bursar?.name
      ? `${bursar.name.firstName || ""} ${bursar.name.lastName || ""}`.trim()
      : "the Campus Bursar";

  return (
    <BentoCard
      id="contact-bursar"
      variant="white"
      className="scroll-mt-28 p-6 sm:p-8 lg:p-10 border-border-subtle/80"
    >
      <div className="max-w-2xl">
        <SectionEyebrow variant="light">
          Direct Bursar Communication
        </SectionEyebrow>
        <h3 className="mt-3.5 font-display text-2xl font-bold text-text-ink sm:text-3xl">
          Coordinate Directly with {bursarName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-body sm:text-base">
          Have questions regarding bulk alumni giving, recurring hydration
          sponsorships, or specific classroom delivery requests for {schoolName}
          ? Your message is delivered directly to the campus bursar for response.
        </p>
      </div>

      <div className="mt-8 border-t border-border-subtle/70 pt-8">
        <ContactForm id={bursarId} />
      </div>
    </BentoCard>
  );
};

export default Contact;
