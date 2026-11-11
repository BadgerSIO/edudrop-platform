import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "./handleCookie";
import { safeFetchJson } from "./safeFetchJson";

export async function getSubmissionData(): Promise<{
  data: any[];
  additionalData?: any;
}> {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return { data: [] };
  }
  return safeFetchJson<{ data: any[]; additionalData?: any }>(
    `${SERVERURLAPI}/submissions?limit=150`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["SubmissionDataCollection"] },
      cache: "no-store",
    },
    { data: [] }
  );
}
