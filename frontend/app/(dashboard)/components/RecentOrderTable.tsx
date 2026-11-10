import { columns } from "@/app/sharedComponents/Table/columns";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
export async function getOrders(
  filters: Record<string, any> = {}, // Accept dynamic filters
  sortBy?: string,
  sortOrder?: string,
  page?: number,
  limit?: number,
) {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return;
  }
  let url = `${SERVERURLAPI}/order?sortBy=${
    sortBy ? sortBy : "createdAt"
  }&sortOrder=${sortOrder ? sortOrder : "asc"}&page=${page ? page : 1}&limit=${
    limit ? limit : ""
  }`;

  // Append dynamic filters from the 'filters' object
  for (const key in filters) {
    if (Object.prototype.hasOwnProperty.call(filters, key)) {
      url += `&${key}=${filters[key]}`;
    }
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    next: { tags: ["orderCollection"] },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

const RecentOrderTable = async () => {
  const data = await getOrders(
    {
      paymentStatus: true,
      orderStatus: "processing",
    },
    undefined,
    undefined,
    undefined,
    3,
  ); // Pass dynamic filter parameters
  return (
    <DataTable
      columns={columns}
      data={data?.data}
      searchPlaceholder="Search recent orders..."
      variant="embedded"
    />
  );
};

export default RecentOrderTable;
