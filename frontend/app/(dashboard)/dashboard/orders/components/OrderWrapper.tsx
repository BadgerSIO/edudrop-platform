import React from "react";
import TableWrapper from "../../../../sharedComponents/Table/TableWrapper";
import { getOrders } from "@/app/(dashboard)/components/RecentOrderTable";
import { IOrder } from "@/app/types/Order";
import { normalizeFulfillmentStage } from "@/app/utility/orderStage";

const OrderWrapper = async () => {
  const all = await getOrders({}, "createdAt", "desc");
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

export default OrderWrapper;
