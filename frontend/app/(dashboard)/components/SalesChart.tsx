"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SalesChartProps {
  data?: { month: string; revenue: number }[];
}

const SalesChart = ({ data }: SalesChartProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [months, setMonths] = useState<string[]>([]);
  const [revenues, setRevenues] = useState<number[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      setMonths(data.map((d) => d.month));
      setRevenues(data.map((d) => d.revenue));
    } else {
      // Default to last 12 months with 0
      const defaultMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      setMonths(defaultMonths);
      setRevenues(new Array(12).fill(0));
    }
  }, [data]);

  let categories = months.slice();
  let mobileRevenueData = revenues.slice();

  if (isMobile) {
    categories = months.slice(Math.max(months.length - 6, 0));
    mobileRevenueData = revenues.slice(Math.max(revenues.length - 6, 0));
  }

  const options = {
    chart: {
      id: "revenue-bar-chart",
      toolbar: { show: false },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#0A3C28",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val: any) {
          return `$${val}`;
        },
        style: {
          colors: "#666",
          fontSize: "11px",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: function (val: any) {
          return `$${val?.toLocaleString()}`;
        },
      },
    },
    colors: ["#0A3C28"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: isMobile ? mobileRevenueData : revenues,
    },
  ];

  return (
    <div className="flex-auto rounded-2xl border border-border-subtle bg-white p-5 shadow-sm sm:px-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-text-ink sm:text-lg">
          Monthly Revenue Trend
        </h2>
        <p className="text-xs text-text-muted">Direct verified sponsorships across 12 months</p>
      </div>
      <ApexCharts
        options={options}
        series={series}
        type="bar"
        width={"100%"}
        height={isMobile ? "240" : "320"}
      />
    </div>
  );
};

export default SalesChart;
