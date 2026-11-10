"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import { generatePassword } from "@/app/utility/passwordGenerator";
import { ErrorMessage } from "@hookform/error-message";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { cn } from "@/lib/utils";

type FormInputs = {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  contactNo: string;
  password: string;
  confirmPassword?: string;
};

const RegisterForm = () => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({
    criteriaMode: "all",
  });

  const passwordValue = watch("password");

  const generateAndSetPassword = () => {
    const newPassword = generatePassword();
    setValue("password", newPassword, { shouldValidate: true });
    setValue("confirmPassword", newPassword, { shouldValidate: true });

    navigator.clipboard
      .writeText(newPassword)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
        toast.success(
          "Strong password generated and copied to your clipboard!",
          {
            position: "bottom-left",
            duration: 4000,
          }
        );
      })
      .catch((err) => {
        toast.error(`Failed to copy password to clipboard: ${err}`, {
          position: "bottom-center",
        });
      });
  };

  const onSubmit = async (data: FormInputs) => {
    setSubmitting(true);
    try {
      const { confirmPassword, ...restData } = data;
      await signup(restData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        {/* Row 1: Name fields (First Name + Last Name) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-xs font-bold uppercase tracking-wider text-text-ink"
            >
              First Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="firstName"
                {...register("name.firstName", {
                  required: "First name is required",
                })}
                placeholder="John"
                className={cn(
                  "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
                  "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
                  errors.name?.firstName
                    ? "border-red-500 bg-red-50/20"
                    : "border-border-subtle"
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="name.firstName"
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

          {/* Last Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-xs font-bold uppercase tracking-wider text-text-ink"
            >
              Last Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="lastName"
                {...register("name.lastName", {
                  required: "Last name is required",
                })}
                placeholder="Doe"
                className={cn(
                  "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
                  "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
                  errors.name?.lastName
                    ? "border-red-500 bg-red-50/20"
                    : "border-border-subtle"
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="name.lastName"
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
        </div>

        {/* Row 2: Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
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
                id="register-email"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="donor@example.com"
                className={cn(
                  "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
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

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-xs font-bold uppercase tracking-wider text-text-ink"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                id="phone"
                {...register("contactNo", {
                  required: "Phone number is required",
                })}
                placeholder="+1 (555) 000-0000"
                className={cn(
                  "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
                  "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
                  errors.contactNo
                    ? "border-red-500 bg-red-50/20"
                    : "border-border-subtle"
                )}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="contactNo"
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
        </div>

        {/* Row 3: Password + Confirm Password with Generator Button */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
              Security Credentials
            </span>
            <button
              type="button"
              onClick={generateAndSetPassword}
              className="group inline-flex items-center gap-1.5 rounded-full border border-surface-forest/20 bg-surface-forest/5 px-3 py-1 text-xs font-bold text-surface-forest hover:bg-surface-forest hover:text-white transition-all shadow-xs"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-brand-lime" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-surface-forest group-hover:text-brand-lime transition-colors" />
                  <span>Auto-Generate Password</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-medium text-text-body"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="••••••••••••"
                  className={cn(
                    "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-text-body"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-body/50">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                  placeholder="••••••••••••"
                  className={cn(
                    "w-full rounded-xl border bg-surface-canvas/40 py-3 pl-10 pr-11 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none",
                    "focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15",
                    errors.confirmPassword
                      ? "border-red-500 bg-red-50/20"
                      : "border-border-subtle"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-body/50 hover:text-text-ink transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ErrorMessage
                errors={errors}
                name="confirmPassword"
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
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
                Creating Account...
              </span>
            ) : (
              "Create Donor Account"
            )}
          </ActionPillButton>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
