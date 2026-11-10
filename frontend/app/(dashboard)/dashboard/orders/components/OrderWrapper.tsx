import React from "react";
import TableWrapper from "../../../../sharedComponents/Table/TableWrapper";
import { getOrders } from "@/app/(dashboard)/components/RecentOrderTable";
import { IOrder } from "@/app/types/Order";

const OrderWrapper = async () => {
  const all = await getOrders({}, "createdAt", "desc");
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

export default OrderWrapper;
