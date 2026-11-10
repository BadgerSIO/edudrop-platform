"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generatePassword } from "@/app/utility/passwordGenerator";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import axios from "axios";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import {
  Building2,
  MapPin,
  UserCheck,
  KeyRound,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type FormInputs = {
  name: string;
  slug?: string;
  address: { street: string; city: string; state: string; zipCode: string };
  contactNo: string;
  bursar: {
    name: {
      firstName: string;
      lastName: string;
    };
    email: string;
    gender: "male" | "female";
    contactNo: string;
    password: string;
    confirmPassword?: string;
  };
};

const AddSchoolForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugLocked, setSlugLocked] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormInputs>({
    criteriaMode: "all",
    defaultValues: {
      bursar: {
        gender: "female",
      },
    },
  });

  const schoolNameValue = watch("name", "");
  const currentSlugValue = watch("slug", "");
  const password = watch("bursar.password", "");

  // Auto-generate slug when school name changes and slug is locked
  useEffect(() => {
    if (slugLocked && schoolNameValue) {
      const generatedSlug = schoolNameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [schoolNameValue, slugLocked, setValue]);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const generateAndSetPassword = () => {
    const newPassword = generatePassword();
    setValue("bursar.password", newPassword);
    setValue("bursar.confirmPassword", newPassword);
    navigator.clipboard
      .writeText(newPassword)
      .then(() => {
        toast.success("Generated strong password copied to clipboard!", {
          position: "bottom-left",
          duration: 4000,
        });
      })
      .catch(() => {
        toast.error("Failed to copy password to clipboard");
      });
  };

  const onSubmit = async (data: FormInputs) => {
    try {
      setIsSubmitting(true);
      const jwt = await getCookie("jwt");

      const {
        bursar: { confirmPassword, ...updatedBursar },
        ...restData
      } = data;

      const payload = {
        ...restData,
        slug: data.slug?.trim() || undefined,
        bursar: updatedBursar,
      };

      const response = await axios.post(
        `${SERVERURLAPI}/school/create`,
        payload,
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (response.status === 200) {
        toast.success("Campus & Bursar account registered successfully!");
        await handleRevalidation("schoolCollection");
        await handleRevalidation("schoolInfoCollection");
        reset();
        router.push("/dashboard/schools-list");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || `Failed to create school: ${error}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Card 1: School Identity & Campus Location */}
        <div className="rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-ink">
                Campus Identity & Location
              </h3>
              <p className="text-xs text-text-muted">
                Official institution details and physical delivery address.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* School Name */}
            <div className="space-y-2">
              <label htmlFor="schoolName" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                School / Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="schoolName"
                {...register("name", { required: "School name is required" })}
                placeholder="e.g. Lincoln High School"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="name"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Slug / Public URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="slug" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                  Public URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setSlugLocked(!slugLocked)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-surface-forest transition-colors"
                >
                  {slugLocked ? (
                    <>
                      <Lock className="h-3 w-3" /> Auto-sync enabled
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3 text-amber-600" /> Manual editing
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2.5 focus-within:border-surface-forest focus-within:bg-white transition-all">
                <span className="text-xs font-medium text-text-muted select-none mr-1">
                  /schools/
                </span>
                <input
                  type="text"
                  id="slug"
                  readOnly={slugLocked}
                  {...register("slug")}
                  placeholder="lincoln-high-school"
                  className={`w-full bg-transparent text-sm font-mono text-text-ink focus:outline-none ${
                    slugLocked ? "cursor-default text-text-muted" : ""
                  }`}
                />
              </div>
            </div>

            {/* School Contact Number */}
            <div className="space-y-2">
              <label htmlFor="schoolcontactNo" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Campus Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="schoolcontactNo"
                {...register("contactNo", { required: "Contact number is required" })}
                placeholder="e.g. +1 (555) 019-2834"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="contactNo"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <label htmlFor="schoolstreet" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="schoolstreet"
                {...register("address.street", { required: "Street address is required" })}
                placeholder="100 Education Way, Suite 4B"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="address.street"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* City, State, Zip Code 3-column split */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="schoolcity" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="schoolcity"
                  {...register("address.city", { required: "City is required" })}
                  placeholder="Springfield"
                  className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
                />
                <ErrorMessage
                  errors={errors}
                  name="address.city"
                  render={({ message }) => (
                    <p className="text-xs text-red-500">{message}</p>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="schoolstate" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                  State / Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="schoolstate"
                  {...register("address.state", { required: "State is required" })}
                  placeholder="IL"
                  className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
                />
                <ErrorMessage
                  errors={errors}
                  name="address.state"
                  render={({ message }) => (
                    <p className="text-xs text-red-500">{message}</p>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                  Postal / Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  {...register("address.zipCode")}
                  placeholder="62701"
                  className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Bursar Account Provisioning */}
        <div className="rounded-2xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/20 text-surface-forest">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-ink">
                Campus Bursar Account Provisioning
              </h3>
              <p className="text-xs text-text-muted">
                Initial login credentials for the school bursar to manage campus orders & needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="bursarfirstName" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bursarfirstName"
                {...register("bursar.name.firstName", { required: "First name is required" })}
                placeholder="Jane"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="bursar.name.firstName"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="bursarlastName" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bursarlastName"
                {...register("bursar.name.lastName", { required: "Last name is required" })}
                placeholder="Doe"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="bursar.name.lastName"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="bursaremail" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Bursar Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="bursaremail"
                {...register("bursar.email", { required: "Bursar email is required" })}
                placeholder="bursar@springfield.edu"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="bursar.email"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <label htmlFor="bursarcontactNo" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Bursar Direct Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="bursarcontactNo"
                {...register("bursar.contactNo", { required: "Contact phone is required" })}
                placeholder="+1 (555) 019-2835"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="bursar.contactNo"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label htmlFor="bursargender" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                Gender
              </label>
              <select
                id="bursargender"
                {...register("bursar.gender", { required: "Gender is required" })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            {/* Password Generator Action */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bursarPassword" className="block text-xs font-bold uppercase tracking-wider text-text-ink">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateAndSetPassword}
                  className="inline-flex items-center gap-1 text-xs font-bold text-surface-forest hover:text-surface-forest/80 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-brand-lime fill-brand-lime" />
                  Generate Strong
                </button>
              </div>
              <input
                type="text"
                id="bursarPassword"
                {...register("bursar.password", {
                  required: "Password is required",
                  pattern: {
                    value: strongPasswordRegex,
                    message:
                      "Password must have 8+ characters, including uppercase, lowercase, number, and symbol.",
                  },
                })}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm font-mono text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none transition-all"
              />
              <ErrorMessage
                errors={errors}
                name="bursar.password"
                render={({ message }) => (
                  <p className="text-xs text-red-500">{message}</p>
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/schools-list")}
            className="w-full sm:w-auto rounded-xl border border-border-subtle bg-white px-6 py-3 text-sm font-semibold text-text-ink hover:bg-surface-bento/40 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-surface-forest px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-surface-forest/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Registering Campus...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-brand-lime" />
                <span>Register Campus & Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSchoolForm;
