"use client";
import { ISubmissions } from "@/app/types/submission";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";
import toast from "react-hot-toast";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { CheckCircle2 } from "lucide-react";

export const CONTACT_TOPICS = [
  {
    slug: "general",
    label: "General Inquiry",
    placeholder: "Write your question or message...",
  },
  {
    slug: "donor",
    label: "Donor & Order Support",
    placeholder: "Include your order ID or delivery question...",
  },
  {
    slug: "school",
    label: "School & Bursar Onboarding",
    placeholder: "Include school name, city, and principal or bursar contact...",
  },
  {
    slug: "bulk",
    label: "Bulk & Corporate Giving",
    placeholder: "Include target campus, supply quantities, or matching gift details...",
  },
] as const;

interface ContactFormProps {
  id: string;
  target?: "bursar" | "platform";
  showTopicSelector?: boolean;
  selectedTopic?: string;
  onTopicChange?: (topicLabel: string) => void;
}

const ContactForm = ({
  id: schoosingle,
  target = "platform",
  showTopicSelector = false,
  selectedTopic,
  onTopicChange,
}: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ISubmissions>({
    defaultValues: {
      topic: selectedTopic || CONTACT_TOPICS[0].label,
    },
  });

  useEffect(() => {
    if (selectedTopic) {
      setValue("topic", selectedTopic);
    }
  }, [selectedTopic, setValue]);

  const activeTopic = watch("topic") || selectedTopic || CONTACT_TOPICS[0].label;
  const activeTopicMeta =
    CONTACT_TOPICS.find((t) => t.label === activeTopic) || CONTACT_TOPICS[0];

  const onSubmit: SubmitHandler<ISubmissions> = async (data) => {
    const isBursarMessage = target === "bursar" || Boolean(schoosingle);

    if (isBursarMessage && !schoosingle) {
      toast.error(
        "Unable to resolve the school bursar recipient. Please refresh and try again."
      );
      return;
    }

    try {
      setLoading(true);
      setSubmittedNotice(false);
      let response;
      if (isBursarMessage) {
        const { topic: _unusedTopic, ...bursarPayload } = data;
        response = await axios.post(`${SERVERURLAPI}/school-inbox/create`, {
          ...bursarPayload,
          bursar: schoosingle,
        });
      } else {
        const platformPayload = showTopicSelector
          ? data
          : {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              message: data.message,
            };
        response = await axios.post(
          `${SERVERURLAPI}/submissions/create`,
          platformPayload
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Message sent. We will respond within one business day.");
        setSubmittedNotice(true);
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
          topic: activeTopic,
        });
        if (isBursarMessage) {
          await Promise.all([
            handleRevalidation("bursarInboxCollection"),
            handleRevalidation("getInbox"),
          ]);
        } else {
          await handleRevalidation("SubmissionDataCollection");
        }
        setLoading(false);
      } else {
        toast.error("Submission failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Submission failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {showTopicSelector && (
          <fieldset className="space-y-2.5">
            <legend className="block text-xs font-semibold uppercase tracking-wider text-text-ink">
              Inquiry Topic
            </legend>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {CONTACT_TOPICS.map((topicItem) => {
                const isSelected = activeTopic === topicItem.label;
                return (
                  <label
                    key={topicItem.slug}
                    className={`relative flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all focus-within:ring-2 focus-within:ring-surface-forest ${
                      isSelected
                        ? "border-surface-forest bg-surface-forest text-white shadow-xs"
                        : "border-border-subtle bg-white text-text-ink hover:border-surface-forest/40 hover:bg-surface-bento/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value={topicItem.label}
                      checked={isSelected}
                      {...register("topic", {
                        onChange: (e) => onTopicChange?.(e.target.value),
                      })}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        isSelected ? "bg-brand-lime" : "bg-border-subtle"
                      }`}
                    />
                    <span className="truncate">{topicItem.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Name Fields Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              First Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              autoComplete="given-name"
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              {...register("firstName", { required: "First name is required." })}
              placeholder="Jane"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.firstName && (
              <span id="firstName-error" className="text-xs text-red-600">
                {errors.firstName.message || "First name is required."}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
            >
              Last Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              {...register("lastName", { required: "Last name is required." })}
              placeholder="Doe"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.lastName && (
              <span id="lastName-error" className="text-xs text-red-600">
                {errors.lastName.message || "Last name is required."}
              </span>
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
              Email Address <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email address is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
              placeholder="jane.doe@example.com"
              className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
            />
            {errors.email && (
              <span id="email-error" className="text-xs text-red-600">
                {errors.email.message || "Enter a valid email address."}
              </span>
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
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            {...register("message", { required: "Message is required." })}
            placeholder={
              showTopicSelector
                ? activeTopicMeta.placeholder
                : "Write your school needs or sponsorship question..."
            }
            className="w-full rounded-xl border border-border-subtle bg-white p-4 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest"
          />
          {errors.message && (
            <span id="message-error" className="text-xs text-red-600">
              {errors.message.message || "Message is required."}
            </span>
          )}
        </div>

        {submittedNotice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Message submitted. Our team replies within one business day.</span>
          </div>
        )}

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
