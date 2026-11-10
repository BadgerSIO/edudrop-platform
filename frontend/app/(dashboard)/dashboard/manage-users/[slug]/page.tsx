import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import UserDetailHub from "./components/UserDetailHub";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

async function getSingleUser(id: string) {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return null;
  }
  try {
    const res = await fetch(`${SERVERURLAPI}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
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

const ManageUserSingle = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const result = await getSingleUser(slug);
  const user = result?.data;

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <h2 className="text-base font-bold">User Record Unavailable</h2>
        <p className="mt-1 text-xs">
          The requested user account was not found or you lack administrative authorization to inspect it.
        </p>
        <Link
          href="/dashboard/manage-users"
          className="mt-4 inline-block rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow"
        >
          Return to Users Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserDetailHub user={user} />
    </div>
  );
};

export default ManageUserSingle;
