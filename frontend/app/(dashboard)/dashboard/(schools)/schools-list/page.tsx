import React from "react";
import Link from "next/link";
import { SERVERURLAPI } from "@/lib/constants";
import { columns } from "./components/columns";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import { ISchool } from "@/app/types/School";
import {
  Building2,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

async function getSchoolList(): Promise<{ data: ISchool[] }> {
  try {
    const res = await fetch(`${SERVERURLAPI}/school`, {
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

const SchoolsList = async () => {
  const result = await getSchoolList();
  const schools: ISchool[] = result?.data || [];

  const totalCampuses = schools.length;
  const activeCampuses = schools.filter((s) => s.active || s.status === "active").length;
  const pendingCampuses = totalCampuses - activeCampuses;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-ink flex items-center gap-2">
            <Building2 className="h-6 w-6 text-surface-forest" />
            Partner Campuses & Schools
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Manage participating public and private school campuses, bursar logins, and verified community profiles.
          </p>
        </div>

        <Link
          href="/dashboard/add-new-school"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-forest px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-surface-forest/90 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-brand-lime" />
          <span>Add Partner School</span>
        </Link>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Total Enrolled Campuses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-bento/60 text-surface-forest">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-text-ink">
              {totalCampuses}
            </span>
            <span className="text-xs text-text-muted">registered</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Verified & Active
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime/20 text-surface-forest">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-surface-forest">
              {activeCampuses}
            </span>
            <span className="text-xs text-text-muted">
              {totalCampuses > 0
                ? `${Math.round((activeCampuses / totalCampuses) * 100)}% active`
                : "0%"}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Pending / Inactive
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700">
              {pendingCampuses}
            </span>
            <span className="text-xs text-text-muted">awaiting verification</span>
          </div>
        </div>
      </div>

      {/* Modern Data Table Bento Box */}
      <div className="rounded-2xl border border-border-subtle bg-white shadow-bento overflow-hidden">
        <DataTable
          columns={columns}
          data={schools}
          searchPlaceholder="Search campus by name, city, bursar..."
        />
      </div>
    </div>
  );
};

export default SchoolsList;
