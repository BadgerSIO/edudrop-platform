import React, { Suspense } from "react";
import { Metadata } from "next";
import AccountSettingsHub from "@/app/sharedComponents/Profile/AccountSettingsHub";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";

export const metadata: Metadata = {
  title: "Account & Profile Settings | Donor Portal",
  description:
    "Update your donor profile details, delivery address, avatar, and password security.",
};

const UpdateProfile = () => {
  return (
    <Suspense fallback={<CardFullLoading />}>
      <AccountSettingsHub role="donar" />
    </Suspense>
  );
};

export default UpdateProfile;
