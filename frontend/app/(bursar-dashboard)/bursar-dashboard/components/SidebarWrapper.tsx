import React from "react";
import Sidebar from "./Sidebar";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import { safeFetchJson } from "@/app/utility/safeFetchJson";

async function getBursarInboxList() {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return { data: [] };
  }
  return safeFetchJson<{ data: any[]; additionalData?: { unreadCount?: number } }>(
    `${SERVERURLAPI}/school-inbox`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["bursarInboxCollection", "getInbox"] },
      cache: "no-store",
    },
    { data: [] }
  );
}

const SidebarWrapper = async () => {
  const data = await getBursarInboxList();
  return (
    <Sidebar
      propdata={data?.data}
      unreadCount={data?.additionalData?.unreadCount}
    />
  );
};

export default SidebarWrapper;
