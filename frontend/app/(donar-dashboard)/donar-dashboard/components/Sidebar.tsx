"use client";
import useAuth from "@/app/hooks/useAuth";
import { User, ShoppingBag, LogOut } from "lucide-react";
import BrandLogo from "@/app/sharedComponents/ui/BrandLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const { signout } = useAuth();

  const isProfileActive =
    pathname === "/donar-dashboard" ||
    pathname.startsWith("/donar-dashboard/update-profile");
  const isOrdersActive = pathname.startsWith("/donar-dashboard/my-orders");

  return (
    <aside className="relative z-30 col-start-1 row-span-3 w-[72px] min-w-[72px] max-w-[72px] lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px] shrink-0 border-r border-border-subtle bg-white">
      <div className="sticky top-0 flex min-h-screen flex-col justify-between p-2.5 lg:p-4">
        {/* Top Section */}
        <div className="space-y-6">
          {/* Logo & Portal Badge */}
          <div className="flex flex-col items-center lg:items-start px-1 pt-2">
            <Link
              href="/"
              aria-label="EduDrop Foundation Home"
              className="inline-flex items-center transition-opacity hover:opacity-85"
            >
              <BrandLogo variant="on-light" size="sm" showTagline compactBelowLg />
            </Link>
            <div className="mt-2.5 hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-bento/80 px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-forest shrink-0" />
              <span>Donor Portal</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav>
            <ul className="space-y-1.5">
              {/* Profile */}
              <li>
                <Link
                  href="/donar-dashboard"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    isProfileActive
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="My Profile"
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Profile</span>
                  {isProfileActive && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* Orders */}
              <li>
                <Link
                  href="/donar-dashboard/my-orders"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    isOrdersActive
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="My Donations & Orders"
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">My Orders</span>
                  {isOrdersActive && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
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
            title="Log out of Donor Portal"
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
