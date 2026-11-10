import DashTitle from "@/app/sharedComponents/DashTitle";
import React, { Suspense } from "react";
import ProfileCard from "./ProfileCard";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";

const MyProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <DashTitle className="sm:pl-0">Bursar Profile</DashTitle>
          <p className="mt-1 text-sm text-text-muted">
            Manage your school institutional representation and bursar credentials
          </p>
        </div>
        <ActionPillButton
          href="/bursar-dashboard/update-profile"
          variant="dark"
          size="sm"
        >
          Edit Profile
        </ActionPillButton>
      </div>

      <Suspense fallback={<CardFullLoading />}>
        <ProfileCard />
      </Suspense>
    </div>
  );
};

export default MyProfile;
