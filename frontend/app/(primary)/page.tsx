import Hero from "./components/Hero";
import WeSupport from "./components/WeSupport";
import SchoolSupportedWrapper from "./components/wrappers/SchoolSupportedWrapper";
import SupportYourSchool from "./components/SupportYourSchool";
import OurWorks from "./components/OurWorks";
import OurClientsSays from "./components/OurClientsSays";
import Contact from "./components/Contact";
import CommonLoader from "../sharedComponents/Loders/CommonLoader";
import { Suspense } from "react";
import {
  ourWorkData as defaultOurWorkData,
  testimonialsData as defaultTestimonialsData,
  contactInfoData as defaultContactInfoData,
} from "./data/staticHomeData";
import { SERVERURLAPI } from "@/lib/constants";

async function getCMSData() {
  try {
    const res = await fetch(`${SERVERURLAPI}/cms`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data;
  } catch {
    return null;
  }
}

export default async function Home() {
  const cms = await getCMSData();

  const heroMetric = cms?.hero
    ? {
        totalSponsored: cms.hero.totalSponsored,
        progressPercent: cms.hero.progressPercent,
        donorCount: cms.hero.donorCount,
        partnerSchoolCount: cms.hero.partnerSchoolCount,
        highlightText: cms.hero.highlightText,
      }
    : undefined;

  const trustStrip = cms?.hero?.trustStrip;
  const whyEduDrop = cms?.whyEduDrop;
  const howItWorks = cms?.howItWorks;
  const ourWorks = cms?.ourWorks && cms.ourWorks.length > 0 ? cms.ourWorks : defaultOurWorkData;
  const testimonials =
    cms?.testimonials && cms.testimonials.length > 0
      ? cms.testimonials
      : defaultTestimonialsData;
  const contactInfo = cms?.contactInfo || defaultContactInfoData;

  return (
    <div className="bg-surface-canvas text-text-ink min-h-screen">
      {/* 1. Asymmetric Split Hero + Single Photo + Frosted Impact Card + Trust Strip */}
      <Hero metricData={heroMetric} trustStrip={trustStrip} />

      {/* 2. 'Why EduDrop' Bento Split Section (Merged Story & We Support with Floating Tags) */}
      <WeSupport data={whyEduDrop} />

      {/* 3. Active Partner Schools (Bento Grid connected to dynamic API) */}
      <Suspense fallback={<CommonLoader />}>
        <SchoolSupportedWrapper />
      </Suspense>

      {/* 4. 3-Step Direct Sponsorship Process Bento Grid */}
      <SupportYourSchool steps={howItWorks} />

      {/* 5. Verified Campus Deliveries Gallery with Lightbox */}
      <OurWorks data={ourWorks} />

      {/* 6. Donor & Educator Testimonials */}
      <OurClientsSays data={testimonials} />

      {/* 7. Conversion Emerald Banner + Streamlined Contact Form */}
      <Contact data={contactInfo} />
    </div>
  );
}
