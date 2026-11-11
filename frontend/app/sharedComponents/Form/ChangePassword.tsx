"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import useProfile from "@/app/hooks/useProfile";
import ActionPillButton from "../ui/ActionPillButton";

type PasswordFormInputs = {
  password: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePassword = ({ role: _role }: { role?: string }) => {
  const { changePassword, isChangingPassword } = useProfile();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordFormInputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentPassword = watch("password");
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const hasMinLength = (newPassword || "").length >= 8;
  const isDifferentFromCurrent =
    Boolean(newPassword) && newPassword !== currentPassword;
  const passwordsMatch =
    Boolean(confirmPassword) && confirmPassword === newPassword;

  const onSubmit = async (data: PasswordFormInputs) => {
    const ok = await changePassword({
      password: data.password,
      newPassword: data.newPassword,
    });
    if (ok) {
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  };

  const inputBaseClass =
    "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 pr-11 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest";

  return (
    <section
      id="changePass"
      className="scroll-mt-24 rounded-3xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/70 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-ink">
              Password &amp; Security
            </h2>
            <p className="mt-0.5 text-sm text-text-body">
              Update your account password to keep your EduDrop portal secure.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Current Password */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <label
              htmlFor="currentPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                id="currentPassword"
                autoComplete="current-password"
                placeholder="Enter your current password"
                {...register("password", {
                  required: "Current password is required",
                })}
                className={inputBaseClass}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={
                  showCurrent ? "Hide current password" : "Show current password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-body transition-colors hover:text-surface-forest cursor-pointer"
              >
                {showCurrent ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage
              errors={errors}
              name="password"
              render={({ message }) => (
                <p className="text-xs font-medium text-red-600">{message}</p>
              )}
            />
          </div>

          <div className="hidden lg:block" />

          {/* New Password */}
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "New password must be at least 8 characters",
                  },
                  maxLength: {
                    value: 128,
                    message: "Password must be under 128 characters",
                  },
                  validate: (value) =>
                    value !== currentPassword ||
                    "New password must differ from current password",
                })}
                className={inputBaseClass}
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                aria-label={
                  showNew ? "Hide new password" : "Show new password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-body transition-colors hover:text-surface-forest cursor-pointer"
              >
                {showNew ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage
              errors={errors}
              name="newPassword"
              render={({ message }) => (
                <p className="text-xs font-medium text-red-600">{message}</p>
              )}
            />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                className={inputBaseClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={
                  showConfirm
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-body transition-colors hover:text-surface-forest cursor-pointer"
              >
                {showConfirm ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <ErrorMessage
              errors={errors}
              name="confirmPassword"
              render={({ message }) => (
                <p className="text-xs font-medium text-red-600">{message}</p>
              )}
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="rounded-2xl border border-border-subtle/80 bg-surface-bento/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-ink mb-2.5">
            Security Requirements
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div
              className={`flex items-center gap-2 ${
                hasMinLength
                  ? "text-surface-forest font-semibold"
                  : "text-text-body"
              }`}
            >
              {hasMinLength ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-text-body/40 shrink-0" />
              )}
              <span>At least 8 characters</span>
            </div>

            <div
              className={`flex items-center gap-2 ${
                isDifferentFromCurrent
                  ? "text-surface-forest font-semibold"
                  : "text-text-body"
              }`}
            >
              {isDifferentFromCurrent ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-text-body/40 shrink-0" />
              )}
              <span>Different from current</span>
            </div>

            <div
              className={`flex items-center gap-2 ${
                passwordsMatch
                  ? "text-surface-forest font-semibold"
                  : "text-text-body"
              }`}
            >
              {passwordsMatch ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-text-body/40 shrink-0" />
              )}
              <span>Confirmation matches</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <ActionPillButton
            type="submit"
            variant="dark"
            size="md"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Password...
              </span>
            ) : (
              "Update Password"
            )}
          </ActionPillButton>
        </div>
      </form>
    </section>
  );
};

export default ChangePassword;
