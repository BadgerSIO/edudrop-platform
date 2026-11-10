import React from "react";
import CheckoutForm from "./CheckoutForm";
import { getSchoolInfo } from "../../components/wrappers/SchoolSupportedWrapper";

const CheckoutFormWrapper = async () => {
  const schools = await getSchoolInfo();

  return <CheckoutForm schools={schools?.data} />;
};

export default CheckoutFormWrapper;
