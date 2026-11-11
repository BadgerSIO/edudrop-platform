"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

interface OwnerUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: (passkey: string) => Promise<boolean>;
}

const OwnerUnlockModal: React.FC<OwnerUnlockModalProps> = ({
  open,
  onOpenChange,
  onUnlock,
}) => {
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim() || submitting) return;

    setSubmitting(true);
    try {
      const ok = await onUnlock(passkey.trim());
      if (ok) {
        setPasskey("");
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border-subtle bg-white p-6 sm:max-w-md shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest text-brand-lime">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-text-ink">
                Owner Mode Unlock
              </DialogTitle>
              <DialogDescription className="text-xs text-text-muted">
                Restricted developer &amp; owner access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-xs leading-relaxed text-text-body rounded-xl bg-surface-bento/70 border border-border-subtle p-3">
          Enter your private <code className="font-mono font-bold text-text-ink">OWNER_BYPASS_KEY</code> to
          unlock full create, edit, upload, and user management capabilities for{" "}
          <strong>your browser session only</strong>. Public visitors remain in protected Demo Mode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="owner-passkey-input"
              className="block text-xs font-bold uppercase tracking-wider text-text-ink"
            >
              Owner Passkey
            </label>
            <div className="relative">
              <input
                id="owner-passkey-input"
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter private owner passkey..."
                autoFocus
                className="w-full rounded-xl border border-border-subtle bg-surface-canvas/40 py-3 pl-4 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 outline-none transition-all focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15"
              />
              <button
                type="button"
                onClick={() => setShowPasskey((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-body/50 hover:text-text-ink transition-colors"
                aria-label={showPasskey ? "Hide passkey" : "Show passkey"}
              >
                {showPasskey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento transition-colors"
            >
              Cancel
            </button>
            <ActionPillButton
              type="submit"
              variant="lime"
              size="sm"
              disabled={!passkey.trim() || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Unlock Owner Mode
                </span>
              )}
            </ActionPillButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerUnlockModal;
