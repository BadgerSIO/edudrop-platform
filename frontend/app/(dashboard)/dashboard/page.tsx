import DashInfoCards from "../components/DashInfoCards";
import RecentOrderTable from "../components/RecentOrderTable";
import { Suspense } from "react";
import DataTableLoading from "@/app/sharedComponents/Loders/DataTableLoading";
import SharedInfoCardsLoading from "@/app/sharedComponents/Loders/SharedInfoCardsLoading";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";

// Sales Analytics widgets currently kept hidden per user instruction:
// import RecentSales from "../components/RecentSales";
// import SalesChart from "../components/SalesChart";
// import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";

const Dashboard = async () => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SharedInfoCardsLoading />}>
        <DashInfoCards />
      </Suspense>

      {/* Bento Container for Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border-subtle/80 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-ink">
              Recent Orders
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Live updates on school supply sponsorships and fulfillment status
            </p>
          </div>
          <ActionPillButton href="/dashboard/orders" variant="dark" size="sm">
            All Orders
          </ActionPillButton>
        </div>
        <div className="p-2 sm:p-4">
          <Suspense fallback={<DataTableLoading />}>
            <RecentOrderTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
