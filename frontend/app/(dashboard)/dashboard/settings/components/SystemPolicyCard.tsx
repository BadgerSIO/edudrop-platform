"use client";

import React from "react";
import { ShieldCheck, Clock, KeyRound, Lock } from "lucide-react";
import { useAuthContext } from "@/app/context/AuthContext";

const SystemPolicyCard = () => {
  const { demoStatus } = useAuthContext();

  const isDemo = Boolean(demoStatus?.demoMode);
  const ownerUnlocked = Boolean(demoStatus?.ownerBypassActive);
  const intervalLabel = demoStatus
    ? isDemo
      ? `Every ${demoStatus.resetIntervalMinutes} min (DB + uploads)`
      : "Every 24 hours (orphaned > 24h)"
    : "Loading schedule...";

  return (
    <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
      <div className="mb-5 space-y-1">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-ink">
          System &amp; Storage Policy
        </h2>
        <p className="text-xs sm:text-sm text-text-body">
          Live runtime mode, automated disk cleanup cadence, and administrative safeguard status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-surface-forest shrink-0" aria-hidden="true" />
            <span>Runtime Environment</span>
          </div>
          <p className="text-sm font-bold text-text-ink">
            {demoStatus
              ? isDemo
                ? "Portfolio Demo Mode"
                : "Production Mode"
              : "Detecting..."}
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            <Clock className="h-3.5 w-3.5 text-surface-forest shrink-0" aria-hidden="true" />
            <span>Automated Media Policy</span>
          </div>
          <p className="text-sm font-bold text-text-ink">{intervalLabel}</p>
        </div>

        <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            {ownerUnlocked ? (
              <KeyRound className="h-3.5 w-3.5 text-surface-forest shrink-0" aria-hidden="true" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-surface-forest shrink-0" aria-hidden="true" />
            )}
            <span>Write Safeguards</span>
          </div>
          <p className="text-sm font-bold text-text-ink">
            {!demoStatus
              ? "Detecting..."
              : !isDemo
                ? "Standard Admin Auth"
                : ownerUnlocked
                  ? "Owner Mode Unlocked"
                  : "Demo Protections Locked"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemPolicyCard;
