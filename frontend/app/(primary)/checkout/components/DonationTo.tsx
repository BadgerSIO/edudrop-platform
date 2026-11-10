"use client";
import React from "react";
import { ISchoolInfo } from "@/app/types/SchoolInfo";
import { useFormContext } from "react-hook-form";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { School, Calendar, CheckCircle2, Repeat } from "lucide-react";

export const DonationTo = ({ schools }: { schools: ISchoolInfo[] }) => {
  const { register, watch } = useFormContext();
  const payMonthlyValue = watch("payMonthly") || "no";

  return (
    <BentoCard
      variant="white"
      className="mb-8 border-border-subtle/80 p-6 sm:p-8 shadow-bento"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle/70 pb-5 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest shrink-0">
          <School className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-text-ink sm:text-xl">
            Step 2: Designated Campus & Cadence
          </h3>
          <p className="text-xs text-text-body">
            Choose where your supplies are routed and whether this is a one-time
            or sustaining delivery.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* School Dropdown */}
        <div>
          <label
            htmlFor="schools"
            className="block text-xs font-semibold text-text-ink mb-2"
          >
            Designated Partner School <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <School className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-forest" />
            <select
              id="schools"
              {...register("schoolId", { required: "Please select a partner school" })}
              className="w-full appearance-none rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-10 text-sm font-medium text-text-ink transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            >
              <option value="">Select a verified school campus...</option>
              {schools?.map((sch) => (
                <option
                  key={sch?._id}
                  value={sch?.school || sch?._id}
                >
                  {sch?.schoolName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-body">
              ▼
            </div>
          </div>
          <p className="mt-1.5 text-xs text-text-body">
            100% of supplies are delivered directly to the bursar with signed photo
            confirmation published to your account.
          </p>
        </div>

        {/* Giving Cadence Cards */}
        <div>
          <label className="block text-xs font-semibold text-text-ink mb-2.5">
            Sponsorship Cadence
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* One-Time Card */}
            <label
              htmlFor="payMonthlyNo"
              className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                payMonthlyValue === "no"
                  ? "border-surface-forest bg-surface-forest/5 shadow-sm ring-1 ring-surface-forest"
                  : "border-border-subtle bg-white hover:border-surface-forest/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      payMonthlyValue === "no"
                        ? "bg-surface-forest text-white"
                        : "bg-surface-bento text-text-body"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-text-ink">
                    One-Time Gift
                  </span>
                </div>
                <input
                  id="payMonthlyNo"
                  {...register("payMonthly")}
                  type="radio"
                  value="no"
                  defaultChecked
                  className="h-4 w-4 text-surface-forest focus:ring-brand-lime"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-body">
                Single physical delivery of selected classroom hydration cases.
              </p>
            </label>

            {/* Monthly Sustaining Card */}
            <label
              htmlFor="payMonthlyYes"
              className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                payMonthlyValue === "yes"
                  ? "border-surface-forest bg-surface-forest/5 shadow-sm ring-1 ring-surface-forest"
                  : "border-border-subtle bg-white hover:border-surface-forest/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      payMonthlyValue === "yes"
                        ? "bg-surface-forest text-white"
                        : "bg-surface-bento text-text-body"
                    }`}
                  >
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-text-ink">
                      Monthly Sustaining
                    </span>
                    <span className="rounded-full bg-brand-lime px-2 py-0.5 text-[10px] font-bold text-surface-forest">
                      Most Impact
                    </span>
                  </div>
                </div>
                <input
                  id="payMonthlyYes"
                  {...register("payMonthly")}
                  type="radio"
                  value="yes"
                  className="h-4 w-4 text-surface-forest focus:ring-brand-lime"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-body">
                Recurring monthly shipment to keep classroom water supplies fully
                replenished. Cancel anytime.
              </p>
            </label>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

export default DonationTo;
