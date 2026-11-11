import React, { Suspense } from "react";
import { Metadata } from "next";
import DashTitle from "@/app/sharedComponents/DashTitle";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import AdminProfileCard from "./components/AdminProfileCard";
import AdminStorageCleanupCard from "./components/AdminStorageCleanupCard";

export const metadata: Metadata = {
  title: "Admin Profile | EduDrop Console",
  description:
    "View your administrator profile summary and account information.",
};

const AdminProfilePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <DashTitle className="sm:pl-0">Admin Profile</DashTitle>
        <p className="mt-1 text-sm text-text-muted">
          View your administrator identity, contact information, and account status
        </p>
      </div>

      <Suspense fallback={<CardFullLoading />}>
        <AdminProfileCard />
      </Suspense>

      <AdminStorageCleanupCard />
    </div>
  );
};

export default AdminProfilePage;
