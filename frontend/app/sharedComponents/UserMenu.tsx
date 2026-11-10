"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "../context/AuthContext";
import useAuth from "../hooks/useAuth";
import { handleBuildImage } from "../utility/handleBuildImage";
import {
  ChevronDown,
  LayoutDashboard,
  PackageCheck,
  Truck,
  Settings,
  LogOut,
  Mail,
  School,
  Users,
  ShieldCheck,
  Heart,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserMenuProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ mobile = false, onNavigate }) => {
  const { data } = useAuthContext();
  const { signout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!data) return null;

  const role = data?.role;
  const firstName =
    role === "donar"
      ? data?.donar?.name?.firstName || "Donor"
      : role === "bursar"
        ? data?.bursar?.name?.firstName || "Bursar"
        : data?.admin?.name?.firstName || "Admin";

  const fullName =
    role === "donar"
      ? `${data?.donar?.name?.firstName || ""} ${data?.donar?.name?.lastName || ""}`.trim() || "Donor"
      : role === "bursar"
        ? `${data?.bursar?.name?.firstName || ""} ${data?.bursar?.name?.lastName || ""}`.trim() || "School Bursar"
        : `${data?.admin?.name?.firstName || ""} ${data?.admin?.name?.lastName || ""}`.trim() || "Administrator";

  const email = data?.email || "";
  const initial = (firstName?.[0] || email?.[0] || "U").toUpperCase();
  const rawAvatar =
    role === "donar"
      ? data?.donar?.profileImage
      : role === "bursar"
        ? data?.bursar?.profileImage
        : data?.admin?.profileImage;
  const avatarUrl = rawAvatar ? handleBuildImage(rawAvatar, "") : "";

  const renderAvatar = (containerClass: string, sizes: string) => (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full font-bold shadow-sm shrink-0 ${containerClass}`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={fullName}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );

  const dashboardHref =
    role === "bursar"
      ? "/bursar-dashboard"
      : role === "donar"
        ? "/donar-dashboard"
        : "/dashboard";

  const roleBadge = {
    donar: {
      label: "Verified Donor",
      icon: Heart,
      badgeClass: "bg-brand-lime/20 text-surface-forest",
    },
    bursar: {
      label: "School Bursar",
      icon: School,
      badgeClass: "bg-sky-100 text-sky-800",
    },
    admin: {
      label: "Platform Admin",
      icon: ShieldCheck,
      badgeClass: "bg-purple-100 text-purple-800",
    },
  }[role || "donar"] || {
    label: "User",
    icon: ShieldCheck,
    badgeClass: "bg-surface-bento text-text-body",
  };

  const handleSignout = async () => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
    try {
      await signout();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
  };

  // Mobile drawer presentation
  if (mobile) {
    const RoleIcon = roleBadge.icon;
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-bento/60 p-4">
        {/* User Identity */}
        <div className="flex items-center gap-3">
          {renderAvatar("h-10 w-10 bg-surface-forest text-brand-lime text-sm", "40px")}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text-ink truncate">
                {fullName}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadge.badgeClass}`}
              >
                <RoleIcon className="h-3 w-3" />
                {roleBadge.label}
              </span>
            </div>
            <p className="text-xs text-text-body truncate">{email}</p>
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-4 space-y-1.5 border-t border-border-subtle pt-3">
          <Link
            href={dashboardHref}
            onClick={handleLinkClick}
            className="flex items-center justify-between rounded-xl bg-surface-forest px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-surface-forest-light"
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-brand-lime" />
              Go to Dashboard
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {role === "donar" && (
            <>
              <Link
                href="/donar-dashboard/my-orders"
                onClick={handleLinkClick}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-text-body transition-colors hover:bg-white hover:text-text-ink"
              >
                <PackageCheck className="h-4 w-4 text-surface-forest" />
                My Sponsorships &amp; Orders
              </Link>
              <Link
                href="/donar-dashboard/update-profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-text-body transition-colors hover:bg-white hover:text-text-ink"
              >
                <Settings className="h-4 w-4 text-surface-forest" />
                Profile Settings
              </Link>
            </>
          )}

          {role === "bursar" && (
            <Link
              href="/bursar-dashboard/update-profile"
              onClick={handleLinkClick}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-text-body transition-colors hover:bg-white hover:text-text-ink"
            >
              <Settings className="h-4 w-4 text-surface-forest" />
              Profile Settings
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignout}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Desktop header presentation
  const RoleIcon = roleBadge.icon;
  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 pl-1 pr-2.5 py-1 text-xs font-semibold text-white transition-all hover:bg-white/20 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime cursor-pointer select-none"
      >
        {renderAvatar(
          "h-7 w-7 bg-brand-lime text-surface-forest text-xs ring-1 ring-white/15",
          "28px"
        )}
        <span className="max-w-[90px] truncate leading-none">{firstName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:opacity-100 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-64 rounded-2xl border border-border-subtle bg-white p-2 shadow-2xl z-[150] text-text-ink animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header Profile Box */}
          <div className="rounded-xl bg-surface-bento/60 p-3">
            <div className="flex items-center gap-2.5">
              {renderAvatar("h-9 w-9 bg-surface-forest text-brand-lime text-xs", "36px")}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm leading-tight text-text-ink truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-text-body truncate mt-0.5">
                  {email}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-border-subtle/60 pt-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadge.badgeClass}`}
              >
                <RoleIcon className="h-3 w-3" />
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-2 space-y-1">
            <Link
              href={dashboardHref}
              onClick={handleLinkClick}
              className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-text-ink transition-colors hover:bg-surface-forest hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-surface-forest group-hover:text-brand-lime" />
                Dashboard Portal
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {role === "donar" && (
              <>
                <Link
                  href="/donar-dashboard/my-orders"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <PackageCheck className="h-4 w-4 text-text-body" />
                  My Sponsorships
                </Link>
                <Link
                  href="/donar-dashboard/track-your-order"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <Truck className="h-4 w-4 text-text-body" />
                  Track Live Deliveries
                </Link>
                <Link
                  href="/donar-dashboard/update-profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <Settings className="h-4 w-4 text-text-body" />
                  Profile Settings
                </Link>
              </>
            )}

            {role === "bursar" && (
              <>
                <Link
                  href="/bursar-dashboard/my-orders"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <PackageCheck className="h-4 w-4 text-text-body" />
                  Campus Shipments
                </Link>
                <Link
                  href="/bursar-dashboard/inbox"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <Mail className="h-4 w-4 text-text-body" />
                  Campus Inquiries
                </Link>
                <Link
                  href="/bursar-dashboard/update-profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <Settings className="h-4 w-4 text-text-body" />
                  Profile Settings
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  href="/dashboard/orders"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <PackageCheck className="h-4 w-4 text-text-body" />
                  All Orders
                </Link>
                <Link
                  href="/dashboard/schools-list"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <School className="h-4 w-4 text-text-body" />
                  Partner Schools
                </Link>
                <Link
                  href="/dashboard/manage-users"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-body transition-colors hover:bg-surface-bento hover:text-text-ink"
                >
                  <Users className="h-4 w-4 text-text-body" />
                  User Directory
                </Link>
              </>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="mt-2 border-t border-border-subtle/70 pt-1.5">
            <button
              type="button"
              onClick={handleSignout}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 w-full cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
