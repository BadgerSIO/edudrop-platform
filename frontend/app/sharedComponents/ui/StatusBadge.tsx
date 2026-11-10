"use client";

import React from "react";

export type StatusTone = "active" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  size?: "sm" | "md";
}

const TONE_STYLES: Record<
  StatusTone,
  { badge: string; dot: string }
> = {
  active: {
    badge: "border-surface-forest/20 bg-surface-forest/10 text-surface-forest",
    dot: "bg-surface-forest",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  danger: {
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  neutral: {
    badge: "border-border-subtle bg-surface-bento/60 text-text-muted",
    dot: "bg-gray-400",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone,
  size = "sm",
}) => {
  const styles = TONE_STYLES[tone];
  const padding = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex select-none items-center gap-1.5 rounded-full border font-semibold cursor-default ${padding} ${styles.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
