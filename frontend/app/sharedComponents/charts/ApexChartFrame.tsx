"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { Props as ReactApexChartProps } from "react-apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ApexChartFrameProps {
  type: NonNullable<ReactApexChartProps["type"]>;
  options: ApexOptions;
  series: NonNullable<ReactApexChartProps["series"]>;
  height: number;
  summaryText: string;
}

/**
 * SSR-safe wrapper for react-apexcharts preventing layout shift (CLS) before
 * hydration and exposing an accessible figure summary for screen readers.
 */
export const ApexChartFrame: React.FC<ApexChartFrameProps> = ({
  type,
  options,
  series,
  height,
  summaryText,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <figure className="m-0 w-full">
      <div style={{ minHeight: `${height}px` }} className="w-full">
        {mounted ? (
          <ReactApexChart
            type={type}
            options={options}
            series={series}
            width="100%"
            height={height}
          />
        ) : (
          <div
            style={{ height: `${height}px` }}
            className="w-full animate-pulse rounded-xl bg-surface-bento/60"
            aria-hidden="true"
          />
        )}
      </div>
      <figcaption className="sr-only">{summaryText}</figcaption>
    </figure>
  );
};

export default ApexChartFrame;
