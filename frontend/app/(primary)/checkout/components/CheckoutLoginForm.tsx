"use client";
import React, { useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import { useForm } from "react-hook-form";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Mail, Lock } from "lucide-react";

type IFormInput = {
  email: string;
  password: string;
};

export const CheckoutLoginForm = () => {
  const { signin } = useAuth();
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
      await signin(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-base font-bold text-text-ink sm:text-lg">
          Returning Donor Sign In
        </h4>
        <p className="mt-1 text-xs text-text-body sm:text-sm">
          Sign in to automatically apply your saved billing address and track all
          campus sponsorships in your portal.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="loginEmailInput"
            className="block text-xs font-semibold text-text-ink mb-1.5"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
            <input
              type="email"
              id="loginEmailInput"
              placeholder="e.g. yourname@domain.com"
              disabled={loading || submitting}
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-4 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="loginPasswordInput"
            className="block text-xs font-semibold text-text-ink mb-1.5"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
            <input
              type="password"
              id="loginPasswordInput"
              placeholder="••••••••"
              disabled={loading || submitting}
              {...register("password", { required: "Password is required" })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-4 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end pt-1">
          <ActionPillButton
            variant="lime"
            size="md"
            className="whitespace-nowrap"
          >
            {submitting ? "Signing in..." : "Sign In & Auto-Fill"}
          </ActionPillButton>
        </div>
      </form>
    </div>
  );
};

export default CheckoutLoginForm;
