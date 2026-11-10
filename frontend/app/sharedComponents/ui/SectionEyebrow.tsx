import React from "react";
import { cn } from "@/lib/utils";

export interface SectionEyebrowProps {
  children: React.ReactNode;
  variant?: "light" | "dark" | "lime";
  className?: string;
}

export const SectionEyebrow: React.FC<SectionEyebrowProps> = ({
  children,
  variant = "light",
  className,
}) => {
  const variantClasses = {
    light:
      "border border-text-ink/20 bg-white text-text-ink shadow-sm",
    dark:
      "border border-white/25 bg-white/10 text-brand-lime backdrop-blur-sm",
    lime:
      "bg-brand-lime text-surface-forest font-semibold shadow-sm",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide select-none",
        variantClasses,
        className
      )}
    >
      {children}
    </span>
  );
};

export default SectionEyebrow;
