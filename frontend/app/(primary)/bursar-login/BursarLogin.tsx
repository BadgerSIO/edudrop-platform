"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValues {
  email: string;
  password: string;
}

const BursarLogin: React.FC = () => {
  const { signinBursar } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    try {
      await signinBursar({ email: data.email, password: data.password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="bursar-email"
          className="block text-xs font-bold uppercase tracking-wider text-text-ink"
        >
          Official Bursar Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            id="bursar-email"
            {...register("email", {
              required: "Bursar email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            placeholder="bursar@school.edu"
            className={cn(
              "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
              "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
              errors.email
                ? "border-red-500 bg-red-50/20"
                : "border-border-subtle"
            )}
          />
        </div>
        {errors.email && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.email.message || "Email is required"}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="bursar-password"
          className="block text-xs font-bold uppercase tracking-wider text-text-ink"
        >
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="bursar-password"
            {...register("password", { required: "Password is required" })}
            placeholder="••••••••••••"
            className={cn(
              "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
              "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
              errors.password
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
        {errors.password && (
          <p className="flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.password.message || "Password is required"}
          </p>
        )}
      </div>

      {/* Submit Button */}
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
              Authenticating...
            </span>
          ) : (
            "Access Bursar Portal"
          )}
        </ActionPillButton>
      </div>
    </form>
  );
};

export default BursarLogin;
