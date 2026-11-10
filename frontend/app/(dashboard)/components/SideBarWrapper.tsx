import React from "react";
import Sidebar from "./Sidebar";
import { getSubmissionData } from "@/app/utility/getSubmissionData";

const SideBarWrapper = async () => {
  const { data } = await getSubmissionData();
  return <Sidebar propdata={data} />;
};

export default SideBarWrapper;
