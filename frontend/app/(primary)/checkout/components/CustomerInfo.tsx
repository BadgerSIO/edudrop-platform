"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { getCountryOptions } from "@/app/utility/countries";
import { ErrorMessage } from "@hookform/error-message";
import BentoCard from "@/app/sharedComponents/ui/BentoCard";
import { User, MapPin, Phone } from "lucide-react";

export const CustomerInfo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <BentoCard
      variant="white"
      className="mb-8 border-border-subtle/80 p-6 sm:p-8 shadow-bento"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle/70 pb-5 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest shrink-0">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-text-ink sm:text-xl">
            Step 3: Donor Billing & Contact Information
          </h3>
          <p className="text-xs text-text-body">
            Used for your official 501(c)(3) tax receipt and delivery confirmation
            records.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Row 1: First Name & Last Name */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="e.g. Sarah"
              {...register("name.firstName", {
                required: "First name is required",
                maxLength: {
                  value: 30,
                  message: "First name cannot exceed 30 characters",
                },
              })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 px-4 py-3 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
            <ErrorMessage
              errors={errors}
              name="name.firstName"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="e.g. Jenkins"
              {...register("name.lastName", {
                required: "Last name is required",
                maxLength: {
                  value: 30,
                  message: "Last name cannot exceed 30 characters",
                },
              })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 px-4 py-3 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
            <ErrorMessage
              errors={errors}
              name="name.lastName"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>
        </div>

        {/* Row 2: Present Street Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-xs font-semibold text-text-ink mb-1.5"
          >
            Billing Street Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
            <input
              type="text"
              id="address"
              placeholder="e.g. 742 Evergreen Terrace, Suite 100"
              {...register("presentAddress", {
                required: "Street address is required",
              })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-4 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="presentAddress"
            render={({ message }) => (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {message}
              </p>
            )}
          />
        </div>

        {/* Row 3: Country & City */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="country"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="country"
                {...register("country", {
                  required: "Please select your country",
                })}
                className="w-full appearance-none rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-4 pr-10 text-sm font-medium text-text-ink transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
              >
                {(() => {
                  const { featured, rest } = getCountryOptions();
                  return (
                    <>
                      <option value={featured.label}>{featured.label}</option>
                      {rest.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </>
                  );
                })()}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-body">
                ▼
              </div>
            </div>
            <ErrorMessage
              errors={errors}
              name="country"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              placeholder="e.g. Austin"
              {...register("city", { required: "City name is required" })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 px-4 py-3 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
            <ErrorMessage
              errors={errors}
              name="city"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>
        </div>

        {/* Row 4: Postal Code & Phone */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="zipCode"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              Postal / Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              placeholder="e.g. 78701"
              {...register("zipCode", {
                required: "Postal / Zip code is required",
              })}
              className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 px-4 py-3 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
            />
            <ErrorMessage
              errors={errors}
              name="zipCode"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>

          <div>
            <label
              htmlFor="contactNo"
              className="block text-xs font-semibold text-text-ink mb-1.5"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-body/60" />
              <input
                type="tel"
                id="contactNo"
                placeholder="e.g. +1 (512) 555-0199"
                {...register("contactNo", {
                  required: "Contact phone number is required",
                })}
                className="w-full rounded-2xl border border-border-subtle bg-surface-canvas/60 py-3 pl-10 pr-4 text-sm text-text-ink placeholder:text-text-body/40 transition-colors focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="contactNo"
              render={({ message }) => (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {message}
                </p>
              )}
            />
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

export default CustomerInfo;
