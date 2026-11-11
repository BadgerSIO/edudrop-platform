import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionPillButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  type?: "button" | "submit" | "reset";
  variant?: "lime" | "dark" | "outline-glass" | "outline-dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export const ActionPillButton: React.FC<ActionPillButtonProps> = ({
  children,
  href,
  onClick,
  type = "button",
  variant = "lime",
  size = "md",
  className,
  disabled = false,
  target,
  rel,
  ariaLabel,
}) => {
  const baseClasses =
    "group/pill inline-flex cursor-pointer items-center justify-between gap-3 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantClasses = {
    lime: "bg-brand-lime text-surface-forest hover:bg-brand-lime-hover shadow-sm hover:shadow-md",
    dark: "bg-text-ink text-white hover:bg-surface-forest hover:text-white shadow-sm hover:shadow-md",
    "outline-glass":
      "bg-white/10 text-white border border-white/15 hover:bg-white/20 hover:border-white/25 backdrop-blur-sm",
    "outline-dark":
      "bg-white text-text-ink border border-border-subtle hover:bg-surface-bento hover:border-surface-forest/30 shadow-sm",
  }[variant];

  const sizeClasses = {
    sm: "pl-4 pr-1.5 py-1.5 text-xs",
    md: "pl-5 pr-2 py-2 text-sm sm:text-base",
    lg: "pl-7 pr-2.5 py-2.5 text-base sm:text-lg",
  }[size];

  const circleSizeClasses = {
    sm: "h-6 w-6 min-w-[24px]",
    md: "h-7 w-7 min-w-[28px] sm:h-8 sm:w-8 sm:min-w-[32px]",
    lg: "h-9 w-9 min-w-[36px]",
  }[size];

  const circleIconClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const circleColorClasses = {
    lime: "bg-surface-forest text-white group-hover/pill:translate-x-0.5",
    dark: "bg-white text-text-ink group-hover/pill:translate-x-0.5",
    "outline-glass":
      "bg-brand-lime text-surface-forest group-hover/pill:translate-x-0.5",
    "outline-dark":
      "bg-surface-forest text-white group-hover/pill:translate-x-0.5",
  }[variant];

  const content = (
    <>
      <span className="inline-flex items-center justify-center gap-2 leading-none">
        {children}
      </span>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-transform duration-300",
          circleSizeClasses,
          circleColorClasses
        )}
      >
        <ArrowRight className={circleIconClasses} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
    >
      {content}
    </button>
  );
};

export default ActionPillButton;
