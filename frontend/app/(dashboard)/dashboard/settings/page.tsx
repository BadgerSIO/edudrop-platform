import React from "react";
import { Metadata } from "next";
import DashTitle from "@/app/sharedComponents/DashTitle";
import SystemPolicyCard from "./components/SystemPolicyCard";
import StorageMaintenanceCard from "./components/StorageMaintenanceCard";

export const metadata: Metadata = {
  title: "Platform Settings | EduDrop Console",
  description:
    "Manage server upload storage maintenance, media hygiene, and system operations policy.",
};

const AdminSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <DashTitle className="sm:pl-0">Platform Settings</DashTitle>
        <p className="mt-1 text-sm text-text-muted">
          Manage server upload storage maintenance, media hygiene, and system policy
        </p>
      </div>

      <SystemPolicyCard />
      <StorageMaintenanceCard />
    </div>
  );
};

export default AdminSettingsPage;
