import React, { Suspense } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import DashInfoCards, { getCounts } from "../components/DashInfoCards";
import SalesChart from "../components/SalesChart";
import OrderPipelineCard from "../components/OrderPipelineCard";
import FundingBreakdownCard from "../components/FundingBreakdownCard";
import RecentOrderTable from "../components/RecentOrderTable";
import DataTableLoading from "@/app/sharedComponents/Loders/DataTableLoading";
import SharedInfoCardsLoading from "@/app/sharedComponents/Loders/SharedInfoCardsLoading";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import { ActionPillButton } from "@/app/sharedComponents/ui/ActionPillButton";

const AdminAnalyticsGrid = async () => {
  const response = await getCounts();
  const analytics = response?.data ?? null;

  return (
    <>
      <DashInfoCards analytics={analytics} />

      {/* Row 2: Sponsorship Revenue Trend (8 cols) + Order Pipeline Donut (4 cols) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SalesChart
            seriesByRange={analytics?.seriesByRange}
            defaultRange={analytics?.defaultRange ?? "all"}
            totalPaidOrders={analytics?.paidOrderCount ?? 0}
            activeSpanLabel={analytics?.activeSpanLabel ?? null}
          />
        </div>
        <div className="xl:col-span-4">
          <OrderPipelineCard
            pipeline={analytics?.orderPipeline ?? []}
            paidOrderCount={analytics?.paidOrderCount ?? 0}
            totalRevenue={analytics?.totalRevenue ?? 0}
            unpaidPendingCount={analytics?.unpaidPendingCount ?? 0}
          />
        </div>
      </div>

      {/* Row 3: Campus Funding (6 cols) + Supply Category Mix (6 cols) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <FundingBreakdownCard
            schools={analytics?.schoolBreakdown ?? []}
            categories={analytics?.categoryBreakdown ?? []}
            dimension="school"
          />
        </div>
        <div className="xl:col-span-6">
          <FundingBreakdownCard
            schools={analytics?.schoolBreakdown ?? []}
            categories={analytics?.categoryBreakdown ?? []}
            dimension="category"
          />
        </div>
      </div>

      {/* Row 4: Full-Width Recent Orders Preview (no horizontal clipping) */}
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border-subtle/80 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-ink">
              Recent Orders
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Latest 5 verified sponsorships and live fulfillment status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(analytics?.unreadInquiriesCount ?? 0) > 0 && (
              <Link
                href="/dashboard/form-submissions"
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {analytics?.unreadInquiriesCount} Unread{" "}
                  {analytics?.unreadInquiriesCount === 1
                    ? "Inquiry"
                    : "Inquiries"}
                </span>
              </Link>
            )}
            <ActionPillButton href="/dashboard/orders" variant="dark" size="sm">
              All Orders
            </ActionPillButton>
          </div>
        </div>

        <Suspense fallback={<DataTableLoading />}>
          <RecentOrderTable />
        </Suspense>
      </div>
    </>
  );
};

const Dashboard = async () => {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <SharedInfoCardsLoading />
            <CardFullLoading />
          </div>
        }
      >
        <AdminAnalyticsGrid />
      </Suspense>
    </div>
  );
};

export default Dashboard;
