"use client";
import { IOrder } from "../types/Order";
import { setCookie } from "./handleCookie";

const makePayment = async (data: Partial<IOrder>) => {
  const maxAge = 60 * 10;
  await setCookie("paymentIntent", "true", maxAge);
  const orderId = (data?.orderId as string) || "ORDER-EDUDROP";
  const transactionId = `EDUDROP-TX-${orderId}-${Date.now()}`;
  const parameters = new URLSearchParams({
    status: "success",
    order_id: orderId,
    card: "(VISA) ... 4242",
    transaction_id: transactionId,
    data: JSON.stringify(JSON.stringify(data?._id)),
  });

  return parameters;
};
export default makePayment;
