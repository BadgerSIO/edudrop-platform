import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import React from "react";
import TableWrapper from "@/app/sharedComponents/Table/TableWrapper";
import { IOrder } from "@/app/types/Order";
export async function getDonarOrders(
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

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: { tags: ["orderCollection"] },
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: [] };
    }
    return res.json();
  } catch {
    return { data: [] };
  }
}
const MyOrderTable = async () => {
  const all = await getDonarOrders({}, "createdAt", "desc");
  const pending = all?.data?.filter(
    (item: IOrder) => item?.orderStatus === "pending",
  );
  const processing = all?.data?.filter(
    (item: IOrder) => item?.orderStatus === "processing",
  );
  const onTheWay = all?.data?.filter(
    (item: IOrder) => item?.orderStatus === "on the way",
  );
  const received = all?.data?.filter(
    (item: IOrder) => item?.orderStatus === "received",
  );
  return (
    <TableWrapper
      all={all?.data}
      pending={pending}
      processing={processing}
      onTheWay={onTheWay}
      received={received}
    />
  );
};

export default MyOrderTable;
