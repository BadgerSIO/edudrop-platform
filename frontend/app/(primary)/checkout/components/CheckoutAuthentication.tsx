"use client";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import CheckoutLoginForm from "./CheckoutLoginForm";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { UserCheck, UserPlus, LogIn, Mail, ShieldCheck } from "lucide-react";

export const CheckoutAuthentication = ({
  cookiechecker,
}: {
  cookiechecker: () => Promise<string | undefined>;
}) => {
  const [activeTab, setActiveTab] = useState<"guest" | "login">("guest");
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <BentoCard
      variant="white"
      id="enterEmail"
      className="mb-8 scroll-m-12 border-border-subtle/80 p-6 sm:p-8 shadow-bento"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle/70 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-text-ink sm:text-xl">
              Step 1: Donor Identification
            </h3>
            <p className="text-xs text-text-body">
              Receive live dispatch updates, photos, and official tax documentation.
            </p>
          </div>
        </div>

        {/* Segmented Control Pill */}
        <div className="inline-flex rounded-full border border-border-subtle bg-surface-bento/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("guest")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "guest"
                ? "bg-surface-forest text-white shadow-sm"
                : "text-text-body hover:text-text-ink"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Guest Checkout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "login"
                ? "bg-surface-forest text-white shadow-sm"
                : "text-text-body hover:text-text-ink"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
        </div>
      </div>

      <div>
        {activeTab === "guest" ? (
          <div className="w-full space-y-4">
            <div>
              <h4 className="text-base font-bold text-text-ink sm:text-lg">
                Quick Guest Checkout
              </h4>
              <p className="mt-1 text-xs text-text-body sm:text-sm">
                No password needed upfront. We will automatically generate your
                donor account credentials upon confirmation so you can view photo
                sign-offs and delivery receipts.
              </p>
            </div>

            <div>
              <label
                htmlFor="guestEmailInput"
                className="block text-xs font-semibold text-text-ink mb-1.5"
              >
                Donor Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
                <input
                  type="email"
                  id="guestEmailInput"
                  placeholder="e.g. sarah.jenkins@gmail.com"
                  {...register("email", {
                    required: "Email address is required for receipts",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-4 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-text-body">
              <ShieldCheck className="h-4 w-4 text-surface-forest shrink-0" />
              <span>
                Encrypted & secure. Your email is only used for delivery receipts and
                donor portal access.
              </span>
            </div>
          </div>
        ) : (
          <CheckoutLoginForm />
        )}
      </div>
    </BentoCard>
  );
};

export default CheckoutAuthentication;
