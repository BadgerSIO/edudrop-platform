"use client";

import React, { useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import { Repeat } from "lucide-react";
import { IRangeSeriesSummary, TimeRangeKey } from "@/app/types/Analytics";
import { resolveEduDropChartPalette } from "@/app/utility/chartTheme";
import { formatUsd } from "@/app/utility/orderStage";
import ApexChartFrame from "@/app/sharedComponents/charts/ApexChartFrame";
import ChartStateNotice from "@/app/sharedComponents/charts/ChartStateNotice";

interface SalesChartProps {
  seriesByRange?: Record<TimeRangeKey, IRangeSeriesSummary>;
  defaultRange?: TimeRangeKey;
  totalPaidOrders?: number;
  activeSpanLabel?: string | null;
}

const RANGE_TABS: { key: TimeRangeKey; label: string }[] = [
  { key: "all", label: "All Active" },
  { key: "12m", label: "12M" },
  { key: "6m", label: "6M" },
];

const SalesChart = ({
  seriesByRange,
  defaultRange = "all",
  totalPaidOrders = 0,
  activeSpanLabel = null,
}: SalesChartProps) => {
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>(defaultRange);
  const [chartMode, setChartMode] = useState<"bar" | "area">("bar");

  const activeSeries = seriesByRange?.[selectedRange];
  const palette = useMemo(() => resolveEduDropChartPalette(), []);

  const canRenderChart =
    Boolean(seriesByRange) &&
    totalPaidOrders > 0 &&
    Boolean(activeSeries && activeSeries.activeMonthsCount >= 2);

  const recurringSeries = useMemo(
    () => activeSeries?.points.map((p) => p.recurringRevenue) || [],
    [activeSeries]
  );
  const oneTimeSeries = useMemo(
    () => activeSeries?.points.map((p) => p.oneTimeRevenue) || [],
    [activeSeries]
  );
  const categories = useMemo(
    () => activeSeries?.points.map((p) => p.monthLabel) || [],
    [activeSeries]
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "edudrop-sponsorship-trend",
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      colors: [palette.forest, palette.amber],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: categories.length <= 3 ? "28%" : "50%",
        },
      },
      stroke:
        chartMode === "area"
          ? { curve: "smooth", width: 2 }
          : { width: 0 },
      fill:
        chartMode === "area"
          ? {
              type: "gradient",
              gradient: {
                shadeIntensity: 0.25,
                opacityFrom: 0.38,
                opacityTo: 0.08,
                stops: [0, 95, 100],
              },
            }
          : { opacity: 1 },
      dataLabels: { enabled: false },
      grid: {
        borderColor: palette.borderSubtle,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: palette.body,
            fontSize: "11px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `$${Math.round(val).toLocaleString()}`,
          style: {
            colors: palette.body,
            fontSize: "11px",
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        fontWeight: 600,
        labels: { colors: palette.ink },
        markers: { size: 6 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => formatUsd(val),
        },
      },
    }),
    [categories, chartMode, palette]
  );

  const apexSeries = useMemo(
    () => [
      { name: "Monthly Recurring", data: recurringSeries },
      { name: "One-Time", data: oneTimeSeries },
    ],
    [recurringSeries, oneTimeSeries]
  );

  const singleActiveMonth = useMemo(
    () => activeSeries?.points.find((p) => p.orderCount > 0) || null,
    [activeSeries]
  );

  const renderBody = () => {
    if (!seriesByRange || totalPaidOrders === 0) {
      return (
        <ChartStateNotice
          iconName="trending-up"
          title="No verified sponsorship volume yet"
          description="Completed paid sponsorship orders will unlock your monthly trend and recurring vs. one-time revenue breakdown."
          action={{ label: "Inspect Orders", href: "/dashboard/orders" }}
          secondaryAction={{ label: "Browse Supplies", href: "/products" }}
        />
      );
    }

    if (!activeSeries || activeSeries.windowOrderCount === 0) {
      return (
        <ChartStateNotice
          iconName="calendar-range"
          title={`No verified sponsorships in the last ${selectedRange === "6m" ? "6" : "12"} months`}
          description={
            activeSpanLabel
              ? `Recorded sponsorships currently span ${activeSpanLabel}. Switch to All Active to review historical activity.`
              : "Earlier sponsorship activity exists outside this trailing window."
          }
          action={{
            label: "Switch to All Active",
            onClick: () => setSelectedRange("all"),
          }}
        />
      );
    }

    if (activeSeries.activeMonthsCount < 2 && singleActiveMonth) {
      return (
        <ChartStateNotice
          iconName="bar-chart"
          title={`Single-Month Snapshot: ${singleActiveMonth.monthLabel}`}
          description="At least 2 active months of verified orders are needed to plot a month-over-month trajectory chart."
          action={{ label: "View Orders", href: "/dashboard/orders" }}
        >
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2.5 text-left">
            <div className="rounded-lg border border-border-subtle bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-body">
                Period Total
              </span>
              <span className="mt-1 block text-base font-extrabold text-text-ink tabular-nums">
                {formatUsd(singleActiveMonth.totalRevenue)}
              </span>
            </div>
            <div className="rounded-lg border border-border-subtle bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-body">
                Monthly Plans
              </span>
              <span className="mt-1 block text-base font-extrabold text-surface-forest tabular-nums">
                {formatUsd(singleActiveMonth.recurringRevenue)}
              </span>
            </div>
            <div className="rounded-lg border border-border-subtle bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-body">
                Orders
              </span>
              <span className="mt-1 block text-base font-extrabold text-text-ink tabular-nums">
                {singleActiveMonth.orderCount}
              </span>
            </div>
          </div>
        </ChartStateNotice>
      );
    }

    const recurringPct =
      activeSeries.windowRevenue > 0
        ? Math.round(
            (recurringSeries.reduce((s, v) => s + v, 0) /
              activeSeries.windowRevenue) *
              100
          )
        : 0;

    return (
      <div className="flex-1 flex flex-col justify-between gap-4">
        <ApexChartFrame
          type={chartMode}
          options={chartOptions}
          series={apexSeries}
          height={256}
          summaryText={`Sponsorship revenue chart showing ${activeSeries.windowOrderCount} verified orders totaling ${formatUsd(activeSeries.windowRevenue)} across ${activeSeries.activeMonthsCount} active months (${recurringPct}% recurring).`}
        />

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/70 pt-3 text-xs text-text-body">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Window Total:{" "}
              <strong className="text-text-ink tabular-nums">
                {formatUsd(activeSeries.windowRevenue)}
              </strong>
            </span>
            <span>
              Verified Orders:{" "}
              <strong className="text-text-ink tabular-nums">
                {activeSeries.windowOrderCount}
              </strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-bento/70 px-2.5 py-0.5 text-[11px] font-semibold text-text-ink">
            <Repeat className="h-3 w-3 text-surface-forest" aria-hidden="true" />
            {recurringPct}% Recurring Revenue
          </span>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-labelledby="sales-trend-heading"
      className="dash-card-enter h-full rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="sales-trend-heading"
              className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
            >
              Sponsorship Volume Trend
            </h2>
            {activeSeries?.spanLabel && (
              <span className="rounded-full border border-border-subtle bg-surface-bento/70 px-2.5 py-0.5 text-[11px] font-semibold text-text-body">
                {activeSeries.spanLabel}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            Verified paid sponsorships split by recurring monthly vs. one-time gifts
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 self-start">
          <div
            role="tablist"
            aria-label="Sponsorship timeframe"
            className="inline-flex flex-nowrap items-center rounded-xl border border-border-subtle bg-surface-bento/70 p-1"
          >
            {RANGE_TABS.map((tab) => {
              const selected = selectedRange === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSelectedRange(tab.key)}
                  className={`relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                    selected
                      ? "bg-surface-forest text-white after:content-[''] after:absolute after:inset-x-2 after:bottom-0.5 after:border-b-2 after:border-brand-lime"
                      : "text-text-body hover:text-text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {canRenderChart && (
            <div
              role="tablist"
              aria-label="Trend chart style"
              className="inline-flex flex-nowrap items-center rounded-xl border border-border-subtle bg-surface-bento/70 p-1"
            >
              {(["bar", "area"] as const).map((mode) => {
                const selected = chartMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setChartMode(mode)}
                    className={`relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                      selected
                        ? "bg-surface-forest text-white after:content-[''] after:absolute after:inset-x-2 after:bottom-0.5 after:border-b-2 after:border-brand-lime"
                        : "text-text-body hover:text-text-ink"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {renderBody()}
    </section>
  );
};

export default SalesChart;
