"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScrollToId from "../hooks/useScrollToId";
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
  const { scrollToId } = useScrollToId();

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

  if (text === "Contact" && pathname !== "/") {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            if (onNavigate) onNavigate();
            scrollToId("contact", "/");
          }}
          className={linkClasses}
        >
          {text}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} onClick={handleClick} className={linkClasses}>
        {text}
      </Link>
    </li>
  );
};

export default NavLink;
