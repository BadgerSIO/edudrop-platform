"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlignRight,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  RotateCcw,
  Settings,
  User,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import { SERVERURL } from "@/lib/constants";
import Notifications from "./Notifications";
import OwnerUnlockModal from "./OwnerUnlockModal";

const navItems = [
  { href: "/", text: "Home" },
  { href: "/schools", text: "Schools" },
  { href: "/products", text: "Products" },
];

const DashNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const {
    data,
    loading,
    demoStatus,
    unlockOwnerMode,
    lockOwnerMode,
    resetDemoDatabase,
  } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const { signout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState("/user-avatar.webp");

  const handleResetDemo = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const ok = await resetDemoDatabase();
      if (ok) {
        router.refresh();
      }
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    let buildUrl = "/user-avatar.webp";
    if (data?.donar?.profileImage) {
      buildUrl = `${SERVERURL}${data.donar.profileImage}`;
    } else if (data?.bursar?.profileImage) {
      buildUrl = `${SERVERURL}${data.bursar.profileImage}`;
    } else if (data?.admin?.profileImage) {
      buildUrl = `${SERVERURL}${data.admin.profileImage}`;
    }
    setProfileImageUrl(buildUrl);
  }, [data]);

  const handleMenuIcon = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const role = data?.role;
  const dropdownNavLinkClass =
    "flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-text-ink transition-colors duration-150 ease-out hover:bg-surface-forest hover:text-white focus:bg-surface-forest focus:text-white data-[highlighted]:bg-surface-forest data-[highlighted]:text-white [&>svg]:text-surface-forest [&>svg]:transition-colors [&>svg]:duration-150 hover:[&>svg]:text-brand-lime focus:[&>svg]:text-brand-lime data-[highlighted]:[&>svg]:text-brand-lime";
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
        : `${data?.admin?.name?.firstName || ""} ${data?.admin?.name?.lastName || ""}`.trim() || "Platform Administrator";

  return (
    <header className="z-40 col-start-2 row-start-1 h-20 border-b border-border-subtle bg-white/85 backdrop-blur-md px-6 sm:px-10 lg:px-12">
      <div className="mx-auto flex h-full w-full items-center justify-between">
        {/* Left Cluster: Mobile Toggle + Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={handleMenuIcon}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-text-body hover:bg-surface-bento hover:text-text-ink active:scale-[0.97] motion-reduce:active:scale-100 transition-all"
            >
              <AlignRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick public navigation pills */}
          <nav aria-label="Quick links" className="hidden lg:block">
            <ul className="flex items-center gap-1.5 sm:gap-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-surface-forest text-white shadow-xs"
                          : "text-text-body hover:bg-surface-bento hover:text-text-ink"
                      }`}
                    >
                      {item.text}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right utility cluster with generous breathing room */}
        <div className="flex items-center gap-4 sm:gap-6">
          {demoStatus?.demoMode && (
            demoStatus.ownerBypassActive ? (
              <div className="hidden md:flex items-center gap-1.5 rounded-full border border-surface-forest/25 bg-surface-forest px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                <span className="h-2 w-2 rounded-full bg-brand-lime" />
                <span>Owner Mode Active</span>
                <button
                  type="button"
                  disabled={resetting}
                  onClick={handleResetDemo}
                  title="Restore all collections back to the clean seed snapshot"
                  className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-lime hover:bg-white/25 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <RotateCcw
                    className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`}
                  />
                  <span>{resetting ? "Resetting..." : "Reset Demo DB"}</span>
                </button>
                <button
                  type="button"
                  onClick={lockOwnerMode}
                  title="Re-enable Demo Mode restrictions"
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Lock className="h-3 w-3" />
                  <span>Lock</span>
                </button>
              </div>
            ) : demoStatus.ownerUnlockConfigured ? (
              <button
                type="button"
                onClick={() => setUnlockModalOpen(true)}
                title="Public portfolio demo: edits to core schools, products, uploads, and passwords are locked. Site owner: click to unlock."
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-surface-forest/20 bg-surface-bento px-3 py-1.5 text-[11px] font-bold text-surface-forest hover:border-surface-forest/40 hover:bg-surface-bento/80 transition-colors cursor-pointer select-none"
              >
                <span className="h-2 w-2 rounded-full bg-brand-lime ring-2 ring-surface-forest/25" />
                <span>
                  Public Demo · Auto-Resets {demoStatus.resetIntervalMinutes}m
                </span>
              </button>
            ) : (
              <div
                title="Public portfolio demo: interactive orders and inbox toggles work normally; edits to core schools, products, uploads, and passwords are locked."
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-surface-forest/20 bg-surface-bento px-3 py-1.5 text-[11px] font-bold text-surface-forest select-none"
              >
                <span className="h-2 w-2 rounded-full bg-brand-lime ring-2 ring-surface-forest/25" />
                <span>
                  Public Demo · Auto-Resets {demoStatus.resetIntervalMinutes}m
                </span>
              </div>
            )
          )}
          <Notifications />

          <div className="hidden sm:block h-7 w-px bg-border-subtle/80" />

          {/* User Profile Dropdown Trigger */}
          {loading ? (
            <div
              aria-hidden="true"
              className="edudrop-shimmer h-12 w-36 rounded-full border border-border-subtle"
            />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="group flex items-center gap-3 rounded-full border border-border-subtle bg-white py-1.5 pl-1.5 pr-4 shadow-xs transition-all hover:border-surface-forest/30 hover:bg-surface-bento/60 active:scale-[0.98] motion-reduce:active:scale-100 cursor-pointer select-none">
                  <Image
                    src={profileImageUrl}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-border-subtle"
                    alt={fullName}
                    width={72}
                    height={72}
                    priority
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-text-ink leading-tight truncate max-w-[130px]">
                      {firstName}
                    </span>
                    <span className="text-[11px] font-medium text-text-muted capitalize leading-tight">
                      {data?.role === "donar" ? "Donor" : data?.role}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[999] mt-2 w-64 rounded-2xl border border-border-subtle bg-white p-2 shadow-2xl"
              >
                <div className="rounded-xl bg-surface-bento/70 p-3 mb-1">
                  <p className="text-sm font-bold text-text-ink truncate">{fullName}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{data?.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-forest/10 px-2 py-0.5 text-[10px] font-bold text-surface-forest capitalize">
                    {data?.role === "donar" ? "Verified Donor" : `${data?.role} Portal`}
                  </span>
                </div>
                <DropdownMenuSeparator className="bg-border-subtle/80" />
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      data?.role === "donar"
                        ? "/donar-dashboard"
                        : data?.role === "bursar"
                          ? "/bursar-dashboard"
                          : data?.role === "admin"
                            ? "/dashboard/profile"
                            : "/"
                    }
                    className={dropdownNavLinkClass}
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                {(data?.role === "donar" || data?.role === "bursar") && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        data?.role === "donar"
                          ? "/donar-dashboard/update-profile"
                          : "/bursar-dashboard/update-profile"
                      }
                      className={dropdownNavLinkClass}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Edit Profile &amp; Password</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {data?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className={dropdownNavLinkClass}>
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard Overview</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {demoStatus?.demoMode && demoStatus.ownerBypassActive && (
                  <>
                    <DropdownMenuItem
                      onClick={handleResetDemo}
                      disabled={resetting}
                      className={dropdownNavLinkClass}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{resetting ? "Resetting Demo DB..." : "Reset Demo DB Now"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={lockOwnerMode}
                      className={dropdownNavLinkClass}
                    >
                      <Lock className="h-4 w-4" />
                      <span>Lock Demo Mode</span>
                    </DropdownMenuItem>
                  </>
                )}
                {demoStatus?.demoMode &&
                  !demoStatus.ownerBypassActive &&
                  demoStatus.ownerUnlockConfigured && (
                    <DropdownMenuItem
                      onClick={() => setUnlockModalOpen(true)}
                      className={dropdownNavLinkClass}
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>Owner Mode Unlock</span>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem
                  onClick={signout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors duration-150 ease-out hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Dropdown drawer for mobile and tablet */}
      {isOpen && (
        <div
          className="drawer-backdrop fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={handleMenuClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Portal navigation"
            className="mobile-drawer-panel ml-auto flex h-screen w-full max-w-[260px] flex-col bg-white p-5 border-l border-border-subtle shadow-2xl sm:max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-text-body">
                Navigation
              </span>
              <button
                type="button"
                onClick={handleMenuClose}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-body hover:bg-surface-bento hover:text-surface-forest transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={handleMenuClose}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-text-ink hover:bg-surface-bento transition-colors"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <OwnerUnlockModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        onUnlock={unlockOwnerMode}
      />
    </header>
  );
};

export default DashNav;
