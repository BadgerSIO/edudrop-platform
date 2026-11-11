"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  HardDrive,
  Loader2,
  SearchCheck,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { SERVERURLAPI } from "@/lib/constants";
import { useAuthContext } from "@/app/context/AuthContext";
import { getCookie } from "@/app/utility/handleCookie";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";

const OWNER_TOKEN_COOKIE = "edudropOwnerToken";
const OWNER_TOKEN_HEADER = "x-edudrop-owner-token";

interface CleanupSummary {
  dryRun: boolean;
  activeReferencesCount: number;
  removedUploadsCount: number;
  freedBytes: number;
  minAgeHours: number;
  deletedUrls?: string[];
}

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const StorageMaintenanceCard = () => {
  const { demoStatus } = useAuthContext();
  const [runningMode, setRunningMode] = useState<"scan" | "clean" | null>(null);
  const [summary, setSummary] = useState<CleanupSummary | null>(null);

  const lockedInDemo =
    Boolean(demoStatus?.demoMode) && !Boolean(demoStatus?.ownerBypassActive);

  const handleCleanup = async (dryRun: boolean) => {
    if (runningMode || lockedInDemo) return;
    setRunningMode(dryRun ? "scan" : "clean");

    try {
      const [jwt, ownerToken] = await Promise.all([
        getCookie("jwt"),
        getCookie(OWNER_TOKEN_COOKIE),
      ]);

      const res = await axios.post(
        `${SERVERURLAPI}/auth/cleanup-uploads`,
        { minAgeHours: 24, dryRun },
        {
          headers: {
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
            ...(ownerToken ? { [OWNER_TOKEN_HEADER]: ownerToken } : {}),
          },
        }
      );

      const data = res.data?.data as CleanupSummary | undefined;
      if (data) {
        setSummary(data);
      }
      toast.success(
        res.data?.message ||
          (dryRun ? "Storage scan complete" : "Unused uploads cleaned")
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to sweep unused uploads";
      toast.error(message);
    } finally {
      setRunningMode(null);
    }
  };

  return (
    <div className="dash-card-enter rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
            <HardDrive className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-text-ink">
              Upload Storage Maintenance
            </h2>
            <p className="text-xs sm:text-sm text-text-body max-w-2xl leading-relaxed">
              Scan upload folders (<code className="font-mono text-xs">users</code>,{" "}
              <code className="font-mono text-xs">school</code>,{" "}
              <code className="font-mono text-xs">products</code>,{" "}
              <code className="font-mono text-xs">cms</code>) for unused images
              older than 24 hours that are no longer referenced in MongoDB or
              seed snapshots.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={Boolean(runningMode) || lockedInDemo}
            onClick={() => handleCleanup(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-ink shadow-xs transition-colors hover:bg-surface-bento focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:cursor-not-allowed disabled:opacity-50"
          >
            {runningMode === "scan" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <SearchCheck
                className="h-3.5 w-3.5 text-surface-forest"
                aria-hidden="true"
              />
            )}
            <span>{runningMode === "scan" ? "Scanning..." : "Scan Unused"}</span>
          </button>

          <CustomAlertDialouge
            disableTrigger={Boolean(runningMode) || lockedInDemo}
            triggerText={
              <span className="inline-flex items-center gap-1.5">
                {runningMode === "clean" ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>
                  {runningMode === "clean" ? "Cleaning..." : "Clean Unused Files"}
                </span>
              </span>
            }
            triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-surface-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:cursor-not-allowed disabled:opacity-50"
            onConfirm={() => handleCleanup(false)}
            alertDescription="Delete unreferenced uploaded images older than 24 hours? All files saved in MongoDB or protected seed snapshots are untouched."
          />
        </div>
      </div>

      {lockedInDemo && (
        <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-bento/60 px-4 py-3 text-xs text-text-body">
          <ShieldAlert
            className="h-4 w-4 shrink-0 text-surface-forest"
            aria-hidden="true"
          />
          <span>
            Public Demo Mode: Unlock Owner Mode in the top navigation bar to
            run storage sweeps manually (auto-resets clean demo uploads
            automatically).
          </span>
        </div>
      )}

      <div aria-live="polite" className="space-y-3">
        {summary && (
          <div className="rounded-xl border border-border-subtle/80 bg-surface-bento/40 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-text-ink">
                <CheckCircle2
                  className="h-4 w-4 text-surface-forest shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {summary.removedUploadsCount === 0
                    ? `Storage clean — no unreferenced files older than ${summary.minAgeHours}h.`
                    : summary.dryRun
                      ? `Preview found ${summary.removedUploadsCount} unreferenced upload(s) (${formatBytes(summary.freedBytes)} reclaimable).`
                      : `Removed ${summary.removedUploadsCount} unreferenced upload(s), freeing ${formatBytes(summary.freedBytes)}.`}
                </span>
              </div>
              <span className="font-mono text-[11px] text-text-muted">
                {summary.activeReferencesCount} active asset references preserved
              </span>
            </div>

            {summary.dryRun &&
              Array.isArray(summary.deletedUrls) &&
              summary.deletedUrls.length > 0 && (
                <div className="border-t border-border-subtle/70 pt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    <FileWarning
                      className="h-3.5 w-3.5 text-surface-forest shrink-0"
                      aria-hidden="true"
                    />
                    <span>Files Queued for Removal</span>
                  </div>
                  <ul className="max-h-44 overflow-y-auto overscroll-contain space-y-1.5 rounded-lg border border-border-subtle bg-white p-2.5">
                    {summary.deletedUrls.map((fileUrl) => (
                      <li
                        key={fileUrl}
                        className="font-mono text-[11px] text-text-ink break-all"
                      >
                        {fileUrl}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageMaintenanceCard;
