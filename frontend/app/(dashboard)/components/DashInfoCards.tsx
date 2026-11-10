import React from "react";
import TotalRevenue from "./DashInfoCards/TotalRevenue";
import TotalProduct from "./DashInfoCards/TotalProduct";
import TotalSchools from "./DashInfoCards/TotalSchools";
import TotalDonar from "./DashInfoCards/TotalDonar";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";

export async function getCounts() {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return;
  }
  const res = await fetch(`${SERVERURLAPI}/edudrop-admin/get-counts`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    next: { tags: ["getCounts"] },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const DashInfoCards = async () => {
  const data = await getCounts();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <TotalRevenue
        totalRevenue={data?.data?.totalRevenue ?? 0}
        percentageChange={data?.data?.percentageChange ?? 0}
      />
      <TotalProduct productCount={data?.data?.productCount ?? 0} />
      <TotalDonar
        donarCount={data?.data?.donarCount ?? 0}
        donarCountLastMonth={data?.data?.donarCountLastMonth ?? 0}
      />
      <TotalSchools schoolCount={data?.data?.schoolCount ?? 0} />
    </div>
  );
};

export default DashInfoCards;
