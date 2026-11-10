import DashTitle from "@/app/sharedComponents/DashTitle";
import React, { Suspense } from "react";
import OrderTable from "./components/OrderTable";
import DataTableLoading from "@/app/sharedComponents/Loders/DataTableLoading";

const MyOrders = async () => {
  return (
    <>
      <DashTitle className="sm:pl-0 sm:pt-0">My Orders</DashTitle>
      <Suspense fallback={<DataTableLoading />}>
        <OrderTable />
      </Suspense>
    </>
  );
};

export default MyOrders;
