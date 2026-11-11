import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import SchoolDetailHub from "./components/SchoolDetailHub";

async function getSingleSchoolBySlug(slug: string) {
  return safeFetchJson<{ data?: any } | null>(
    `${SERVERURLAPI}/school/${slug}`,
    {
      next: { tags: ["schoolSinglebyslugCollection"] },
      cache: "no-store",
    },
    null
  );
}

async function getSingleSchoolInfoBySlug(slug: string) {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return null;
  }
  return safeFetchJson<{ data?: any } | null>(
    `${SERVERURLAPI}/school-info/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    },
    null
  );
}

const SchoolSingle = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const school = await getSingleSchoolBySlug(slug);
  const schoolinfodetails = await getSingleSchoolInfoBySlug(slug);

  return (
    <div className="space-y-6">
      <SchoolDetailHub
        school={school?.data}
        schoolInfo={schoolinfodetails?.data}
        rTag="schoolSinglebyslugCollection"
        isBursarView={false}
      />
    </div>
  );
};

export default SchoolSingle;
