import React from "react";
import Sidebar from "./Sidebar";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";

async function getBursarInboxList() {
  try {
    const jwt = await getCookie("jwt");
    if (!jwt) {
      return { data: [] };
    }
    const res = await fetch(`${SERVERURLAPI}/school-inbox`, {
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

const SidebarWrapper = async () => {
  const data = await getBursarInboxList();
  return <Sidebar propdata={data?.data} />;
};

export default SidebarWrapper;
