"use client";
import { useAuthContext } from "@/app/context/AuthContext";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";
import {
  School,
  Mail,
  Phone,
  MapPin,
  CircleDollarSign,
  User,
  Building,
} from "lucide-react";

const ProfileCard = () => {
  const { data } = useAuthContext();

  const { data: school } = useQuery<ISchoolInfo>({
    queryKey: ["school-info"],
    queryFn: async () => {
      try {
        const jwt = await getCookie("jwt");
        if (!jwt) {
          toast.error("No jwt found");
        }
        const res = await axios.get(`${SERVERURLAPI}/school-info`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        return res.data.data;
      } catch (error) {
        toast.error("Failed to fetch");
      }
    },
  });

  const bursar = data?.bursar;
  const fullName = `${bursar?.name?.firstName || ""} ${bursar?.name?.lastName || ""}`.trim() || "School Bursar";
  const schoolName = school?.schoolName || bursar?.school?.name || "Partner Institution";
  const amountReceived = bursar?.school?.amountReceived || 0;

  return (
    <div className="space-y-6">
      {/* Hero Bento Identity Card */}
      <div className="dash-card-enter overflow-hidden rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border-subtle/70">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-border-subtle bg-surface-bento shadow-sm">
              {bursar?.profileImage ? (
                <Image
                  src={handleBuildImage(bursar.profileImage, "")}
                  alt={fullName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : school?.schoolLogo ? (
                <Image
                  src={handleBuildImage(school?.schoolLogo, "")}
                  alt={schoolName}
                  width={96}
                  height={96}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <School className="h-10 w-10 text-surface-forest" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  School Bursar
                </span>
              </div>
              <div className="text-sm font-medium text-text-body flex items-center gap-1.5">
                <Building className="h-4 w-4 text-surface-forest" />
                <span>{schoolName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
                <Mail className="h-3.5 w-3.5" />
                <span>{bursar?.email || "No email provided"}</span>
              </div>
            </div>
          </div>

          {/* Amount Received Stat Tile */}
          <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-bento/60 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-forest text-white shadow-sm">
              <CircleDollarSign className="h-6 w-6 text-brand-lime" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Campus Funding Received
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-text-ink">
                ${amountReceived}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Personal Details */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <User className="h-3.5 w-3.5 text-surface-forest" />
              <span>Officer Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Gender</span>
                <span className="font-medium text-text-ink capitalize">
                  {bursar?.gender || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Contact Phone</span>
                <span className="font-medium text-text-ink flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-text-muted" />
                  {bursar?.contactNo || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Campus Address */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <MapPin className="h-3.5 w-3.5 text-surface-forest" />
              <span>Current Address</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Present Address</span>
                <span className="font-medium text-text-ink">
                  {bursar?.presentAddress || "--"}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Permanent Address</span>
                <span className="font-medium text-text-ink">
                  {bursar?.permanentAddress || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Institution Info */}
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/30 p-4 space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <School className="h-3.5 w-3.5 text-surface-forest" />
              <span>Institution Affiliation</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Institution Name</span>
                <span className="font-medium text-text-ink">
                  {schoolName}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-muted block">Sponsorship Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  Active Partner Institution
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
