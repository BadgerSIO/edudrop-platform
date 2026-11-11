"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";

export const isStaffRole = (role?: string | null): boolean =>
  role === "bursar" || role === "admin";

export const getStaffRoleMeta = (role?: string | null) => {
  if (role === "admin") {
    return {
      label: "Platform Admin",
      dashboardHref: "/dashboard",
      dashboardLabel: "Return to Admin Dashboard",
    };
  }
  return {
    label: "School Bursar",
    dashboardHref: "/bursar-dashboard",
    dashboardLabel: "Return to Bursar Dashboard",
  };
};

interface RoleCheckoutGuardProps {
  variant?: "banner" | "card";
  redirectTo?: string;
  compact?: boolean;
  className?: string;
  onSwitchComplete?: () => void;
}

export const RoleCheckoutGuard: React.FC<RoleCheckoutGuardProps> = ({
  variant = "banner",
  redirectTo = "/checkout",
  compact = false,
  className = "",
  onSwitchComplete,
}) => {
  const { data: userData } = useAuthContext();
  const { signout } = useAuth();
  const [switching, setSwitching] = useState(false);

  if (!isStaffRole(userData?.role)) {
    return null;
  }

  const meta = getStaffRoleMeta(userData?.role);

  const handleSwitchToDonor = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      await signout({ redirectTo });
      onSwitchComplete?.();
    } finally {
      setSwitching(false);
    }
  };

  if (variant === "banner") {
    return (
      <div
        role="status"
        className={`@container rounded-2xl border border-surface-forest/20 ${
          compact ? "bg-white p-4 shadow-xs" : "bg-surface-bento/80 p-4 sm:p-5"
        } ${className}`}
      >
        <div className="flex flex-col gap-3.5 @[620px]:flex-row @[620px]:items-center @[620px]:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-forest whitespace-nowrap">
                  {compact ? "Donor Account Required" : "Catalog Preview Mode"}
                </span>
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border-subtle bg-surface-bento/60 px-2.5 py-0.5 text-[11px] font-semibold text-text-ink">
                  Signed in as {meta.label}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-text-body">
                {compact
                  ? `You are viewing with a ${meta.label} session. Switch to a Donor or Guest account to complete sponsorship checkout.`
                  : "Supply catalog is visible for campus inspection and price reference. Placing a sponsorship order requires a Donor or Guest account."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSwitchToDonor}
              disabled={switching}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-forest px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-surface-forest-light disabled:opacity-60 cursor-pointer"
            >
              {switching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Sign Out & Sponsor</span>
            </button>
            <Link
              href={meta.dashboardHref}
              onClick={() => onSwitchComplete?.()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-ink transition-colors hover:bg-surface-bento"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-surface-forest" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BentoCard
      variant="white"
      className={`border-surface-forest/25 bg-surface-bento/40 ${compact ? "p-5" : "p-6 sm:p-8"} shadow-bento ${className}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-forest text-brand-lime">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-forest">
                Donor Account Required
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-text-ink border border-border-subtle">
                {meta.label}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-text-ink sm:text-xl">
              {userData?.email
                ? `Signed in as ${userData.email}`
                : `Signed in with a ${meta.label} account`}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-text-body">
              {meta.label} accounts manage campus delivery sign-off and platform operations, so sponsorship purchases are disabled on this session to keep financial and fulfillment records cleanly separated.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <ActionPillButton
            variant="lime"
            size={compact ? "sm" : "md"}
            onClick={handleSwitchToDonor}
            disabled={switching}
          >
            {switching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Sign Out & Continue as Donor / Guest</span>
          </ActionPillButton>

          <ActionPillButton
            variant="outline-dark"
            size={compact ? "sm" : "md"}
            href={meta.dashboardHref}
          >
            <LayoutDashboard className="h-4 w-4 text-surface-forest" />
            <span>{meta.dashboardLabel}</span>
          </ActionPillButton>
        </div>
      </div>
    </BentoCard>
  );
};

export default RoleCheckoutGuard;
