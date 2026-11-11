"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Code2, ExternalLink, Globe } from "lucide-react";
import ActionPillButton from "./ui/ActionPillButton";
import BrandLogo from "./ui/BrandLogo";
import LinkedInIcon from "./ui/LinkedInIcon";
import { DEVELOPER_INFO } from "@/lib/developerInfo";

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
            <Link
              href="/"
              aria-label="EduDrop Foundation Home"
              className="inline-flex items-center transition-opacity hover:opacity-90"
            >
              <BrandLogo variant="on-dark" size="md" showTagline />
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
                    href="/contact"
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
                    href="/contact#faq"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Terms & Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact#faq"
                    className="text-on-forest-muted transition-colors hover:text-white"
                  >
                    Privacy Commitment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact?topic=school"
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
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 lg:flex-row">
          <p className="text-center text-xs text-on-forest-muted lg:text-left">
            © {new Date().getFullYear()} EduDrop Foundation. All rights reserved. Every Drop Counts for Education!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs text-on-forest-muted">
              <Code2 aria-hidden="true" className="h-3.5 w-3.5 text-brand-lime" />
              <span>
                Built by{" "}
                <strong className="font-semibold text-on-forest">
                  {DEVELOPER_INFO.name}
                </strong>
              </span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={DEVELOPER_INFO.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Portfolio — ${DEVELOPER_INFO.name} (opens in a new tab)`}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-on-forest transition-colors hover:border-brand-lime hover:bg-brand-lime hover:text-surface-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              >
                <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Portfolio</span>
                <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-75" />
              </a>

              <a
                href={DEVELOPER_INFO.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn — ${DEVELOPER_INFO.name} (opens in a new tab)`}
                className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-on-forest transition-colors hover:border-brand-lime hover:bg-brand-lime hover:text-surface-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              >
                <LinkedInIcon className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
                <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-75" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
