import { SERVERURLAPI } from "@/lib/constants";
import React from "react";
import OrderDetails from "./components/OrderDetails";
import { getCookie } from "@/app/utility/handleCookie";

async function getSingleOrderById(id: string) {
  try {
    const jwt = await getCookie("jwt");
    const res = await fetch(`${SERVERURLAPI}/order/${id}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      next: { tags: ["orderInfo"] },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

const SingleDonarOrder = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const data = await getSingleOrderById(slug);
  return (
    <div>
      <OrderDetails order={data?.data} />
    </div>
  );
};

export default SingleDonarOrder;
