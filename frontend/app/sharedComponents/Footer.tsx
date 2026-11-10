"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ActionPillButton from "./ui/ActionPillButton";

const Footer = () => {
  const pathname = usePathname();
  const isDonarDashboard = pathname.startsWith("/donar-dashboard");

  if (isDonarDashboard) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-surface-forest text-on-forest">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Brand & Mission Column */}
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" className="inline-block">
              <div className="rounded-full bg-white px-3.5 py-1.5 shadow-sm">
                <Image
                  src="/logo.webp"
                  width={96}
                  height={40}
                  alt="EduDrop Foundation"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-on-forest-muted sm:text-base">
              EduDrop is a community-driven sponsorship platform. We connect
              alumni, parents, and community partners directly with verified
              schools to sponsor pure spring water and essential classroom
              supplies with 100% direct-to-bursar delivery.
            </p>
            <div className="pt-2">
              <ActionPillButton variant="lime" size="sm" href="/schools">
                Browse Partner Schools
              </ActionPillButton>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Column 1: Platform */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-lime">
                Platform
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schools"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Partner Schools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Classroom Supplies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Get in Touch
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Classroom Supplies */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-lime">
                Supplies
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/products"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Pure Spring Water
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Classroom Dispensers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Sanitization Kits
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Eco-friendly Cups & Paper
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust & Legal */}
            <div className="col-span-2 space-y-4 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-lime">
                Transparency
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/#contact"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Terms & Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Privacy Commitment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Bursar Portal Verification
                  </Link>
                </li>
                <li>
                  <span className="inline-block text-xs font-medium text-brand-lime">
                    ✓ 100% Direct to School
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-on-forest-muted">
            © {new Date().getFullYear()} EduDrop Foundation. All rights reserved. Every Drop Counts for Education!
          </p>
          <p className="text-xs text-on-forest-muted">
            Direct Classroom Hydration & Supplies Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
