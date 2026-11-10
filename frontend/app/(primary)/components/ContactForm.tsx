"use client";
import { ISubmissions } from "@/app/types/submission";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";
import toast from "react-hot-toast";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";

const ContactForm = ({ id: schoosingle }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISubmissions>();

  const onSubmit: SubmitHandler<ISubmissions> = async (data) => {
    try {
      setLoading(true);
      let response;
      if (schoosingle) {
        data["bursar"] = schoosingle;
        response = await axios.post(
          `${SERVERURLAPI}/school-inbox/create`,
          data
        );
      } else {
        response = await axios.post(`${SERVERURLAPI}/submissions/create`, data);
      }

      if (response.status === 200) {
        toast.success("Successfully submitted! We will be in touch shortly.");
        reset();
        handleRevalidation("SubmissionDataCollection");
        setLoading(false);
      } else {
        toast.error("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Fields Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              autoComplete="given-name"
              {...register("firstName", { required: true })}
              placeholder="Jane"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">First name is required</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              autoComplete="family-name"
              {...register("lastName", { required: true })}
              placeholder="Doe"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">Last name is required</span>
            )}
          </div>
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              {...register("email", { required: true })}
              placeholder="jane.doe@example.com"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.email && (
              <span className="text-xs text-red-500">A valid email is required</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              autoComplete="tel"
              {...register("phone")}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
          >
            Your Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            {...register("message", { required: true })}
            placeholder="Tell us about your school needs or community sponsorship interest..."
            className="w-full rounded-xl border border-border-subtle bg-white p-4 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
          />
          {errors.message && (
            <span className="text-xs text-red-500">Message is required</span>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <ActionPillButton
            type="submit"
            variant="dark"
            size="md"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Sending..." : "Send Message"}
          </ActionPillButton>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
