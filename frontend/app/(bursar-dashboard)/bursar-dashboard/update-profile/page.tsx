import React, { Suspense } from "react";
import { Metadata } from "next";
import AccountSettingsHub from "@/app/sharedComponents/Profile/AccountSettingsHub";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";

export const metadata: Metadata = {
  title: "Account & Profile Settings | Bursar Portal",
  description:
    "Update your school bursar profile details, contact information, and password security.",
};

const UpdateProfile = () => {
  return (
    <Suspense fallback={<CardFullLoading />}>
      <AccountSettingsHub role="bursar" />
    </Suspense>
  );
};

export default UpdateProfile;
