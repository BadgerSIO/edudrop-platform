import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import InboxDetailHub from "@/app/sharedComponents/inbox/InboxDetailHub";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

async function getInboxDataById(id: string) {
  try {
    const jwt = await getCookie("jwt");
    if (!jwt) {
      return null;
    }
    const res = await fetch(`${SERVERURLAPI}/school-inbox/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["schoolSingleInbox", "bursarInboxCollection"] },
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

const InboxDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const result = await getInboxDataById(slug);
  const data = result?.data;

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h2 className="text-base font-bold">Campus Inquiry Not Found</h2>
        <p className="mt-1 text-xs">
          The requested message inquiry has been archived or does not belong to your campus.
        </p>
        <Link
          href="/bursar-dashboard/inbox"
          className="mt-4 inline-block rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow"
        >
          Return to Campus Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InboxDetailHub
        data={data}
        endpoint="school-inbox"
        basePath="/bursar-dashboard/inbox"
        contextLabel="Campus Inquiry"
      />
    </div>
  );
};

export default InboxDetails;
