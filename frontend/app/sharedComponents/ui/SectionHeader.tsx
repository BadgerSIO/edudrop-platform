import React from "react";
import { cn } from "@/lib/utils";
import SectionEyebrow from "./SectionEyebrow";

export interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowVariant?: "light" | "dark" | "lime";
  title: string;
  titleId?: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  eyebrowVariant,
  title,
  titleId,
  subtitle,
  action,
  align = "left",
  theme = "light",
  className,
}) => {
  const isDark = theme === "dark";
  const defaultEyebrowVariant = eyebrowVariant || (isDark ? "dark" : "light");

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <SectionEyebrow variant={defaultEyebrowVariant}>
          {eyebrow}
        </SectionEyebrow>
      )}

      <div
        className={cn(
          "flex w-full flex-col gap-4",
          action && "md:flex-row md:items-end md:justify-between"
        )}
      >
        <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
          <h2
            id={titleId}
            className={cn(
              "text-h2 font-bold tracking-tight",
              isDark ? "text-on-forest" : "text-text-ink"
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "mt-3 text-base sm:text-lg leading-relaxed",
                isDark ? "text-on-forest-muted" : "text-text-body"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="mt-2 shrink-0 md:mt-0">{action}</div>}
      </div>
    </div>
  );
};

export default SectionHeader;
