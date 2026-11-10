import DashTitle from "@/app/sharedComponents/DashTitle";
import React, { Suspense } from "react";
import MyOrderTable from "./components/MyOrderTable";
import DataTableLoading from "@/app/sharedComponents/Loders/DataTableLoading";

const MyOrders = async () => {
  return (
    <>
      <DashTitle className="pl-0 pt-0">My Orders</DashTitle>
      <Suspense fallback={<DataTableLoading />}>
        <MyOrderTable />
      </Suspense>
    </>
  );
};

export default MyOrders;
