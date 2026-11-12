import React, { Suspense } from "react";
import BursarAnalyticsOverview from "./components/BursarAnalyticsOverview";
import MyProfile from "./components/MyProfile";
import SharedInfoCardsLoading from "@/app/sharedComponents/Loders/SharedInfoCardsLoading";

const BursarDashboard = () => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SharedInfoCardsLoading />}>
        <BursarAnalyticsOverview />
      </Suspense>

      <section>
        <MyProfile />
      </section>
    </div>
  );
};

export default BursarDashboard;
