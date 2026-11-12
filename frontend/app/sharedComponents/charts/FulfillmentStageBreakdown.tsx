import React from "react";
import { Clock, AlertCircle, Truck, CheckCircle2 } from "lucide-react";
import { CanonicalOrderStage, IOrderPipelineStage } from "@/app/types/Analytics";
import { formatUsd, getStageLabel } from "@/app/utility/orderStage";

interface FulfillmentStageBreakdownProps {
  stages: IOrderPipelineStage[];
  singleColumnAtXl?: boolean;
  showBar?: boolean;
  compact?: boolean;
}

const STAGE_STYLES: Record<
  CanonicalOrderStage,
  {
    barClass: string;
    pillClass: string;
    icon: typeof Clock;
  }
> = {
  pending: {
    barClass: "bg-brand-amber",
    pillClass: "border-amber-200/80 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  processing: {
    barClass: "bg-sky-600",
    pillClass: "border-sky-200/80 bg-sky-50 text-sky-800",
    icon: AlertCircle,
  },
  "on the way": {
    barClass: "bg-purple-600",
    pillClass: "border-purple-200/80 bg-purple-50 text-purple-800",
    icon: Truck,
  },
  received: {
    barClass: "bg-surface-forest",
    pillClass: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
};

export const FulfillmentStageBreakdown: React.FC<
  FulfillmentStageBreakdownProps
> = ({
  stages,
  singleColumnAtXl = false,
  showBar = true,
  compact = false,
}) => {
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {showBar && (
        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-bento gap-0.5"
          role="img"
          aria-label={`Order fulfillment breakdown across ${totalCount} paid orders`}
        >
          {totalCount > 0 &&
            stages
              .filter((s) => s.count > 0)
              .map((stage) => {
                const pct = Math.max(4, (stage.count / totalCount) * 100);
                const cfg = STAGE_STYLES[stage.status];
                return (
                  <div
                    key={stage.status}
                    style={{ width: `${pct}%` }}
                    className={`${cfg.barClass} transition-all duration-300`}
                    title={`${getStageLabel(stage.status)}: ${stage.count} (${formatUsd(stage.amount)})`}
                  />
                );
              })}
        </div>
      )}

      <ul
        className={`grid ${compact ? "gap-2" : "gap-2.5"} ${
          singleColumnAtXl
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {stages.map((stage) => {
          const cfg = STAGE_STYLES[stage.status];
          const Icon = cfg.icon;
          const pct =
            totalCount > 0 ? Math.round((stage.count / totalCount) * 100) : 0;

          if (compact) {
            return (
              <li
                key={stage.status}
                className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle/80 bg-surface-bento/40 px-3 py-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${cfg.pillClass}`}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="truncate text-xs font-semibold text-text-ink">
                    {getStageLabel(stage.status)}
                  </span>
                  <span className="text-[11px] font-medium text-text-muted tabular-nums">
                    {formatUsd(stage.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs tabular-nums">
                  <span className="font-bold text-text-ink">{stage.count}</span>
                  <span className="w-8 text-right text-[11px] font-medium text-text-body">
                    {pct}%
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li
              key={stage.status}
              className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle/80 bg-surface-bento/40 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${cfg.pillClass}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-text-ink">
                    {getStageLabel(stage.status)}
                  </span>
                  <span className="block text-[11px] text-text-body">
                    {formatUsd(stage.amount)}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-sm font-bold text-text-ink tabular-nums">
                  {stage.count}
                </span>
                <span className="block text-[10px] font-medium text-text-body tabular-nums">
                  {pct}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FulfillmentStageBreakdown;
