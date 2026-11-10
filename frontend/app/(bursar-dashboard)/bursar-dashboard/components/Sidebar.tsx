"use client";
import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import { ISubmissions } from "@/app/types/submission";
import { User, ShoppingBag, Inbox, LogOut, Lock, School } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = ({ propdata = [] }: { propdata?: ISubmissions[] }) => {
  const unseenData = Array.isArray(propdata)
    ? propdata.filter((item: ISubmissions) => item.seen === false)
    : [];
  const { data, loading } = useAuthContext();
  const { signout } = useAuth();
  const pathname = usePathname();

  const isBursarActive = Boolean(data?.bursar?.active);

  return (
    <aside className="relative z-30 col-start-1 row-span-3 w-[72px] min-w-[72px] max-w-[72px] lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px] shrink-0 border-r border-border-subtle bg-white">
      <div className="sticky top-0 flex min-h-screen flex-col justify-between p-2.5 lg:p-4">
        {/* Top Section */}
        <div className="space-y-6">
          {/* Logo & Portal Badge */}
          <div className="flex flex-col items-center lg:items-start px-1 pt-2">
            <Link href="/" className="inline-block transition-opacity hover:opacity-85">
              <Image
                src="/logo.webp"
                alt="EduDrop Logo"
                width={120}
                height={40}
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain"
                priority
              />
            </Link>
            <div className="mt-2.5 hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-bento/80 px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>School Bursar</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav>
            <ul className="space-y-1.5">
              {/* Profile */}
              <li>
                <Link
                  href="/bursar-dashboard"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname === "/bursar-dashboard" ||
                    pathname.startsWith("/bursar-dashboard/update-profile")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Bursar Profile"
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Profile</span>
                  {(pathname === "/bursar-dashboard" ||
                    pathname.startsWith("/bursar-dashboard/update-profile")) && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* School Profile & Campus Needs CMS */}
              <li>
                <Link
                  href="/bursar-dashboard/school-profile"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname.startsWith("/bursar-dashboard/school-profile")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="School Profile & Campus Needs"
                >
                  <School className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">School Profile</span>
                  {pathname.startsWith("/bursar-dashboard/school-profile") && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* Orders */}
              <li>
                {loading ? (
                  <div
                    aria-hidden="true"
                    className="edudrop-shimmer h-10 w-full rounded-xl"
                  />
                ) : isBursarActive ? (
                  <Link
                    href="/bursar-dashboard/my-orders"
                    className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                      pathname.startsWith("/bursar-dashboard/my-orders")
                        ? "bg-surface-forest font-semibold text-white shadow-sm"
                        : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                    }`}
                    title="School Orders"
                  >
                    <ShoppingBag className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline truncate">Orders</span>
                    {pathname.startsWith("/bursar-dashboard/my-orders") && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                    )}
                  </Link>
                ) : (
                  <div
                    title="Fill out school information and contact admin for activation"
                    className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-text-muted/60 lg:justify-start lg:px-3.5"
                  >
                    <ShoppingBag className="h-5 w-5 shrink-0 opacity-50" />
                    <span className="hidden lg:inline truncate">Orders</span>
                    <Lock className="ml-auto hidden h-3.5 w-3.5 opacity-50 lg:block shrink-0" />
                  </div>
                )}
              </li>

              {/* Inbox */}
              <li>
                {loading ? (
                  <div
                    aria-hidden="true"
                    className="edudrop-shimmer h-10 w-full rounded-xl"
                  />
                ) : isBursarActive ? (
                  <Link
                    href="/bursar-dashboard/inbox"
                    className={`group relative flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                      pathname.startsWith("/bursar-dashboard/inbox")
                        ? "bg-surface-forest font-semibold text-white shadow-sm"
                        : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                    }`}
                    title="School Inbox"
                  >
                    <Inbox className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline truncate">Inbox</span>
                    {unseenData.length > 0 && (
                      <span className="lg:ml-auto inline-flex items-center justify-center rounded-full bg-brand-lime px-1.5 py-0.5 text-[11px] font-bold text-surface-forest">
                        {unseenData.length}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div
                    title="Fill out school information and contact admin for activation"
                    className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-text-muted/60 lg:justify-start lg:px-3.5"
                  >
                    <Inbox className="h-5 w-5 shrink-0 opacity-50" />
                    <span className="hidden lg:inline truncate">Inbox</span>
                    <Lock className="ml-auto hidden h-3.5 w-3.5 opacity-50 lg:block shrink-0" />
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Section - Logout */}
        <div className="pt-4 pb-12 border-t border-border-subtle">
          <button
            type="button"
            onClick={signout}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 lg:justify-start lg:px-3.5"
            title="Log out of Bursar Portal"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
