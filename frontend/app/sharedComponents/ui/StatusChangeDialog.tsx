"use client";

import React from "react";
import { ArrowRight, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusTone } from "./StatusBadge";

export interface StatusOptionDescriptor {
  label: string;
  tone: StatusTone;
}

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  entitySubtitle?: string;
  entityMetaBadge?: string;
  currentStatus: StatusOptionDescriptor;
  targetStatus: StatusOptionDescriptor;
  impactDescription: string;
  confirmLabel: string;
  confirmTone?: "forest" | "amber" | "danger";
  loading?: boolean;
  onConfirm: () => Promise<boolean | void> | void;
}

const CONFIRM_BUTTON_CLASSES: Record<"forest" | "amber" | "danger", string> = {
  forest: "bg-surface-forest text-white hover:bg-surface-forest/90",
  amber: "bg-amber-600 text-white hover:bg-amber-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  open,
  onOpenChange,
  title,
  entityName,
  entitySubtitle,
  entityMetaBadge,
  currentStatus,
  targetStatus,
  impactDescription,
  confirmLabel,
  confirmTone = "forest",
  loading = false,
  onConfirm,
}) => {
  const handleConfirmClick = async () => {
    const result = await onConfirm();
    if (result !== false) {
      onOpenChange(false);
    }
  };

  const isTargetPositive = targetStatus.tone === "active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-md bg-white border border-border-subtle rounded-2xl shadow-bento p-6"
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-text-ink">
            {isTargetPositive ? (
              <CheckCircle2 className="h-5 w-5 text-surface-forest shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            )}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Review the status transition and its effect before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Entity Summary */}
          <div className="rounded-xl border border-border-subtle bg-surface-bento/25 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-ink truncate">
                {entityName}
              </p>
              {entitySubtitle && (
                <p className="text-xs font-mono text-text-muted truncate mt-0.5">
                  {entitySubtitle}
                </p>
              )}
            </div>
            {entityMetaBadge && (
              <span className="shrink-0 rounded-md border border-border-subtle bg-white px-2 py-0.5 text-[11px] font-semibold capitalize text-text-body">
                {entityMetaBadge}
              </span>
            )}
          </div>

          {/* Explicit Before -> After State Transition Bar */}
          <div className="rounded-xl border border-border-subtle bg-white p-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
              Status Transition
            </span>
            <div className="flex items-center justify-center gap-3">
              <StatusBadge
                label={currentStatus.label}
                tone={currentStatus.tone}
                size="md"
              />
              <ArrowRight className="h-4 w-4 text-text-muted shrink-0" />
              <StatusBadge
                label={targetStatus.label}
                tone={targetStatus.tone}
                size="md"
              />
            </div>
          </div>

          {/* Impact Explanation */}
          <div className="rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-xs leading-relaxed text-text-body">
            {impactDescription}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl border-border-subtle text-xs font-semibold text-text-ink hover:bg-surface-bento/50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmClick}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-xs font-semibold shadow-sm ${CONFIRM_BUTTON_CLASSES[confirmTone]}`}
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {loading ? "Updating..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;
