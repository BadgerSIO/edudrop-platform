import DashTitle from "@/app/sharedComponents/DashTitle";
import { al } from "@/app/font";
import React from "react";

const TrackYourOrder = () => {
  let circle = `inline-block h-5 w-5 rounded-full bg-surface-forest sm:h-9 sm:w-9`;
  let statusTextStyle = `text-sm font-semibold text-text-ink md:text-base ${al.className}`;
  return (
    <div>
      <DashTitle className="sm:pl-0 lg:pt-0">Track your Order</DashTitle>
      <div className="rounded-10px border border-border-subtle bg-white p-5 sm:border sm:px-25px sm:pb-10 md:pt-30px">
        <h3 className={`${al.className} mb-1 text-base font-semibold text-text-ink lg:text-lg`}>
          Order Code: 365jYQwb940H
        </h3>

        <div className="relative my-60px flex max-w-4xl flex-col justify-between gap-5 max-[369px]:pl-10 min-[370px]:flex-row">
          <div className="z-10 flex flex-col gap-2 min-[370px]:items-center">
            <span className={circle}></span>
            <h3 className={statusTextStyle}>Placed</h3>
          </div>
          {/* processing  */}
          <div className="z-10 flex flex-col gap-2 min-[370px]:items-center">
            <span className={circle}></span>
            <h3 className={statusTextStyle}>Processing</h3>
          </div>
          {/* Shipped  */}
          <div className="z-10 flex flex-col gap-2 min-[370px]:items-center">
            <span className={circle}></span>
            <h3 className={statusTextStyle}>Shipped</h3>
          </div>
          {/* Delivered  */}
          <div className="z-10 flex flex-col gap-2 min-[370px]:items-center">
            <span className={circle}></span>
            <h3 className={statusTextStyle}>Delivered</h3>
          </div>
          <div className="absolute left-0 z-0 mx-18px block h-full w-10px bg-surface-forest/20 min-[370px]:top-10px min-[370px]:h-5px min-[370px]:w-[calc(100%-36px)] min-[370px]:-translate-y-2/4 sm:top-18px sm:h-10px">
            <span className="absolute top-0 inline-block h-[calc(75%-20px)] w-full rounded-full bg-surface-forest min-[370px]:h-5px min-[370px]:w-[calc(75%-10%)] sm:h-10px"></span>
          </div>
        </div>
        <p className="${al.className} mb-1 text-base font-semibold text-#02263C lg:text-lg">
          Your order has been delivered
        </p>
        <p className="${al.className} mb-1 text-base font-semibold text-#02263C lg:text-lg">
          (tracking number 986784289953777309)
        </p>
      </div>
    </div>
  );
};

export default TrackYourOrder;
