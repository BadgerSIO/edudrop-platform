"use client";

import React, { useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import {
  ICategoryBreakdownItem,
  ISchoolBreakdownItem,
} from "@/app/types/Analytics";
import { resolveEduDropChartPalette } from "@/app/utility/chartTheme";
import { formatUsd } from "@/app/utility/orderStage";
import ApexChartFrame from "@/app/sharedComponents/charts/ApexChartFrame";
import ChartStateNotice from "@/app/sharedComponents/charts/ChartStateNotice";

interface FundingBreakdownCardProps {
  schools?: ISchoolBreakdownItem[];
  categories?: ICategoryBreakdownItem[];
  dimension?: "school" | "category";
}

const FundingBreakdownCard: React.FC<FundingBreakdownCardProps> = ({
  schools = [],
  categories = [],
  dimension,
}) => {
  const [selectedTab, setSelectedTab] = useState<"school" | "category">(
    dimension || "school"
  );
  const activeTab = dimension || selectedTab;
  const palette = useMemo(() => resolveEduDropChartPalette(), []);

  const topSchools = useMemo(() => schools.slice(0, 8), [schools]);
  const topCategories = useMemo(() => categories.slice(0, 8), [categories]);

  const activeRows = activeTab === "school" ? topSchools : topCategories;
  const totalInTab = useMemo(
    () =>
      activeTab === "school"
        ? schools.reduce((sum, s) => sum + s.orderRevenue, 0)
        : categories.reduce((sum, c) => sum + c.revenue, 0),
    [activeTab, schools, categories]
  );

  const barLabels = useMemo(
    () =>
      activeTab === "school"
        ? topSchools.map((s) => s.schoolName)
        : topCategories.map((c) => c.title),
    [activeTab, topSchools, topCategories]
  );

  const barValues = useMemo(
    () =>
      activeTab === "school"
        ? topSchools.map((s) => s.orderRevenue)
        : topCategories.map((c) => c.revenue),
    [activeTab, topSchools, topCategories]
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: `edudrop-breakdown-${activeTab}`,
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      colors: [activeTab === "school" ? palette.forest : palette.forestLight],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: barLabels.length <= 3 ? "42%" : "56%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        borderColor: palette.borderSubtle,
        strokeDashArray: 4,
        padding: { left: 18, right: 12 },
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: barLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          formatter: (val: string) => `$${Math.round(Number(val) || 0)}`,
          style: {
            colors: palette.body,
            fontSize: "11px",
          },
        },
      },
      yaxis: {
        labels: {
          maxWidth: 215,
          style: {
            colors: palette.ink,
            fontSize: "11px",
            fontWeight: 600,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number, opts?: { dataPointIndex?: number }) => {
            const idx = opts?.dataPointIndex ?? 0;
            const share =
              totalInTab > 0 ? Math.round((val / totalInTab) * 100) : 0;
            if (activeTab === "school") {
              const s = topSchools[idx];
              if (!s) return formatUsd(val);
              const balanceNote =
                s.cumulativeBalance > s.orderRevenue
                  ? ` · Cumulative campus balance: ${formatUsd(s.cumulativeBalance)}`
                  : "";
              return `${formatUsd(val)} (${share}% · ${s.orderCount} order${s.orderCount === 1 ? "" : "s"}${balanceNote})`;
            }
            const c = topCategories[idx];
            if (!c) return formatUsd(val);
            return `${formatUsd(val)} (${share}% · ${c.units} unit${c.units === 1 ? "" : "s"} across ${c.orderCount} order${c.orderCount === 1 ? "" : "s"})`;
          },
        },
      },
    }),
    [activeTab, barLabels, palette, topCategories, topSchools, totalInTab]
  );

  const apexSeries = useMemo(
    () => [
      {
        name:
          activeTab === "school" ? "Verified Order Funding" : "Category Volume",
        data: barValues,
      },
    ],
    [activeTab, barValues]
  );

  const chartHeight = Math.max(236, activeRows.length * 52 + 24);

  const renderContent = () => {
    if (activeRows.length === 0) {
      return (
        <div className="flex-1 flex flex-col justify-center">
          {activeTab === "school" ? (
            <ChartStateNotice
              iconName="building"
              title="No campus funding orders yet"
              description="Once donors sponsor partner schools, verified funding distribution by campus will appear here."
              action={{ label: "Manage Schools", href: "/dashboard/schools-list" }}
              compact
            />
          ) : (
            <ChartStateNotice
              iconName="tags"
              title="No categorized supply volume yet"
              description="Sponsorship items grouped by supply category will rank here after the first completed order."
              action={{ label: "View Catalog", href: "/dashboard/product-list" }}
              compact
            />
          )}
        </div>
      );
    }

    if (activeRows.length === 1) {
      if (activeTab === "school") {
        const s = topSchools[0];
        return (
          <div className="flex-1 flex flex-col justify-center">
            <ChartStateNotice
              iconName="building"
              title={`Single Campus Active: ${s.schoolName}`}
              description="Ranked comparison bar renders once 2 or more partner campuses receive verified sponsorship orders."
              action={{
                label: "Inspect Campus",
                href: s.slug
                  ? `/dashboard/schools-list/${s.slug}`
                  : "/dashboard/schools-list",
              }}
              compact
            >
              <div className="mx-auto flex max-w-xs items-center justify-between rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-xs">
                <span className="font-semibold text-text-ink">100% Share</span>
                <span className="font-extrabold text-surface-forest tabular-nums">
                  {formatUsd(s.orderRevenue)} ({s.orderCount} order
                  {s.orderCount === 1 ? "" : "s"})
                </span>
              </div>
            </ChartStateNotice>
          </div>
        );
      }

      const c = topCategories[0];
      return (
        <div className="flex-1 flex flex-col justify-center">
          <ChartStateNotice
            iconName="tags"
            title={`Single Category Active: ${c.title}`}
            description="Category comparison bars display once sponsorships span 2 or more product categories."
            action={{
              label: "Browse Catalog",
              href: "/dashboard/product-list",
            }}
            compact
          >
            <div className="mx-auto flex max-w-xs items-center justify-between rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-xs">
              <span className="font-semibold text-text-ink">100% Share</span>
              <span className="font-extrabold text-surface-forest tabular-nums">
                {formatUsd(c.revenue)} ({c.units} units)
              </span>
            </div>
          </ChartStateNotice>
        </div>
      );
    }

    return (
      <div className="flex-1">
        <ApexChartFrame
          type="bar"
          options={chartOptions}
          series={apexSeries}
          height={chartHeight}
          summaryText={`Verified sponsorship allocation ${activeTab === "school" ? "by campus" : "by supply category"} totaling ${formatUsd(totalInTab)}.`}
        />
      </div>
    );
  };

  const headingId = `funding-breakdown-heading-${activeTab}`;
  const headingText = dimension
    ? dimension === "school"
      ? "Campus Funding Allocation"
      : "Supply Category Mix"
    : "Funding Allocation";
  const subtitleText =
    activeTab === "school"
      ? `Verified paid order volume (${formatUsd(totalInTab)}) by partner school`
      : `Verified paid order volume (${formatUsd(totalInTab)}) by product category`;

  return (
    <section
      aria-labelledby={headingId}
      className="dash-card-enter h-full rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id={headingId}
            className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
          >
            {headingText}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">{subtitleText}</p>
        </div>

        {!dimension ? (
          <div
            role="tablist"
            aria-label="Allocation breakdown dimension"
            className="inline-flex flex-nowrap items-center self-start rounded-xl border border-border-subtle bg-surface-bento/70 p-1"
          >
            {(
              [
                { key: "school", label: "By School" },
                { key: "category", label: "By Category" },
              ] as const
            ).map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setSelectedTab(tab.key)}
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
        ) : (
          <span className="self-start rounded-full border border-border-subtle bg-surface-bento/70 px-2.5 py-0.5 text-[11px] font-semibold text-text-body whitespace-nowrap">
            {dimension === "school"
              ? `${schools.length} campus${schools.length === 1 ? "" : "es"}`
              : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
          </span>
        )}
      </div>

      {renderContent()}
    </section>
  );
};

export default FundingBreakdownCard;
