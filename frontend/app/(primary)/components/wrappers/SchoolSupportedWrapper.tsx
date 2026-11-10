import { SERVERURLAPI } from "@/lib/constants";
import React from "react";
import SchoolSupported from "../SchoolSupported";
export async function getSchoolInfo() {
  const res = await fetch(`${SERVERURLAPI}/school-info/get-all`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}
const SchoolSupportedWrapper = async () => {
  const data = await getSchoolInfo();
  return <SchoolSupported schools={data?.data} />;
};

export default SchoolSupportedWrapper;
