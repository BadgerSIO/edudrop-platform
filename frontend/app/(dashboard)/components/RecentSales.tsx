import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { getOrders } from "./RecentOrderTable";
import { IOrder } from "@/app/types/Order";
import { handleBuildImage } from "@/app/utility/handleBuildImage";

const RecentSales = async () => {
  const data = await getOrders(
    { paymentStatus: true },
    undefined,
    "desc",
    undefined,
    5,
  );
  if (data?.data?.length <= 1) {
    return (
      <div className="w-full space-y-8 rounded-xl border bg-white px-5 py-10 shadow-sm xl:max-w-md">
        <h2 className="mb-5 font-medium md:text-lg lg:text-2xl">
          No sales history
        </h2>
      </div>
    );
  } else
    <div className="w-full space-y-8 rounded-xl border bg-white px-5 py-10 shadow-sm xl:max-w-md">
      <h2 className="mb-5 font-medium md:text-lg lg:text-2xl">Recent Sales</h2>
      {data?.data?.map((order: IOrder) => (
        <div
          key={order?._id}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={handleBuildImage(
                order?.user?.profileImage as string,
                "/user-avatar.webp",
              )}
              alt={order?.name?.firstName}
            />
            <AvatarFallback className="uppercase">
              {order?.name?.firstName[0]}
              {order?.name?.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 sm:ml-4">
            <p className="text-sm font-medium leading-none">
              {order?.name?.firstName} {order?.name?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{order?.email}</p>
          </div>
          <div className="font-medium sm:ml-auto">+${order?.totalAmount}</div>
        </div>
      ))}
    </div>;
};

export default RecentSales;
