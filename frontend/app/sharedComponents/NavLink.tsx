"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkProps {
  href: string;
  text: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

export const NavLink = ({
  href,
  text,
  mobile = false,
  onNavigate,
}: NavLinkProps) => {
  const pathname = usePathname();

  const isActive =
    href === "/"
      ? pathname === "/"
      : href.startsWith("#")
        ? false
        : pathname.startsWith(href);

  const linkClasses = cn(
    "relative transition-colors duration-200 whitespace-nowrap text-sm font-medium",
    mobile
      ? "text-text-ink hover:text-surface-forest block py-2.5 text-base font-semibold"
      : isActive
        ? "text-brand-lime font-semibold"
        : "text-white/80 hover:text-white"
  );

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <li>
      <Link href={href} onClick={handleClick} className={linkClasses}>
        {text}
      </Link>
    </li>
  );
};

export default NavLink;
