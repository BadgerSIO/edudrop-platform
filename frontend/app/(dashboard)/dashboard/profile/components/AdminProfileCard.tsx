"use client";

import React from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuthContext } from "@/app/context/AuthContext";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import { dateConverter } from "@/app/utility/dateConverter";

const AdminProfileCard = () => {
  const { data, loading } = useAuthContext();

  if (loading && !data) {
    return <CardFullLoading />;
  }

  const admin = data?.admin;
  const fullName =
    `${admin?.name?.firstName || ""} ${admin?.name?.lastName || ""}`.trim() ||
    "Platform Administrator";
  const email = admin?.email || data?.email || "--";
  const initials =
    `${admin?.name?.firstName?.[0] || ""}${admin?.name?.lastName?.[0] || ""}`.toUpperCase() ||
    (email !== "--" ? email[0].toUpperCase() : "A");
  const avatarUrl = admin?.profileImage
    ? handleBuildImage(admin.profileImage, "")
    : "";
  const accountStatus = data?.status || "active";
  const memberSince = admin?.createdAt || data?.createdAt;

  return (
    <div className="space-y-6">
      {/* Hero Bento Identity Card */}
      <div className="dash-card-enter overflow-hidden rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-subtle/70">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-border-subtle bg-surface-forest text-2xl font-bold text-brand-lime shadow-sm">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Platform Admin
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
                <Mail className="h-3.5 w-3.5" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Access Scope Pill */}
          <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-bento/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-forest text-white shadow-sm">
              <ShieldCheck className="h-6 w-6 text-brand-lime" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Console Privileges
              </span>
              <div className="text-base sm:text-lg font-extrabold text-text-ink">
                Full Platform Access
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Administrator Contact */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <User className="h-3.5 w-3.5 text-surface-forest" />
              <span>Officer Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Full Name</span>
                <span className="font-medium text-text-ink">{fullName}</span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Contact Phone</span>
                <span className="font-medium text-text-ink flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-text-muted" />
                  {admin?.contactNo || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Office & Mailing Addresses */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <MapPin className="h-3.5 w-3.5 text-surface-forest" />
              <span>Office Addresses</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Present Address</span>
                <span className="font-medium text-text-ink">
                  {admin?.presentAddress || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Permanent Address</span>
                <span className="font-medium text-text-ink">
                  {admin?.permanentAddress || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Account & Access */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-surface-forest" />
              <span>Account Status</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Account Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 capitalize">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {accountStatus}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Member Since</span>
                <span className="font-medium text-text-ink">
                  {memberSince ? dateConverter(memberSince) : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileCard;
