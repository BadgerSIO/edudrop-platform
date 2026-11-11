"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export interface DemoAccountOption {
  label: string;
  subtitle: string;
  email: string;
  password: string;
}

const DEMO_ACCOUNTS_BY_ROLE: Record<
  "donar" | "bursar" | "admin",
  DemoAccountOption[]
> = {
  donar: [
    {
      label: "Maya Lin",
      subtitle: "Austin, TX · Donor Portal",
      email: "donor@edudrop.org",
      password: "Password123!",
    },
    {
      label: "Alex Rivera",
      subtitle: "Denver, CO · Donor Portal",
      email: "alex.rivera@example.com",
      password: "Password123!",
    },
  ],
  bursar: [
    {
      label: "Oakridge Technical High",
      subtitle: "Marcus Vance · Austin, TX",
      email: "bursar@oakridge.edu",
      password: "Password123!",
    },
    {
      label: "St. Clara Academy",
      subtitle: "Elena Rostova · Denver, CO",
      email: "bursar@stclara.edu",
      password: "Password123!",
    },
  ],
  admin: [
    {
      label: "EduDrop Foundation Admin",
      subtitle: "Full Platform Operations Console",
      email: "admin@edudrop.org",
      password: "Password123!",
    },
  ],
};

interface DemoCredentialsBoxProps {
  role: "donar" | "bursar" | "admin";
  onSelect: (credentials: {
    email: string;
    password: string;
  }) => Promise<void> | void;
  disabled?: boolean;
}

const DemoCredentialsBox: React.FC<DemoCredentialsBoxProps> = ({
  role,
  onSelect,
  disabled = false,
}) => {
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const accounts = DEMO_ACCOUNTS_BY_ROLE[role];

  const handleClick = async (account: DemoAccountOption) => {
    if (disabled || activeEmail) return;
    setActiveEmail(account.email);
    try {
      await onSelect({ email: account.email, password: account.password });
    } finally {
      setActiveEmail(null);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-bento/65 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-forest text-brand-lime">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
            1-Click Demo Sign-In
          </span>
        </div>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-text-body border border-border-subtle">
          Recruiter Quick Access
        </span>
      </div>

      <p className="text-[11px] text-text-body mb-3 leading-relaxed">
        Click an account below to sign in instantly without typing credentials
        (password: <code className="font-mono font-bold text-text-ink">Password123!</code>).
      </p>

      <div
        className={
          accounts.length > 1
            ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            : "grid grid-cols-1 gap-2.5"
        }
      >
        {accounts.map((account) => {
          const isSigningIn = activeEmail === account.email;
          return (
            <button
              key={account.email}
              type="button"
              disabled={disabled || Boolean(activeEmail)}
              onClick={() => handleClick(account)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white px-3.5 py-2.5 text-left transition-all hover:border-surface-forest/50 hover:bg-surface-forest hover:text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-text-ink group-hover:text-white transition-colors">
                  {account.label}
                </p>
                <p className="truncate text-[11px] text-text-muted group-hover:text-white/80 transition-colors">
                  {account.subtitle}
                </p>
                <p className="truncate font-mono text-[10px] text-surface-forest group-hover:text-brand-lime mt-0.5 transition-colors">
                  {account.email}
                </p>
              </div>
              <div className="shrink-0 text-surface-forest group-hover:text-brand-lime transition-colors">
                {isSigningIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoCredentialsBox;
