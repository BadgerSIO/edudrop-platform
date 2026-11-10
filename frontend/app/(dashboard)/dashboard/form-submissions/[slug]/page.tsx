import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import InboxDetailHub from "@/app/sharedComponents/inbox/InboxDetailHub";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

async function getSubmissionDataById(id: string) {
  try {
    const jwt = await getCookie("jwt");
    if (!jwt) {
      return null;
    }
    const res = await fetch(`${SERVERURLAPI}/submissions/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["singleSubmission", "SubmissionDataCollection"] },
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

const SubmissionDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const result = await getSubmissionDataById(slug);
  const data = result?.data;

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h2 className="text-base font-bold">Inquiry Message Not Found</h2>
        <p className="mt-1 text-xs">
          The requested message inquiry has been archived or does not exist.
        </p>
        <Link
          href="/dashboard/form-submissions"
          className="mt-4 inline-block rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow"
        >
          Return to Submissions Inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InboxDetailHub
        data={data}
        endpoint="submissions"
        basePath="/dashboard/form-submissions"
        contextLabel="Platform Inquiry"
      />
    </div>
  );
};

export default SubmissionDetails;
