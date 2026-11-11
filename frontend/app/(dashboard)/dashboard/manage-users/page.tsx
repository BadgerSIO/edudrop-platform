import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import UserDirectoryHub from "./components/UserDirectoryHub";
import { Users } from "lucide-react";
import { IUser } from "@/app/types/User";

async function getAllUsers(): Promise<{
  data: IUser[];
  additionalData?: any;
}> {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return { data: [] };
  }
  try {
    const res = await fetch(`${SERVERURLAPI}/user?limit=250`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["manageUsersCollection"] },
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

const ManageUsers = async () => {
  const result = await getAllUsers();
  const users: IUser[] = result?.data || [];
  const kpis = result?.additionalData;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-ink flex items-center gap-2">
            <Users className="h-6 w-6 text-surface-forest" />
            Users & Access Management
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Inspect registered accounts, audit account status, manage credentials, and review platform roles.
          </p>
        </div>
      </div>

      <UserDirectoryHub initialUsers={users} kpis={kpis} />
    </div>
  );
};

export default ManageUsers;
