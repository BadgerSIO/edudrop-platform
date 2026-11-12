import React from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Truck,
  Mail,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import { safeFetchJson } from "@/app/utility/safeFetchJson";
import { IBursarSummaryData } from "@/app/types/Analytics";
import { formatUsd } from "@/app/utility/orderStage";
import ChartStateNotice from "@/app/sharedComponents/charts/ChartStateNotice";
import FulfillmentStageBreakdown from "@/app/sharedComponents/charts/FulfillmentStageBreakdown";

export async function getBursarSummary(): Promise<IBursarSummaryData | null> {
  const jwt = await getCookie("jwt");
  if (!jwt) return null;

  const res = await safeFetchJson<{ data?: IBursarSummaryData } | null>(
    `${SERVERURLAPI}/order/bursar-summary`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      next: {
        tags: [
          "bursarSummary",
          "orderCollection",
          "schoolInfoCollection",
          "bursarInboxCollection",
        ],
      },
      cache: "no-store",
    },
    null
  );

  return res?.data ?? null;
}

const PRIORITY_STYLES: Record<string, { label: string; badgeClass: string }> = {
  high: {
    label: "High Priority",
    badgeClass: "border-amber-200/80 bg-amber-50 text-amber-800",
  },
  medium: {
    label: "Medium",
    badgeClass: "border-sky-200/80 bg-sky-50 text-sky-800",
  },
  low: {
    label: "Low",
    badgeClass: "border-border-subtle bg-surface-bento text-text-body",
  },
};

const BursarAnalyticsOverview = async () => {
  const summary = await getBursarSummary();
  if (!summary) return null;

  if (!summary.hasSchool) {
    return (
      <ChartStateNotice
        iconName="building"
        title="Campus assignment pending"
        description="Your bursar account is active, but no partner campus profile is linked yet. Contact platform administration to connect your institution."
        compact
      />
    );
  }

  const onTheWayCount =
    summary.pipelineBreakdown.find((s) => s.status === "on the way")?.count || 0;
  const visibleNeeds = summary.campusNeeds.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 3-Card Campus Operational KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Verified Campus Support
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {formatUsd(summary.verifiedOrderTotal)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              {`${summary.paidOrdersCount} paid order${summary.paidOrdersCount === 1 ? "" : "s"}`}
            </span>
            {summary.cumulativeBalance > summary.verifiedOrderTotal && (
              <span>
                (Cumulative: {formatUsd(summary.cumulativeBalance)})
              </span>
            )}
          </div>
        </div>

        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Supply Deliveries
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <Truck className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {summary.receivedCount} Delivered
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
              {summary.inFlightCount} in transit / active
            </span>
            {onTheWayCount > 0 && (
              <Link
                href="/bursar-dashboard/my-orders"
                className="font-semibold text-surface-forest hover:underline"
              >
                Confirm {onTheWayCount} arriving →
              </Link>
            )}
          </div>
        </div>

        <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Recurring &amp; Inbox
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-extrabold tracking-tight text-text-ink tabular-nums">
            {`${summary.recurringOrdersCount} Monthly Plan${summary.recurringOrdersCount === 1 ? "" : "s"}`}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
            <Link
              href="/bursar-dashboard/inbox"
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                summary.unreadInboxCount > 0
                  ? "border-amber-200/80 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "border-border-subtle bg-surface-bento text-text-body hover:text-text-ink"
              }`}
            >
              {summary.unreadInboxCount > 0
                ? `${summary.unreadInboxCount} unread message${summary.unreadInboxCount === 1 ? "" : "s"}`
                : `Inbox clear (${summary.totalInboxCount} total)`}
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column Campus Pipeline + Needs Progress */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section
          aria-labelledby="bursar-pipeline-heading"
          className="xl:col-span-6 dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="bursar-pipeline-heading"
                className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
              >
                Incoming Shipment Pipeline
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Track sponsored supply deliveries for {summary.schoolName}
              </p>
            </div>
            <Link
              href="/bursar-dashboard/my-orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline shrink-0"
            >
              <span>{onTheWayCount > 0 ? "Confirm Delivery" : "All Orders"}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {summary.paidOrdersCount === 0 ? (
            <ChartStateNotice
              iconName="package-check"
              title="No campus shipments yet"
              description="Share your public school profile page so alumni, families, and community sponsors can initiate supply deliveries."
              action={{
                label: "Review School Profile",
                href: "/bursar-dashboard/school-profile",
              }}
              compact
            />
          ) : (
            <div className="space-y-4">
              <FulfillmentStageBreakdown stages={summary.pipelineBreakdown} />
              {summary.unpaidPendingCount > 0 && (
                <p className="text-xs text-text-body">
                  +{summary.unpaidPendingCount} upcoming monthly renewal awaiting
                  donor confirmation.
                </p>
              )}
            </div>
          )}
        </section>

        <section
          aria-labelledby="bursar-needs-heading"
          className="xl:col-span-6 dash-card-enter rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento flex flex-col"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2
                id="bursar-needs-heading"
                className="text-base sm:text-lg font-bold tracking-tight text-text-ink"
              >
                Campus Needs Fulfillment
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Requested campus supply targets shared on your public donor page
              </p>
            </div>
            <Link
              href="/bursar-dashboard/school-profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline shrink-0"
            >
              <span>Edit Needs</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {visibleNeeds.length === 0 ? (
            <ChartStateNotice
              iconName="clipboard-list"
              title="No supply goals configured yet"
              description="Add requested water dispensers, cases, and sanitation quantities in Campus Needs so donors know what to fund first."
              action={{
                label: "Configure Needs",
                href: "/bursar-dashboard/school-profile",
              }}
              compact
            />
          ) : (
            <div className="space-y-3">
              <ul className="space-y-3">
                {visibleNeeds.map((need, index) => {
                  const target = Math.max(0, need.targetQuantity);
                  const fulfilled = Math.max(0, need.fulfilledQuantity);
                  const pct =
                    target > 0
                      ? Math.min(100, Math.round((fulfilled / target) * 100))
                      : 0;
                  const priority =
                    PRIORITY_STYLES[need.priority] || PRIORITY_STYLES.medium;
                  const progressId = `bursar-need-progress-${index}`;

                  return (
                    <li
                      key={`${need.itemTitle}-${index}`}
                      className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 p-3 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor={progressId}
                          className="text-xs font-bold text-text-ink"
                        >
                          {need.itemTitle}
                        </label>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priority.badgeClass}`}
                          >
                            {need.priority === "high" && (
                              <AlertTriangle
                                className="h-2.5 w-2.5"
                                aria-hidden="true"
                              />
                            )}
                            {priority.label}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-text-ink tabular-nums">
                            {fulfilled}/{target} ({pct}%)
                          </span>
                        </div>
                      </div>
                      <progress
                        id={progressId}
                        value={pct}
                        max={100}
                        className={`edudrop-progress ${
                          need.priority === "high" && pct < 100
                            ? "edudrop-progress--amber"
                            : ""
                        }`}
                      />
                    </li>
                  );
                })}
              </ul>
              {summary.campusNeeds.length > 5 && (
                <Link
                  href="/bursar-dashboard/school-profile"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-surface-forest hover:underline"
                >
                  View all {summary.campusNeeds.length} campus needs →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BursarAnalyticsOverview;
