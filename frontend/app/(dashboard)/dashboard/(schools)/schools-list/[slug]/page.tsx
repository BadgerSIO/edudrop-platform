import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import SchoolDetailHub from "./components/SchoolDetailHub";

async function getSingleSchoolBySlug(slug: string) {
  try {
    const res = await fetch(`${SERVERURLAPI}/school/${slug}`, {
      next: { tags: ["schoolSinglebyslugCollection"] },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

async function getSingleSchoolInfoBySlug(slug: string) {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return null;
  }
  try {
    const res = await fetch(`${SERVERURLAPI}/school-info/${slug}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
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
