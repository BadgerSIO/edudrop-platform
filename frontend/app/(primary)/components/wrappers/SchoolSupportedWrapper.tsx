import { SERVERURLAPI } from "@/lib/constants";
import React from "react";
import SchoolSupported from "../SchoolSupported";
export async function getSchoolInfo() {
  try {
    const res = await fetch(`${SERVERURLAPI}/school-info/get-all`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [] };
    }
    return res.json();
  } catch {
    return { data: [] };
  }
}
const SchoolSupportedWrapper = async () => {
  const data = await getSchoolInfo();
  return <SchoolSupported schools={data?.data} />;
};

export default SchoolSupportedWrapper;
