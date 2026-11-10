import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import InboxDirectory from "@/app/sharedComponents/inbox/InboxDirectory";
import { ISubmissions } from "@/app/types/submission";

async function getBursarInbox(): Promise<{
  data: ISubmissions[];
  additionalData?: any;
}> {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return { data: [] };
  }
  try {
    const res = await fetch(`${SERVERURLAPI}/school-inbox?limit=150`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["bursarInboxCollection", "getInbox"] },
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

const BursarInbox = async () => {
  const result = await getBursarInbox();
  const submissions = result?.data || [];
  const kpis = result?.additionalData;

  return (
    <div className="space-y-6">
      <InboxDirectory
        initialData={submissions}
        kpis={kpis}
        endpoint="school-inbox"
        basePath="/bursar-dashboard/inbox"
        title="Campus Inquiries & Communications"
        description="Review community messages, parent inquiries, and questions submitted directly to your campus."
      />
    </div>
  );
};

export default BursarInbox;
