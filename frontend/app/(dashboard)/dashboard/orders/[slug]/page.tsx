import { SERVERURLAPI } from "@/lib/constants";
import React from "react";
import OrderDetails from "./components/OrderDetails";
import { getCookie } from "@/app/utility/handleCookie";
import { safeFetchJson } from "@/app/utility/safeFetchJson";

async function getSingleOrderById(id: string) {
  const jwt = await getCookie("jwt");
  return safeFetchJson<{ data?: any } | null>(
    `${SERVERURLAPI}/order/${id}`,
    {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      next: { tags: ["orderInfo"] },
      cache: "no-store",
    },
    null
  );
}

const SingleDonarOrder = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const data = await getSingleOrderById(slug);
  return <OrderDetails order={data?.data} />;
};

export default SingleDonarOrder;
