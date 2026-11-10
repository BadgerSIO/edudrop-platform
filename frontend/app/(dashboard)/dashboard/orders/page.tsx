import React, { Suspense } from "react";
import DashTitle from "../../../sharedComponents/DashTitle";
import OrderWrapper from "./components/OrderWrapper";
import DataTableLoading from "@/app/sharedComponents/Loders/DataTableLoading";

const Orders = async () => {
  return (
    <>
      <DashTitle className="mb-0 sm:pl-0">Orders List</DashTitle>
      <Suspense fallback={<DataTableLoading />}>
        <OrderWrapper />
      </Suspense>
    </>
  );
};

export default Orders;
