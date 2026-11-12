import React from "react";
import { CircleDollarSign, TrendingUp, TrendingDown } from "lucide-react";

const TotalRevenue = async ({
  totalRevenue = 0,
  percentageChange = 0,
  hasMoMBaseline = false,
  paidOrderCount = 0,
  recurringOrderCount = 0,
  activeSpanLabel = null,
}: {
  totalRevenue?: number;
  percentageChange?: number;
  hasMoMBaseline?: boolean;
  paidOrderCount?: number;
  recurringOrderCount?: number;
  activeSpanLabel?: string | null;
}) => {
  const formattedRevenue = Number(totalRevenue || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const renderBadge = () => {
    if (hasMoMBaseline && percentageChange > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          +{percentageChange}% MoM
        </span>
      );
    }

    if (hasMoMBaseline && percentageChange < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          <TrendingDown className="h-3 w-3" aria-hidden="true" />
          {percentageChange}% MoM
        </span>
      );
    }

    if (paidOrderCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
          {paidOrderCount} paid · {recurringOrderCount} monthly
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
        No orders yet
      </span>
    );
  };

  return (
    <div className="dash-card-enter group h-full flex flex-col justify-between rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento transition-all duration-300 hover:shadow-bento-hover hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Total Revenue
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-transform duration-200 group-hover:scale-105">
          <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink tabular-nums">
          ${formattedRevenue}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted font-medium">
          {renderBadge()}
          <span>
            {hasMoMBaseline
              ? "vs last month"
              : activeSpanLabel
                ? activeSpanLabel
                : "verified sponsorships"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalRevenue;
