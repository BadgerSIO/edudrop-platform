"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Heart,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/app/context/AuthContext";

export type DemoRole = "donar" | "bursar" | "admin";

export interface DemoAccountOption {
  label: string;
  subtitle: string;
  email: string;
  password: string;
}

const DEMO_ACCOUNTS_BY_ROLE: Record<DemoRole, DemoAccountOption[]> = {
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
    {
      label: "Westfield Collegiate",
      subtitle: "Samantha Hudson · Seattle, WA",
      email: "bursar@westfield.edu",
      password: "Password123!",
    },
    {
      label: "Crestview Preparatory",
      subtitle: "David Kensington · Boston, MA",
      email: "bursar@crestview.edu",
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

const ROLE_TABS: Array<{
  role: DemoRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    role: "donar",
    label: "Donor",
    icon: Heart,
  },
  {
    role: "bursar",
    label: "Bursar",
    icon: GraduationCap,
  },
  {
    role: "admin",
    label: "Admin",
    icon: Shield,
  },
];

interface DemoCredentialsBoxProps {
  role: DemoRole;
  allowRoleSwitch?: boolean;
  initialDemoMode?: boolean;
  onSelect: (credentials: {
    email: string;
    password: string;
    role: DemoRole;
  }) => Promise<void> | void;
  disabled?: boolean;
}

const DemoAccountGrid: React.FC<{
  accounts: DemoAccountOption[];
  targetRole: DemoRole;
  activeEmail: string | null;
  disabled: boolean;
  onSelect: (account: DemoAccountOption, role: DemoRole) => void;
}> = ({ accounts, targetRole, activeEmail, disabled, onSelect }) => (
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
          onClick={() => onSelect(account, targetRole)}
          className="group flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white px-3.5 py-2.5 text-left transition-all hover:border-surface-forest/50 hover:bg-surface-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
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
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            )}
          </div>
        </button>
      );
    })}
  </div>
);

const DemoCredentialsBox: React.FC<DemoCredentialsBoxProps> = ({
  role,
  allowRoleSwitch = false,
  initialDemoMode = false,
  onSelect,
  disabled = false,
}) => {
  const { demoStatus } = useAuthContext();
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<DemoRole>(role);

  const isDemoMode = demoStatus ? demoStatus.demoMode : initialDemoMode;
  if (!isDemoMode) {
    return null;
  }

  const handleClick = async (account: DemoAccountOption, targetRole: DemoRole) => {
    if (disabled || activeEmail) return;
    setActiveEmail(account.email);
    try {
      await onSelect({
        email: account.email,
        password: account.password,
        role: targetRole,
      });
    } finally {
      setActiveEmail(null);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-bento/65 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-forest text-brand-lime">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
            1-Click Demo Sign-In
          </span>
        </div>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-text-body border border-border-subtle whitespace-nowrap">
          Recruiter Quick Access
        </span>
      </div>

      <p className="text-[11px] text-text-body mb-3 leading-relaxed">
        Click an account below to sign in instantly without typing credentials
        (password:{" "}
        <code className="font-mono font-bold text-text-ink">Password123!</code>).
      </p>

      {allowRoleSwitch ? (
        <Tabs
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as DemoRole)}
          className="w-full"
        >
          <TabsList
            aria-label="Demo account roles"
            className="grid w-full grid-cols-3 flex-nowrap gap-1 rounded-xl border border-border-subtle bg-white p-1 backdrop-blur-none"
          >
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.role}
                  value={tab.role}
                  className="relative w-full min-w-0 justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/60 data-[state=active]:bg-surface-forest data-[state=active]:text-white data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:inset-x-4 data-[state=active]:after:bottom-0 data-[state=active]:after:border-b-2 data-[state=active]:after:border-brand-lime"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ROLE_TABS.map((tab) => (
            <TabsContent
              key={tab.role}
              value={tab.role}
              className="mt-3"
            >
              <DemoAccountGrid
                accounts={DEMO_ACCOUNTS_BY_ROLE[tab.role]}
                targetRole={tab.role}
                activeEmail={activeEmail}
                disabled={disabled}
                onSelect={handleClick}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <DemoAccountGrid
          accounts={DEMO_ACCOUNTS_BY_ROLE[role]}
          targetRole={role}
          activeEmail={activeEmail}
          disabled={disabled}
          onSelect={handleClick}
        />
      )}
    </div>
  );
};

export default DemoCredentialsBox;
