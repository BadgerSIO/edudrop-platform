import React from "react";
import { cn } from "@/lib/utils";

export type BrandLogoVariant = "on-dark" | "on-light";
export type BrandLogoSize = "sm" | "md" | "lg";

export interface BrandLogoProps {
  /** Surface contrast mode: 'on-dark' for Forest Emerald surfaces, 'on-light' for white/bento surfaces */
  variant?: BrandLogoVariant;
  /** Lockup scale preset */
  size?: BrandLogoSize;
  /** Show the uppercase 'FOUNDATION' subtitle under the wordmark */
  showTagline?: boolean;
  /** Render only the emblem tile (with accessible sr-only label) */
  markOnly?: boolean;
  /** Collapse wordmark on viewports below `lg` (ideal for 72px narrow sidebar rails) */
  compactBelowLg?: boolean;
  className?: string;
}

const sizeMap: Record<
  BrandLogoSize,
  {
    icon: string;
    gap: string;
    wordmark: string;
    tagline: string;
  }
> = {
  sm: {
    icon: "h-8 w-8",
    gap: "gap-2.5",
    wordmark: "text-[19px]",
    tagline: "text-[8.5px] tracking-[0.22em]",
  },
  md: {
    icon: "h-9 w-9",
    gap: "gap-2.5",
    wordmark: "text-[22px]",
    tagline: "text-[9.5px] tracking-[0.22em]",
  },
  lg: {
    icon: "h-11 w-11",
    gap: "gap-3",
    wordmark: "text-[26px]",
    tagline: "text-[10.5px] tracking-[0.24em]",
  },
};

/**
 * Geometric EduDrop vector emblem: rounded squircle housing a pure water droplet
 * cradling an open textbook silhouette. Uses paired Forest Emerald (#0A3C28) and
 * Electric Lime (#9EF01A) tokens engineered for >= 8.4:1 contrast on both themes.
 */
export const LogoMark: React.FC<{
  variant?: BrandLogoVariant;
  className?: string;
}> = ({ variant = "on-light", className }) => {
  const isDark = variant === "on-dark";
  const tileFill = isDark ? "#9EF01A" : "#0A3C28";
  const dropletFill = isDark ? "#0A3C28" : "#9EF01A";
  const bookFill = isDark ? "#FFFFFF" : "#0A3C28";

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "shrink-0 rounded-[27.5%] [forced-colors:active]:border [forced-colors:active]:border-[CanvasText]",
        className
      )}
    >
      <rect width="40" height="40" rx="11" fill={tileFill} />
      <path
        d="M20 6.5C25.2 12.2 30.5 19.2 30.5 24.5C30.5 30.1 25.8 34.5 20 34.5C14.2 34.5 9.5 30.1 9.5 24.5C9.5 19.2 14.8 12.2 20 6.5Z"
        fill={dropletFill}
      />
      <path d="M19.1 22.6L13.6 20.4V26.9L19.1 29.1V22.6Z" fill={bookFill} />
      <path d="M20.9 22.6L26.4 20.4V26.9L20.9 29.1V22.6Z" fill={bookFill} />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "on-light",
  size = "md",
  showTagline = false,
  markOnly = false,
  compactBelowLg = false,
  className,
}) => {
  const isDark = variant === "on-dark";
  const scale = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center select-none",
        scale.gap,
        className
      )}
    >
      <LogoMark variant={variant} className={scale.icon} />

      {markOnly ? (
        <span className="sr-only">EduDrop Foundation</span>
      ) : (
        <span
          className={cn(
            "flex flex-col leading-none",
            compactBelowLg && "hidden lg:flex"
          )}
        >
          <span
            className={cn(
              "font-display font-extrabold tracking-tight leading-none",
              scale.wordmark
            )}
          >
            <span className={isDark ? "text-white" : "text-text-ink"}>
              Edu
            </span>
            <span
              className={isDark ? "text-brand-lime" : "text-surface-forest"}
            >
              Drop
            </span>
          </span>

          {showTagline && (
            <span
              className={cn(
                "mt-1 font-sans font-bold uppercase leading-none",
                scale.tagline,
                isDark ? "text-on-forest-muted" : "text-text-body"
              )}
            >
              Foundation
            </span>
          )}
        </span>
      )}

      {!markOnly && compactBelowLg && (
        <span className="sr-only lg:hidden">EduDrop Foundation</span>
      )}
    </span>
  );
};

export default BrandLogo;
