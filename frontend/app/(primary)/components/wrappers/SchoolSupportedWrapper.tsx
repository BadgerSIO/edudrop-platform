import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import React from "react";
import SchoolSupported from "../SchoolSupported";
export async function getSchoolInfo() {
  return safeFetchJson(
    `${SERVERURLAPI}/school-info/get-all`,
    { cache: "no-store" },
    { data: [] }
  );
}
const SchoolSupportedWrapper = async () => {
  const data = await getSchoolInfo();
  return <SchoolSupported schools={data?.data} />;
};

export default SchoolSupportedWrapper;
