import React from "react";
import TotalRevenue from "./DashInfoCards/TotalRevenue";
import TotalProduct from "./DashInfoCards/TotalProduct";
import TotalSchools from "./DashInfoCards/TotalSchools";
import TotalDonar from "./DashInfoCards/TotalDonar";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { IAdminAnalyticsData } from "@/app/types/Analytics";

export async function getCounts() {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return null;
  }
  return safeFetchJson<{ data?: IAdminAnalyticsData } | null>(
    `${SERVERURLAPI}/edudrop-admin/get-counts`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["getCounts", "orderCollection"] },
      cache: "no-store",
    },
    null
  );
}

const DashInfoCards = async ({
  analytics,
}: {
  analytics?: IAdminAnalyticsData | null;
}) => {
  const counts = analytics ?? (await getCounts())?.data ?? null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <TotalRevenue
        totalRevenue={counts?.totalRevenue ?? 0}
        percentageChange={counts?.percentageChange ?? 0}
        hasMoMBaseline={counts?.hasMoMBaseline ?? false}
        paidOrderCount={counts?.paidOrderCount ?? 0}
        recurringOrderCount={counts?.recurringOrderCount ?? 0}
        activeSpanLabel={counts?.activeSpanLabel ?? null}
      />
      <TotalProduct productCount={counts?.productCount ?? 0} />
      <TotalDonar
        donarCount={counts?.donarCount ?? 0}
        donarCountLastMonth={counts?.donarCountLastMonth ?? 0}
      />
      <TotalSchools schoolCount={counts?.schoolCount ?? 0} />
    </div>
  );
};

export default DashInfoCards;
