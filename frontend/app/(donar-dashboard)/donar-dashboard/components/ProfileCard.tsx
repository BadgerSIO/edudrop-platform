"use client";
import { useAuthContext } from "@/app/context/AuthContext";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import Image from "next/image";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  User,
  Globe,
  Building,
} from "lucide-react";

const ProfileCard = () => {
  const { data, loading } = useAuthContext();

  if (loading) {
    return <CardFullLoading />;
  }

  const donor = data?.donar;
  const fullName = `${donor?.name?.firstName || ""} ${donor?.name?.lastName || ""}`.trim() || "Verified Donor";
  const avatarUrl = handleBuildImage(donor?.profileImage, "/user-avatar.webp");

  return (
    <div className="space-y-6">
      {/* Hero Bento Identity Card */}
      <div className="dash-card-enter overflow-hidden rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-subtle/70">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-border-subtle bg-surface-bento shadow-sm">
              <Image
                src={avatarUrl}
                alt={fullName}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified Donor
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
                <Mail className="h-3.5 w-3.5" />
                <span>{donor?.email || "No email provided"}</span>
              </div>
            </div>
          </div>

          {/* Donation Total Pill */}
          <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-bento/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-forest text-white shadow-sm">
              <HeartHandshake className="h-6 w-6 text-brand-lime" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Total Contributions
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-text-ink">
                ${donor?.totalDonationAmount || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Contact Tile */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <User className="h-3.5 w-3.5 text-surface-forest" />
              <span>Personal Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Gender</span>
                <span className="font-medium text-text-ink capitalize">
                  {donor?.gender || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Phone Number</span>
                <span className="font-medium text-text-ink flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-text-muted" />
                  {donor?.contactNo || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Address Tile */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <MapPin className="h-3.5 w-3.5 text-surface-forest" />
              <span>Street Address</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Street</span>
                <span className="font-medium text-text-ink">
                  {donor?.address?.street || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">City & State</span>
                <span className="font-medium text-text-ink flex items-center gap-1.5">
                  <Building className="h-3 w-3 text-text-muted" />
                  {donor?.address?.city || "--"}
                  {donor?.address?.state ? `, ${donor.address.state}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Region Tile */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Globe className="h-3.5 w-3.5 text-surface-forest" />
              <span>Region & Postal</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Postal / Zip Code</span>
                <span className="font-medium text-text-ink">
                  {donor?.address?.zipCode || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Country</span>
                <span className="font-medium text-text-ink">
                  {donor?.address?.country || "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
