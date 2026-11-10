"use client";
import useAuth from "@/app/hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  School,
  ShoppingBag,
  Users,
  Inbox,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ISubmissions } from "@/app/types/submission";

const Sidebar = ({ propdata: data = [] }: { propdata?: ISubmissions[] }) => {
  const { signout } = useAuth();
  const pathname = usePathname();

  const isProductsActive =
    pathname.startsWith("/dashboard/manage-categories") ||
    pathname.startsWith("/dashboard/product-list") ||
    pathname.startsWith("/dashboard/add-new-product");

  const isSchoolsActive =
    pathname.startsWith("/dashboard/schools-list") ||
    pathname.startsWith("/dashboard/add-new-school");

  const [productDropdown, setProductDropdown] = useState(isProductsActive);
  const [schoolsDropdown, setSchoolsDropdown] = useState(isSchoolsActive);

  useEffect(() => {
    if (isProductsActive) setProductDropdown(true);
    if (isSchoolsActive) setSchoolsDropdown(true);
  }, [pathname, isProductsActive, isSchoolsActive]);

  const unseenData = Array.isArray(data)
    ? data.filter((item: ISubmissions) => item.seen === false)
    : [];

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
              <span className="h-1.5 w-1.5 rounded-full bg-brand-forest shrink-0" />
              <span>Admin Console</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav>
            <ul className="space-y-1.5">
              {/* Dashboard */}
              <li>
                <Link
                  href="/dashboard"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname === "/dashboard"
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Dashboard Overview"
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Dashboard</span>
                  {pathname === "/dashboard" && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* Products Dropdown */}
              <li>
                <button
                  type="button"
                  onClick={() => setProductDropdown((prev) => !prev)}
                  className={`group flex w-full items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-between lg:px-3.5 ${
                    isProductsActive
                      ? "bg-surface-forest/10 font-semibold text-surface-forest"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Products"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline truncate">Products</span>
                  </div>
                  <ChevronDown
                    className={`hidden h-4 w-4 shrink-0 transition-transform duration-200 lg:block ${
                      productDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Products Submenu (Desktop only to prevent mobile sidebar distortion) */}
                <div
                  className={`hidden lg:block overflow-hidden transition-all duration-200 ${
                    productDropdown ? "mt-1 max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-1 pl-4">
                    <li>
                      <Link
                        href="/dashboard/manage-categories"
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === "/dashboard/manage-categories"
                            ? "bg-surface-forest font-semibold text-white"
                            : "text-text-muted hover:bg-surface-bento hover:text-text-ink"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">Categories</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/product-list"
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === "/dashboard/product-list"
                            ? "bg-surface-forest font-semibold text-white"
                            : "text-text-muted hover:bg-surface-bento hover:text-text-ink"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">Product List</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/add-new-product"
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === "/dashboard/add-new-product"
                            ? "bg-surface-forest font-semibold text-white"
                            : "text-text-muted hover:bg-surface-bento hover:text-text-ink"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">Add Product</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Schools Dropdown */}
              <li>
                <button
                  type="button"
                  onClick={() => setSchoolsDropdown((prev) => !prev)}
                  className={`group flex w-full items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-between lg:px-3.5 ${
                    isSchoolsActive
                      ? "bg-surface-forest/10 font-semibold text-surface-forest"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Schools"
                >
                  <div className="flex items-center gap-3">
                    <School className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:inline truncate">Schools</span>
                  </div>
                  <ChevronDown
                    className={`hidden h-4 w-4 shrink-0 transition-transform duration-200 lg:block ${
                      schoolsDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Schools Submenu */}
                <div
                  className={`hidden lg:block overflow-hidden transition-all duration-200 ${
                    schoolsDropdown ? "mt-1 max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="space-y-1 pl-4">
                    <li>
                      <Link
                        href="/dashboard/schools-list"
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === "/dashboard/schools-list"
                            ? "bg-surface-forest font-semibold text-white"
                            : "text-text-muted hover:bg-surface-bento hover:text-text-ink"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">Schools List</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/add-new-school"
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === "/dashboard/add-new-school"
                            ? "bg-surface-forest font-semibold text-white"
                            : "text-text-muted hover:bg-surface-bento hover:text-text-ink"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">Add School</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Orders */}
              <li>
                <Link
                  href="/dashboard/orders"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname.startsWith("/dashboard/orders")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Orders"
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Orders</span>
                  {pathname.startsWith("/dashboard/orders") && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* Users */}
              <li>
                <Link
                  href="/dashboard/manage-users"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname.startsWith("/dashboard/manage-users")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Manage Users"
                >
                  <Users className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Users</span>
                  {pathname.startsWith("/dashboard/manage-users") && (
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand-lime lg:block shrink-0" />
                  )}
                </Link>
              </li>

              {/* Inbox */}
              <li>
                <Link
                  href="/dashboard/form-submissions"
                  className={`group relative flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname.startsWith("/dashboard/form-submissions")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Inbox Submissions"
                >
                  <Inbox className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Inbox</span>
                  {unseenData.length > 0 && (
                    <span className="lg:ml-auto inline-flex items-center justify-center rounded-full bg-brand-lime px-1.5 py-0.5 text-[11px] font-bold text-surface-forest">
                      {unseenData.length}
                    </span>
                  )}
                </Link>
              </li>

              {/* Site Content CMS */}
              <li>
                <Link
                  href="/dashboard/site-content"
                  className={`group flex items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all lg:justify-start lg:px-3.5 ${
                    pathname.startsWith("/dashboard/site-content")
                      ? "bg-surface-forest font-semibold text-white shadow-sm"
                      : "text-text-body hover:bg-surface-bento/70 hover:text-text-ink"
                  }`}
                  title="Site Content CMS"
                >
                  <Globe className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline truncate">Site Content</span>
                  {pathname.startsWith("/dashboard/site-content") && (
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
            title="Log out of Admin Console"
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
