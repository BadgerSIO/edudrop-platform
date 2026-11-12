import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import React from "react";
import TableWrapper from "@/app/sharedComponents/Table/TableWrapper";
import { IOrder } from "@/app/types/Order";
import { normalizeFulfillmentStage } from "@/app/utility/orderStage";
export async function getDonarOrders(
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
  let url = `${SERVERURLAPI}/order/get-donar-order?sortBy=${
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
const MyOrderTable = async () => {
  const all = await getDonarOrders({}, "createdAt", "desc");
  const orders = all?.data || [];
  const pending = orders.filter(
    (item: IOrder) => normalizeFulfillmentStage(item?.orderStatus) === "pending",
  );
  const processing = orders.filter(
    (item: IOrder) => normalizeFulfillmentStage(item?.orderStatus) === "processing",
  );
  const onTheWay = orders.filter(
    (item: IOrder) => normalizeFulfillmentStage(item?.orderStatus) === "on the way",
  );
  const received = orders.filter(
    (item: IOrder) => normalizeFulfillmentStage(item?.orderStatus) === "received",
  );
  return (
    <TableWrapper
      all={orders}
      pending={pending}
      processing={processing}
      onTheWay={onTheWay}
      received={received}
    />
  );
};

export default MyOrderTable;
