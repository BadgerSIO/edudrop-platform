import React from "react";
import Sidebar from "./Sidebar";
import { getSubmissionData } from "@/app/utility/getSubmissionData";

const SideBarWrapper = async () => {
  const result = await getSubmissionData();
  return (
    <Sidebar
      propdata={result?.data}
      unreadCount={result?.additionalData?.unreadCount}
    />
  );
};

export default SideBarWrapper;
