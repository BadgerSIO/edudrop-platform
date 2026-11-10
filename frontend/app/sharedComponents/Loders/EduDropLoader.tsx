import React from "react";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EduDropLoaderProps {
  size?: "sm" | "md" | "lg";
  tone?: "forest" | "lime";
  label?: string;
  sublabel?: string;
  className?: string;
  compact?: boolean;
}

const sizeMap = {
  sm: {
    ring: "28px",
    thickness: "2.5px",
    iconClass: "h-3 w-3",
  },
  md: {
    ring: "42px",
    thickness: "3px",
    iconClass: "h-4 w-4",
  },
  lg: {
    ring: "54px",
    thickness: "3.5px",
    iconClass: "h-5 w-5",
  },
};

/**
 * Branded, accessible indeterminate loader built on the native <progress> element.
 */
export const EduDropLoader: React.FC<EduDropLoaderProps> = ({
  size = "md",
  tone = "forest",
  label = "Loading content...",
  sublabel,
  className,
  compact = false,
}) => {
  const { ring, thickness, iconClass } = sizeMap[size];

  const spinnerStyles = {
    "--size": ring,
    "--thickness": thickness,
    "--spinner-color":
      tone === "lime" ? "rgb(var(--brand-lime))" : "rgb(var(--surface-forest))",
    "--track-color":
      tone === "lime"
        ? "rgba(255, 255, 255, 0.2)"
        : "rgb(var(--border-subtle))",
  } as React.CSSProperties;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-2" : "min-h-[36vh] gap-3.5 py-10",
        className
      )}
    >
      <div className="relative inline-flex items-center justify-center">
        <progress
          aria-label={label}
          className="loading-spinner"
          style={spinnerStyles}
        />
        <Droplets
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute",
            iconClass,
            tone === "lime" ? "text-brand-lime" : "text-surface-forest"
          )}
        />
      </div>

      {label && (
        <div className="space-y-1">
          <p
            className={cn(
              "font-semibold tracking-tight",
              size === "sm" ? "text-xs" : "text-sm",
              tone === "lime" ? "text-on-forest" : "text-text-ink"
            )}
          >
            {label}
          </p>
          {sublabel && (
            <p
              className={cn(
                "text-xs",
                tone === "lime" ? "text-on-forest-muted" : "text-text-body"
              )}
            >
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EduDropLoader;
