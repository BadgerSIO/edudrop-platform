"use client";

import useAuth from "@/app/hooks/useAuth";
import { ErrorMessage } from "@hookform/error-message";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ForgetPassword from "./ForgetPassword";
import { useAuthContext } from "@/app/context/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { signin } = useAuth();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    criteriaMode: "all",
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    try {
      await signin({ email: data.email, password: data.password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-text-ink"
          >
            Email Address
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
                errors.email ? "border-red-500 bg-red-50/20" : "border-border-subtle"
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-text-ink"
            >
              Password
            </label>
            <ForgetPassword />
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              {...register("password", { required: "Password is required" })}
              placeholder="••••••••••••"
              className={cn(
                "w-full rounded-xl border bg-surface-canvas/40 py-3.5 pl-10 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
                "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
                errors.password ? "border-red-500 bg-red-50/20" : "border-border-subtle"
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
            name="password"
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
                Signing In...
              </span>
            ) : (
              "Sign In to Dashboard"
            )}
          </ActionPillButton>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
