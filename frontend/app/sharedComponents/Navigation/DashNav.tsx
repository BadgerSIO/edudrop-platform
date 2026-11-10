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
import { AlignRight, LogOut, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";
import DashNavLoading from "@/app/sharedComponents/Loders/DashNavLoading";
import useAuth from "@/app/hooks/useAuth";
import { SERVERURL } from "@/lib/constants";
import { useNotificationContext } from "@/app/context/NotificationContext";
import Notifications from "./Notifications";

const navItems = [
  { href: "/", text: "Home" },
  { href: "/schools", text: "Schools" },
  { href: "/products", text: "Products" },
];

const DashNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading } = useAuthContext();
  const { notificationLoading } = useNotificationContext();
  const pathname = usePathname();
  const { signout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState("/user-avatar.webp");

  useEffect(() => {
    let buildUrl = "/user-avatar.webp";
    if (data?.donar?.profileImage) {
      buildUrl = `${SERVERURL}${data?.donar?.profileImage}`;
      setProfileImageUrl(buildUrl);
    }
    if (data?.bursar?.profileImage) {
      buildUrl = `${SERVERURL}${data?.bursar?.profileImage}`;
      setProfileImageUrl(buildUrl);
    }
    if (data?.admin?.profileImage) {
      buildUrl = `${SERVERURL}${data?.admin?.profileImage}`;
      setProfileImageUrl(buildUrl);
    }
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

  if (loading || notificationLoading) {
    return <DashNavLoading />;
  }

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
        : `${data?.admin?.name?.firstName || ""} ${data?.admin?.name?.lastName || ""}`.trim() || "Platform Administrator";

  return (
    <header className="z-[90] col-start-2 row-start-1 h-20 border-b border-border-subtle bg-white/85 backdrop-blur-md px-6 sm:px-10 lg:px-12">
      <div className="mx-auto flex h-full w-full items-center justify-between">
        {/* Left Cluster: Mobile Toggle + Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={handleMenuIcon}
              aria-label="Toggle navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle text-text-body hover:bg-surface-bento hover:text-text-ink transition-colors"
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
          <Notifications />

          <div className="hidden sm:block h-7 w-px bg-border-subtle/80" />

          {/* User Profile Dropdown Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="group flex items-center gap-3 rounded-full border border-border-subtle bg-white py-1.5 pl-1.5 pr-4 shadow-xs transition-all hover:border-surface-forest/30 hover:bg-surface-bento/60 cursor-pointer select-none">
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
                          ? "/dashboard"
                          : "/"
                  }
                  className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-ink hover:bg-surface-forest hover:text-white transition-colors"
                >
                  <span>My Profile & Portal</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signout}
                className="group flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dropdown drawer for mobile and tablet */}
      <div
        className={`fixed right-0 top-0 z-[99999] h-screen w-full max-w-[240px] bg-white p-5 border-l border-border-subtle shadow-2xl transition-transform duration-300 sm:max-w-xs lg:hidden ${
          !isOpen && "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-text-body">Navigation</span>
          <X
            className="cursor-pointer text-text-body hover:text-surface-forest transition-colors h-5 w-5"
            onClick={handleMenuClose}
          />
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
    </header>
  );
};

export default DashNav;
