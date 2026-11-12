import { columns } from "@/app/sharedComponents/Table/columns";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import React from "react";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { IOrder } from "@/app/types/Order";
export async function getOrders(
  filters: Record<string, any> = {}, // Accept dynamic filters
  sortBy?: string,
  sortOrder?: string,
  page?: number,
  limit?: number,
): Promise<{ data: IOrder[] }> {
  const jwt = await getCookie("jwt");
  if (!jwt) {
    return { data: [] };
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

  return safeFetchJson<{ data: IOrder[] }>(
    url,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["orderCollection"] },
      cache: "no-store",
    },
    { data: [] }
  );
}

const RecentOrderTable = async () => {
  const data = await getOrders({}, "createdAt", "desc", 1, 5);
  return (
    <DataTable
      columns={columns}
      data={data?.data || []}
      searchPlaceholder="Search recent orders..."
      variant="embedded"
      showToolbar={false}
      showPagination={false}
    />
  );
};

export default RecentOrderTable;
