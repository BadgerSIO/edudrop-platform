import React, { Suspense } from "react";
import { Metadata } from "next";
import { SERVERURLAPI } from "@/lib/constants";
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
  try {
    const res = await fetch(`${SERVERURLAPI}/cms`, {
      cache: "no-store",
    });
    if (!res.ok) return defaultContactInfoData;
    const json = await res.json();
    return json?.data?.contactInfo || defaultContactInfoData;
  } catch {
    return defaultContactInfoData;
  }
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
