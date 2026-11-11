import React, { Suspense } from "react";
import { Metadata } from "next";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { contactInfoData as defaultContactInfoData } from "../data/staticHomeData";
import { IContactInfo } from "@/app/types/ContactInfo";
import CommonLoader from "@/app/sharedComponents/Loders/CommonLoader";
import ContactHero from "./components/ContactHero";
import ContactWorkspace from "./components/ContactWorkspace";
import ContactFAQ from "./components/ContactFAQ";

export const metadata: Metadata = {
  title: "Contact EduDrop | EduDrop Foundation",
  description:
    "Send donor support, school onboarding, or bulk sponsorship inquiries to EduDrop Foundation.",
};

async function getContactInfo(): Promise<IContactInfo> {
  const json = await safeFetchJson<{ data?: { contactInfo?: IContactInfo } } | null>(
    `${SERVERURLAPI}/cms`,
    { cache: "no-store" },
    null
  );
  return json?.data?.contactInfo || defaultContactInfoData;
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo();

  return (
    <main className="min-h-screen bg-surface-canvas">
      <ContactHero />
      <Suspense fallback={<CommonLoader />}>
        <ContactWorkspace contactInfo={contactInfo} />
      </Suspense>
      <ContactFAQ />
    </main>
  );
}
