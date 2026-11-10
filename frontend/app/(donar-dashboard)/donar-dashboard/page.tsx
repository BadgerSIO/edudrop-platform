import React, { Suspense } from "react";
import DashTitle from "@/app/sharedComponents/DashTitle";
import ProfileCard from "./components/ProfileCard";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";

const DonarDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <DashTitle className="sm:pl-0">Donor Profile</DashTitle>
          <p className="mt-1 text-sm text-text-muted">
            Manage your personal contact information and review your philanthropic impact
          </p>
        </div>
        <ActionPillButton
          href="/donar-dashboard/update-profile"
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

export default DonarDashboard;
