import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "./components/Hero";
import CampusMission from "./components/CampusMission";
import PrincipalWelcome from "./components/PrincipalWelcome";
import Contact from "./components/Contact";
import InfoSidebar from "./components/InfoSidebar";
import SchoolGallery from "./components/SchoolGallery";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";

async function getSingleSchoolInfoBySlug(slug: string) {
  return safeFetchJson<{ data?: ISchoolInfo } | null>(
    `${SERVERURLAPI}/school-info/single-optimized/${slug}`,
    {
      next: { tags: ["schoolInfoCollection"] },
      cache: "no-store",
    },
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const school = await getSingleSchoolInfoBySlug(slug);
    const data = school?.data;
    return {
      title: `${data?.schoolName || "Partner School"} | EduDrop Foundation`,
      description:
        data?.shortDescription ||
        `Sponsor classroom hydration and essential supplies directly for ${data?.schoolName || "verified partner schools"}.`,
    };
  } catch {
    return {
      title: "Partner School | EduDrop Foundation",
      description: "Sponsor classroom hydration and essential supplies directly.",
    };
  }
}

const SingleSchool = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const school = await getSingleSchoolInfoBySlug(slug);
  const schoolData = school?.data;

  if (!schoolData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-surface-canvas">
      <Hero data={schoolData} />

      <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Main Column */}
          <div className="space-y-10 lg:col-span-8">
            <CampusMission data={schoolData} />
            <PrincipalWelcome data={schoolData} />
            {schoolData?.gallery && schoolData.gallery.length > 0 && (
              <SchoolGallery data={schoolData} />
            )}
            <Contact propData={schoolData} />
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4">
            <InfoSidebar data={schoolData} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default SingleSchool;
