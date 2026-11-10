"use client";
import React, { useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { setCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Mail, ShieldCheck } from "lucide-react";

type IFormInput = {
  email: string;
};

export const GuestEmail = ({
  cookiechecker,
  onSwitchToLogin,
}: {
  cookiechecker: () => Promise<string | undefined>;
  onSwitchToLogin?: () => void;
}) => {
  const { loading } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit = async (data: IFormInput) => {
    setSubmitting(true);
    try {
      const response = await axios.post(`${SERVERURLAPI}/auth/checkuser`, data);
      if (response.status === 200) {
        const maxAge = 60 * 60 * 1000;
        await setCookie("guestEmail", data.email.toString(), maxAge);
        await cookiechecker();
        toast.success(`Guest email verified: ${data.email}`);
      }
    } catch (error) {
      toast.error("An account with this email already exists. Please sign in to continue.", {
        duration: 4500,
      });
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-base font-bold text-text-ink sm:text-lg">
          Quick Guest Checkout
        </h4>
        <p className="mt-1 text-xs text-text-body sm:text-sm">
          No password needed. We will automatically generate your donor account
          so you can view photo sign-offs and delivery receipts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="guestEmailInput"
            className="block text-xs font-semibold text-text-ink mb-1.5"
          >
            Donor Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
            <input
              type="email"
              id="guestEmailInput"
              placeholder="e.g. sarah.jenkins@gmail.com"
              disabled={loading || submitting}
              {...register("email", {
                required: "Email address is required",
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
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-text-body">
            <ShieldCheck className="h-3.5 w-3.5 text-surface-forest shrink-0" />
            <span>Encrypted & secure receipt dispatch</span>
          </div>

          <ActionPillButton
            variant="dark"
            size="md"
            className="whitespace-nowrap"
          >
            {submitting ? "Verifying..." : "Continue as Guest"}
          </ActionPillButton>
        </div>
      </form>
    </div>
  );
};

export default GuestEmail;
