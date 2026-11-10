import React from "react";
import { CircleDollarSign, TrendingUp } from "lucide-react";

const TotalRevenue = async ({
  totalRevenue = 0,
  percentageChange = 0,
}: {
  totalRevenue?: number;
  percentageChange?: number;
}) => {
  const formattedRevenue = Number(totalRevenue || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className="dash-card-enter group rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento transition-all duration-300 hover:shadow-bento-hover hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Total Revenue
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-transform duration-200 group-hover:scale-105">
          <CircleDollarSign className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink">
          ${formattedRevenue}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-text-muted font-medium">
          {percentageChange > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              +{percentageChange}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              Active
            </span>
          )}
          <span>total donations volume</span>
        </div>
      </div>
    </div>
  );
};

export default TotalRevenue;
