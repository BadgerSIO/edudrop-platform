"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ChevronRight, Home } from "lucide-react";

function formatSegment(str: string): string {
  // Preserve business order codes such as "ORDER-5f809549" instead of stripping hyphens
  const orderMatch = str.match(/^order-([a-z0-9]+)$/i);
  if (orderMatch) {
    return `ORDER-${orderMatch[1]}`;
  }

  // Fallback for legacy 24-hex ObjectIds so Breadcrumbs never dump raw database PKs
  if (/^[a-f\d]{24}$/i.test(str)) {
    return `#${str.slice(-6).toUpperCase()}`;
  }

  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  if (pathSegments.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        <li>
          <Link
            href={`/${pathSegments[0]}`}
            className="flex items-center gap-1 text-text-body hover:text-surface-forest transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="capitalize">{formatSegment(pathSegments[0])}</span>
          </Link>
        </li>

        {pathSegments.slice(1).map((segment, idx) => {
          const isLast = idx === pathSegments.length - 2;
          const href = `/${pathSegments.slice(0, idx + 2).join("/")}`;

          return (
            <React.Fragment key={href}>
              <li aria-hidden="true" className="text-text-body/40">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-semibold text-text-ink bg-white/80 px-2.5 py-1 rounded-lg border border-border-subtle shadow-xs">
                    {formatSegment(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-text-body hover:text-surface-forest transition-colors"
                  >
                    {formatSegment(segment)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
