"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import { ErrorMessage } from "@hookform/error-message";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Mail, Key, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValues {
  email: string;
  token: string;
  newPassword: string;
}

const ForgetResetForm = () => {
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    criteriaMode: "all",
  });

  const validatePasswordStrength = (value: string) => {
    const strongPasswordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    return strongPasswordRegex.test(value);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    try {
      await resetPassword(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-bold uppercase tracking-wider text-text-ink"
        >
          Registered Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            placeholder="donor@example.com"
            className={cn(
              "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
              "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
              errors.email
                ? "border-red-500 bg-red-50/20"
                : "border-border-subtle"
            )}
          />
        </div>
        <ErrorMessage
          errors={errors}
          name="email"
          render={({ messages }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <p
                className="flex items-center gap-1 text-xs font-medium text-red-500"
                key={type}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {message}
              </p>
            ))
          }
        />
      </div>

      {/* Token */}
      <div className="space-y-1.5">
        <label
          htmlFor="token"
          className="block text-xs font-bold uppercase tracking-wider text-text-ink"
        >
          Verification Token
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
            <Key className="h-4 w-4" />
          </div>
          <input
            type="text"
            id="token"
            {...register("token", { required: "Verification token is required" })}
            placeholder="Paste token from email"
            className={cn(
              "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
              "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
              errors.token
                ? "border-red-500 bg-red-50/20"
                : "border-border-subtle"
            )}
          />
        </div>
        <ErrorMessage
          errors={errors}
          name="token"
          render={({ messages }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <p
                className="flex items-center gap-1 text-xs font-medium text-red-500"
                key={type}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {message}
              </p>
            ))
          }
        />
      </div>

      {/* New Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="newPassword"
          className="block text-xs font-bold uppercase tracking-wider text-text-ink"
        >
          New Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="newPassword"
            {...register("newPassword", {
              required: "New password is required",
              validate: (value) =>
                validatePasswordStrength(value) ||
                "Password must be at least 8 characters long and include uppercase, lowercase, and numeric characters.",
            })}
            placeholder="••••••••••••"
            className={cn(
              "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
              "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
              errors.newPassword
                ? "border-red-500 bg-red-50/20"
                : "border-border-subtle"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-body/50 hover:text-text-ink transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <ErrorMessage
          errors={errors}
          name="newPassword"
          render={({ messages }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <p
                className="flex items-center gap-1 text-xs font-medium text-red-500"
                key={type}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {message}
              </p>
            ))
          }
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <ActionPillButton
          type="submit"
          variant="lime"
          size="lg"
          disabled={submitting}
          className="w-full justify-center"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting Password...
            </span>
          ) : (
            "Set New Password"
          )}
        </ActionPillButton>
      </div>
    </form>
  );
};

export default ForgetResetForm;
