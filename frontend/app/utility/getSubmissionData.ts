import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "./handleCookie";

export async function getSubmissionData() {
  try {
    const jwt = await getCookie("jwt");
    if (!jwt) {
      return { data: [] };
    }
    const res = await fetch(`${SERVERURLAPI}/submissions?limit=150`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["SubmissionDataCollection"] },
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
