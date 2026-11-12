"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarRange,
  ClipboardList,
  HeartHandshake,
  PackageCheck,
  School,
  Tags,
  TrendingUp,
  Truck,
} from "lucide-react";

const ICON_MAP = {
  "trending-up": TrendingUp,
  "calendar-range": CalendarRange,
  "bar-chart": BarChart3,
  "package-check": PackageCheck,
  "clipboard-list": ClipboardList,
  building: Building2,
  tags: Tags,
  "heart-handshake": HeartHandshake,
  school: School,
  truck: Truck,
} as const;

export type ChartStateIconName = keyof typeof ICON_MAP;

export interface ChartStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ChartStateNoticeProps {
  iconName: ChartStateIconName;
  title: string;
  description: string;
  action?: ChartStateAction;
  secondaryAction?: ChartStateAction;
  compact?: boolean;
  children?: React.ReactNode;
}

const ActionControl = ({
  action,
  primary = true,
}: {
  action: ChartStateAction;
  primary?: boolean;
}) => {
  const className = primary
    ? "inline-flex items-center gap-1.5 rounded-full bg-surface-forest px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-surface-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
    : "inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-ink shadow-xs transition-colors hover:bg-surface-bento focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime";

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        <span>{action.label}</span>
        {primary && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      <span>{action.label}</span>
      {primary && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
};

export const ChartStateNotice: React.FC<ChartStateNoticeProps> = ({
  iconName,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  children,
}) => {
  const Icon = ICON_MAP[iconName] || BarChart3;

  return (
    <div
      className={`flex flex-col justify-center rounded-xl border border-dashed border-border-subtle bg-surface-bento/45 text-center ${
        compact ? "min-h-[176px] p-5" : "min-h-[260px] p-6 sm:p-8"
      }`}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle bg-white text-surface-forest shadow-xs">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <h3 className="mt-3.5 text-sm font-bold text-text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-text-body">
        {description}
      </p>

      {children && <div className="mt-4">{children}</div>}

      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {action && <ActionControl action={action} primary />}
          {secondaryAction && (
            <ActionControl action={secondaryAction} primary={false} />
          )}
        </div>
      )}
    </div>
  );
};

export default ChartStateNotice;
