import React from "react";
import { cn } from "@/lib/utils";

export interface FloatingTag {
  label: string;
  isPrimary?: boolean;
}

export interface FloatingPillTagsProps {
  tags: (string | FloatingTag)[];
  className?: string;
}

export const FloatingPillTags: React.FC<FloatingPillTagsProps> = ({
  tags,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tags.map((item, index) => {
        const isObject = typeof item !== "string";
        const label = isObject ? item.label : item;
        const isPrimary = isObject ? item.isPrimary : index === 0;

        return (
          <span
            key={index}
            className={cn(
              "inline-block rounded-full px-3.5 py-1.5 text-xs select-none transition-transform hover:scale-105",
              isPrimary
                ? "bg-brand-lime text-surface-forest font-semibold shadow-sm"
                : "bg-white/95 text-text-ink font-medium shadow-sm backdrop-blur-sm"
            )}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
};

export default FloatingPillTags;
