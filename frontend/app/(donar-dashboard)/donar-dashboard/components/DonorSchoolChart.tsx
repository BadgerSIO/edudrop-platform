"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import type { ApexOptions } from "apexcharts";
import { IDonorSchoolAllocationItem } from "@/app/types/Analytics";
import { resolveEduDropChartPalette } from "@/app/utility/chartTheme";
import { formatUsd } from "@/app/utility/orderStage";
import ApexChartFrame from "@/app/sharedComponents/charts/ApexChartFrame";

interface DonorSchoolChartProps {
  allocations: IDonorSchoolAllocationItem[];
  totalAmount: number;
}

const DonorSchoolChart: React.FC<DonorSchoolChartProps> = ({
  allocations,
  totalAmount,
}) => {
  const palette = useMemo(() => resolveEduDropChartPalette(), []);

  const topAllocations = useMemo(() => allocations.slice(0, 6), [allocations]);

  const seriesColors = useMemo(
    () => [
      palette.forest,
      palette.amber,
      palette.sky,
      palette.purple,
      palette.emerald,
      palette.forestLight,
    ],
    [palette]
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "edudrop-donor-school-allocation",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      labels: topAllocations.map((s) => s.schoolName),
      colors: seriesColors.slice(0, topAllocations.length),
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
                fontSize: "16px",
                fontWeight: 800,
                color: palette.ink,
                formatter: (val: string) => formatUsd(Number(val)),
              },
              total: {
                show: true,
                label: "Verified Given",
                fontSize: "11px",
                fontWeight: 600,
                color: palette.body,
                formatter: () => formatUsd(totalAmount),
              },
            },
          },
        },
      },
      tooltip: {
        y: {
          formatter: (val: number, opts?: { seriesIndex?: number }) => {
            const idx = opts?.seriesIndex ?? 0;
            const s = topAllocations[idx];
            return s
              ? `${formatUsd(val)} across ${s.orderCount} order${s.orderCount === 1 ? "" : "s"}`
              : formatUsd(val);
          },
        },
      },
    }),
    [palette, seriesColors, topAllocations, totalAmount]
  );

  const series = useMemo(
    () => topAllocations.map((s) => s.amount),
    [topAllocations]
  );

  return (
    <div className="space-y-4">
      <ApexChartFrame
        type="donut"
        options={chartOptions}
        series={series}
        height={190}
        summaryText={`Donation allocation across ${allocations.length} partner campuses totaling ${formatUsd(totalAmount)}.`}
      />

      <ul className="space-y-2">
        {topAllocations.map((school, idx) => {
          const share =
            totalAmount > 0
              ? Math.round((school.amount / totalAmount) * 100)
              : 0;
          return (
            <li
              key={school.schoolId}
              className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle/80 bg-surface-bento/40 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: seriesColors[idx % seriesColors.length],
                  }}
                />
                {school.slug ? (
                  <Link
                    href={`/schools/${school.slug}`}
                    className="truncate font-semibold text-text-ink hover:text-surface-forest hover:underline"
                  >
                    {school.schoolName}
                  </Link>
                ) : (
                  <span className="truncate font-semibold text-text-ink">
                    {school.schoolName}
                  </span>
                )}
              </div>
              <span className="shrink-0 font-bold text-text-ink tabular-nums">
                {formatUsd(school.amount)} ({share}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DonorSchoolChart;
