"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import type { ApexOptions } from "apexcharts";
import { Clock, ArrowRight } from "lucide-react";
import { IOrderPipelineStage } from "@/app/types/Analytics";
import { resolveEduDropChartPalette } from "@/app/utility/chartTheme";
import { formatUsd, getStageLabel } from "@/app/utility/orderStage";
import ApexChartFrame from "@/app/sharedComponents/charts/ApexChartFrame";
import ChartStateNotice from "@/app/sharedComponents/charts/ChartStateNotice";
import FulfillmentStageBreakdown from "@/app/sharedComponents/charts/FulfillmentStageBreakdown";

interface OrderPipelineCardProps {
  pipeline?: IOrderPipelineStage[];
  paidOrderCount?: number;
  totalRevenue?: number;
  unpaidPendingCount?: number;
}

const OrderPipelineCard: React.FC<OrderPipelineCardProps> = ({
  pipeline = [],
  paidOrderCount = 0,
  totalRevenue = 0,
  unpaidPendingCount = 0,
}) => {
  const palette = useMemo(() => resolveEduDropChartPalette(), []);

  const stageColorMap: Record<string, string> = useMemo(
    () => ({
      pending: palette.amber,
      processing: palette.sky,
      "on the way": palette.purple,
      received: palette.forest,
    }),
    [palette]
  );

  const activeStages = useMemo(
    () => pipeline.filter((s) => s.count > 0),
    [pipeline]
  );

  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "edudrop-order-pipeline-donut",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      labels: activeStages.map((s) => getStageLabel(s.status)),
      colors: activeStages.map((s) => stageColorMap[s.status] || palette.forest),
      stroke: { width: 2, colors: ["#ffffff"] },
      legend: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "11px",
                fontWeight: 600,
                color: palette.body,
              },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: 800,
                color: palette.ink,
                formatter: (val: string) => `${val}`,
              },
              total: {
                show: true,
                label: "Paid Orders",
                fontSize: "11px",
                fontWeight: 600,
                color: palette.body,
                formatter: () => `${paidOrderCount}`,
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number, opts?: { seriesIndex?: number }) => {
            const idx = opts?.seriesIndex ?? 0;
            const stage = activeStages[idx];
            return stage
              ? `${val} order${val === 1 ? "" : "s"} (${formatUsd(stage.amount)})`
              : `${val}`;
          },
        },
      },
    }),
    [activeStages, paidOrderCount, palette, stageColorMap]
  );

  const donutSeries = useMemo(
    () => activeStages.map((s) => s.count),
    [activeStages]
  );

  return (
    <section
      aria-labelledby="order-pipeline-heading"
      className="dash-card-enter h-full rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2
            id="order-pipeline-heading"
            className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
          >
            Fulfillment Pipeline
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Delivery stages across {formatUsd(totalRevenue)} paid volume
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline shrink-0"
        >
          <span>Manage</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {paidOrderCount === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <ChartStateNotice
            iconName="package-check"
            title="No orders in pipeline"
            description="Sponsorship deliveries will appear by stage once the first paid order is placed."
            action={{ label: "View Order Queue", href: "/dashboard/orders" }}
            compact
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-3">
          {activeStages.length >= 2 ? (
            <ApexChartFrame
              type="donut"
              options={donutOptions}
              series={donutSeries}
              height={176}
              summaryText={`Fulfillment distribution across ${paidOrderCount} paid orders: ${activeStages
                .map((s) => `${getStageLabel(s.status)}: ${s.count}`)
                .join(", ")}.`}
            />
          ) : (
            <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/45 px-4 py-3 text-xs text-text-body">
              All{" "}
              <strong className="text-text-ink">{paidOrderCount}</strong> verified
              order{paidOrderCount === 1 ? " is" : "s are"} currently in{" "}
              <strong className="text-surface-forest">
                {getStageLabel(activeStages[0].status)}
              </strong>
              . Donut chart displays once multiple stages become active.
            </div>
          )}

          <div className="space-y-2.5 mt-auto">
            <FulfillmentStageBreakdown
              stages={pipeline}
              singleColumnAtXl
              showBar={false}
              compact
            />

            {unpaidPendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
                <span>
                  +{unpaidPendingCount} unpaid recurring renewal
                  {unpaidPendingCount === 1 ? "" : "s"} awaiting donor checkout
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderPipelineCard;
