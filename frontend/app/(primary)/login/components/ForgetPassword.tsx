"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import useAuth from "@/app/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { ErrorMessage } from "@hookform/error-message";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface FormValues {
  email: string;
}

interface ForgetPasswordProps {
  customTrigger?: React.ReactNode;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ customTrigger }) => {
  const { forgetPassword, dialogCloseRef } = useAuth();
  const { loading } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    criteriaMode: "all",
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    forgetPassword(data);
  };

  return (
    <Dialog>
      {customTrigger ? (
        <DialogTrigger asChild>{customTrigger}</DialogTrigger>
      ) : (
        <DialogTrigger className="text-xs font-semibold text-surface-forest hover:underline transition-all">
          Forgot password?
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md rounded-3xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="font-display text-xl font-bold text-text-ink">
              Reset Your Password
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs sm:text-sm text-text-body leading-relaxed">
              Enter your registered donor email address. We will send you a secure link and reset token immediately.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email"
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
                id="reset-email"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="donor@example.com"
                className="w-full rounded-xl border border-border-subtle bg-surface-canvas/40 py-3 pl-10 pr-4 text-sm font-medium text-text-ink placeholder:text-text-body/40 transition-all outline-none focus:bg-white focus:border-surface-forest focus:ring-2 focus:ring-surface-forest/15"
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

          {/* Hidden close ref to programmatically close after successful email dispatch */}
          <DialogClose ref={dialogCloseRef} className="hidden" />

          <div className="pt-2">
            <ActionPillButton
              type="submit"
              variant="lime"
              size="md"
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link...
                </span>
              ) : (
                "Send Reset Instructions"
              )}
            </ActionPillButton>
          </div>
        </form>

        <p className="mt-2 text-center text-[11px] text-text-body/70">
          A secure reset token will be dispatched within minutes. Check your inbox and spam folder.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ForgetPassword;
