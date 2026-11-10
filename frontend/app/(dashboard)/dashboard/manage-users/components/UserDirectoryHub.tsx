"use client";

import React, { useState } from "react";
import { IUser } from "@/app/types/User";
import { columns } from "./column";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import { resolveAccountStatus } from "@/app/utility/statusHelpers";
import {
  Users,
  Shield,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  Ban,
} from "lucide-react";

interface UserDirectoryHubProps {
  initialUsers: IUser[];
  kpis?: {
    totalUsers: number;
    donorCount: number;
    bursarCount: number;
    adminCount: number;
    activeCount: number;
    suspendedCount: number;
  };
}

export default function UserDirectoryHub({
  initialUsers = [],
  kpis,
}: UserDirectoryHubProps) {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "suspended">("all");

  const totalUsers = kpis?.totalUsers ?? initialUsers.length;
  const donorCount =
    kpis?.donorCount ?? initialUsers.filter((u) => u.role === "donar").length;
  const bursarCount =
    kpis?.bursarCount ?? initialUsers.filter((u) => u.role === "bursar").length;
  const adminCount =
    kpis?.adminCount ?? initialUsers.filter((u) => u.role === "admin").length;
  const activeCount =
    kpis?.activeCount ??
    initialUsers.filter((u) => resolveAccountStatus(u) === "active").length;
  const suspendedCount =
    kpis?.suspendedCount ??
    initialUsers.filter((u) => resolveAccountStatus(u) === "suspended").length;

  const filteredUsers = initialUsers.filter((u) => {
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    const status = resolveAccountStatus(u);
    const matchesStatus = selectedStatus === "all" || status === selectedStatus;
    return matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users */}
        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Total Enrolled Accounts
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-bento/60 text-surface-forest">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-text-ink">
              {totalUsers}
            </span>
            <span className="text-xs text-text-muted">
              {activeCount} active
              {suspendedCount > 0 ? ` · ${suspendedCount} suspended` : ""}
            </span>
          </div>
        </div>

        {/* KPI 2: Community Donors */}
        <div
          style={{ "--dash-delay": "50ms" } as React.CSSProperties}
          className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Community Donors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">
              {donorCount}
            </span>
            <span className="text-xs text-text-muted">supporters</span>
          </div>
        </div>

        {/* KPI 3: School Bursars */}
        <div
          style={{ "--dash-delay": "100ms" } as React.CSSProperties}
          className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Campus Bursars
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700">
              {bursarCount}
            </span>
            <span className="text-xs text-text-muted">campus leads</span>
          </div>
        </div>

        {/* KPI 4: Admins */}
        <div
          style={{ "--dash-delay": "150ms" } as React.CSSProperties}
          className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Platform Admins
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-purple-700">
              {adminCount}
            </span>
            <span className="text-xs text-text-muted">superusers</span>
          </div>
        </div>
      </div>

      {/* Role & Status Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm ${
              selectedRole === "all"
                ? "bg-surface-forest text-white"
                : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
            }`}
          >
            <span>All Accounts</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedRole === "all"
                  ? "bg-white/20 text-white"
                  : "bg-surface-bento text-text-muted"
              }`}
            >
              {totalUsers}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("donar")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm ${
              selectedRole === "donar"
                ? "bg-surface-forest text-white"
                : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Donors</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedRole === "donar"
                  ? "bg-white/20 text-white"
                  : "bg-surface-bento text-text-muted"
              }`}
            >
              {donorCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("bursar")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm ${
              selectedRole === "bursar"
                ? "bg-surface-forest text-white"
                : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Bursars</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedRole === "bursar"
                  ? "bg-white/20 text-white"
                  : "bg-surface-bento text-text-muted"
              }`}
            >
              {bursarCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm ${
              selectedRole === "admin"
                ? "bg-surface-forest text-white"
                : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admins</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedRole === "admin"
                  ? "bg-white/20 text-white"
                  : "bg-surface-bento text-text-muted"
              }`}
            >
              {adminCount}
            </span>
          </button>
        </div>

        {/* Status Audit Filter */}
        <div className="inline-flex items-center rounded-xl border border-border-subtle bg-white p-1 self-start lg:self-auto shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedStatus === "all"
                ? "bg-surface-bento text-text-ink"
                : "text-text-muted hover:text-text-ink"
            }`}
          >
            All Status ({totalUsers})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("active")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedStatus === "active"
                ? "bg-surface-forest/10 text-surface-forest"
                : "text-text-muted hover:text-text-ink"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus("suspended")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedStatus === "suspended"
                ? "bg-red-50 text-red-700"
                : "text-text-muted hover:text-text-ink"
            }`}
          >
            <Ban className="h-3 w-3" />
            Suspended ({suspendedCount})
          </button>
        </div>
      </div>

      {/* Modern Data Table Bento Box */}
      <div key={`${selectedRole}-${selectedStatus}`} className="tab-panel-enter">
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchPlaceholder="Search accounts by name, email, role, phone..."
        />
      </div>
    </div>
  );
}
