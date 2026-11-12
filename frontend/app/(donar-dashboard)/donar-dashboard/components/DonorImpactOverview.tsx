import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  School,
  Repeat,
  ArrowRight,
  MapPin,
  CalendarClock,
} from "lucide-react";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { IDonorSummaryData } from "@/app/types/Analytics";
import { formatUsd } from "@/app/utility/orderStage";
import { shortDateConverter } from "@/app/utility/dateConverter";
import ChartStateNotice from "@/app/sharedComponents/charts/ChartStateNotice";
import FulfillmentStageBreakdown from "@/app/sharedComponents/charts/FulfillmentStageBreakdown";
import DonorSchoolChart from "./DonorSchoolChart";

export async function getDonorSummary(): Promise<IDonorSummaryData | null> {
  const jwt = await getCookie("jwt");
  if (!jwt) return null;

  const res = await safeFetchJson<{ data?: IDonorSummaryData } | null>(
    `${SERVERURLAPI}/order/donar-summary`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: {
        tags: ["donarSummary", "orderCollection"],
      },
      cache: "no-store",
    },
    null
  );

  return res?.data ?? null;
}

const DonorImpactOverview = async () => {
  const summary = await getDonorSummary();
  if (!summary) return null;

  const singleSchool =
    summary.schoolAllocation.length === 1 ? summary.schoolAllocation[0] : null;
  const formattedRenewal = summary.upcomingRenewalDate
    ? shortDateConverter(summary.upcomingRenewalDate)
    : null;

  return (
    <div className="space-y-6">
      {/* 3-Card Philanthropic Impact KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Verified Sponsorships
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {formatUsd(summary.verifiedOrderTotal)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              {`${summary.paidOrdersCount} paid order${summary.paidOrdersCount === 1 ? "" : "s"}`}
            </span>
            {summary.totalDonationAmount > summary.verifiedOrderTotal && (
              <span>
                (Lifetime: {formatUsd(summary.totalDonationAmount)})
              </span>
            )}
          </div>
        </div>

        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Campuses Supported
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <School className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {summary.schoolsSupportedCount}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              Partner schools funded
            </span>
          </div>
        </div>

        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Monthly Recurring
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <Repeat className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {`${summary.activeMonthlyCount} Active Plan${summary.activeMonthlyCount === 1 ? "" : "s"}`}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              {formattedRenewal
                ? `Next renewal: ${formattedRenewal}`
                : summary.paidOrdersCount > 0
                  ? "One-time giving only"
                  : "No recurring plans"}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Campus Breakdown + Order Tracking */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section
          aria-labelledby="donor-campuses-heading"
          className="xl:col-span-6 dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="donor-campuses-heading"
                className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
              >
                Supported Campuses
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Distribution of your verified supply sponsorships by school
              </p>
            </div>
            <Link
              href="/schools"
              className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline shrink-0"
            >
              <span>Explore Schools</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {summary.schoolAllocation.length === 0 ? (
            <ChartStateNotice
              iconName="heart-handshake"
              title="Make your first school sponsorship"
              description="Browse partner schools and sponsor classroom drinking water or hygiene packs to start tracking your verified impact."
              action={{ label: "Browse Schools", href: "/schools" }}
              secondaryAction={{ label: "Browse Supplies", href: "/products" }}
              compact
            />
          ) : singleSchool ? (
            <ChartStateNotice
              iconName="school"
              title={singleSchool.schoolName}
              description="Multi-school comparison chart appears once your sponsorships span 2 or more partner campuses."
              action={{
                label: "View School Profile",
                href: singleSchool.slug
                  ? `/schools/${singleSchool.slug}`
                  : "/schools",
              }}
              compact
            >
              <div className="mx-auto flex max-w-sm flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-white px-4 py-2.5 text-xs">
                <span className="inline-flex items-center gap-1 text-text-body">
                  <MapPin className="h-3.5 w-3.5 text-surface-forest" aria-hidden="true" />
                  {singleSchool.city || "Partner Campus"}
                  {singleSchool.state ? `, ${singleSchool.state}` : ""}
                </span>
                <span className="font-extrabold text-surface-forest tabular-nums">
                  {formatUsd(singleSchool.amount)} ({singleSchool.orderCount} order
                  {singleSchool.orderCount === 1 ? "" : "s"})
                </span>
              </div>
            </ChartStateNotice>
          ) : (
            <DonorSchoolChart
              allocations={summary.schoolAllocation}
              totalAmount={summary.verifiedOrderTotal}
            />
          )}
        </section>

        <section
          aria-labelledby="donor-delivery-heading"
          className="xl:col-span-6 dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="donor-delivery-heading"
                className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
              >
                Delivery &amp; Renewal Tracker
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Live progress of your sponsored supply orders to school campuses
              </p>
            </div>
            <Link
              href="/donar-dashboard/my-orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline shrink-0"
            >
              <span>My Orders</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {summary.paidOrdersCount === 0 ? (
            <ChartStateNotice
              iconName="truck"
              title="Delivery tracking activates after checkout"
              description="Follow each sponsorship stage from processing through confirmed bursar delivery receipt after completing checkout."
              action={{
                label: "Track an Order",
                href: "/donar-dashboard/track-your-order",
              }}
              compact
            />
          ) : (
            <div className="space-y-4">
              <FulfillmentStageBreakdown stages={summary.pipelineBreakdown} />

              {formattedRenewal && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface-bento/60 px-3.5 py-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-text-ink">
                    <CalendarClock
                      className="h-3.5 w-3.5 text-surface-forest"
                      aria-hidden="true"
                    />
                    Next scheduled monthly renewal: <strong>{formattedRenewal}</strong>
                  </span>
                  <Link
                    href="/donar-dashboard/my-orders"
                    className="font-semibold text-surface-forest hover:underline shrink-0"
                  >
                    Manage →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DonorImpactOverview;
