"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  ArrowLeft,
  Building,
  Loader2,
  Lock,
  Mail,
  MapPin,
  RotateCcw,
  School,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import {
  getCountryOptions,
  normalizeCountryValue,
} from "@/app/utility/countries";
import { useAuthContext } from "@/app/context/AuthContext";
import useProfile from "@/app/hooks/useProfile";
import CardFullLoading from "@/app/sharedComponents/Loders/CardFullLoading";
import SingleImageUpload from "@/app/sharedComponents/SingleImageUpload";
import ChangePassword from "@/app/sharedComponents/Form/ChangePassword";
import ActionPillButton from "@/app/sharedComponents/ui/ActionPillButton";
import { IBursar, IDonar } from "@/app/types/User";

interface AccountSettingsHubProps {
  role: "bursar" | "donar";
}

interface ProfileFormValues {
  name: {
    firstName: string;
    lastName: string;
  };
  gender: "male" | "female" | "";
  contactNo: string;
  presentAddress: string;
  permanentAddress: string;
  address: {
    presentAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface AddressFieldConfig {
  name:
    | "presentAddress"
    | "permanentAddress"
    | "address.presentAddress"
    | "address.street"
    | "address.city"
    | "address.state"
    | "address.zipCode"
    | "address.country";
  id: string;
  label: string;
  placeholder: string;
  maxLength: number;
  type?: "text" | "country-select";
}

const ADDRESS_FIELDS_BY_ROLE: Record<"bursar" | "donar", AddressFieldConfig[]> = {
  bursar: [
    {
      name: "presentAddress",
      id: "presentAddress",
      label: "Present Address",
      placeholder: "Campus office or current street address",
      maxLength: 300,
    },
    {
      name: "permanentAddress",
      id: "permanentAddress",
      label: "Permanent Address",
      placeholder: "Permanent mailing address",
      maxLength: 300,
    },
  ],
  donar: [
    {
      name: "address.presentAddress",
      id: "donorPresentAddress",
      label: "Present Address",
      placeholder: "Primary residence or apartment",
      maxLength: 200,
    },
    {
      name: "address.street",
      id: "donorStreet",
      label: "Street",
      placeholder: "Street address",
      maxLength: 150,
    },
    {
      name: "address.city",
      id: "donorCity",
      label: "City",
      placeholder: "City",
      maxLength: 100,
    },
    {
      name: "address.state",
      id: "donorState",
      label: "State / Province",
      placeholder: "State or province",
      maxLength: 100,
    },
    {
      name: "address.zipCode",
      id: "donorZipCode",
      label: "Postal / ZIP Code",
      placeholder: "Postal or ZIP code",
      maxLength: 20,
    },
    {
      name: "address.country",
      id: "donorCountry",
      label: "Country",
      placeholder: "Select your country",
      maxLength: 100,
      type: "country-select",
    },
  ],
};

const getInitialFormValues = (
  role: "bursar" | "donar",
  profile?: IBursar | IDonar | null
): ProfileFormValues => {
  const bursar = role === "bursar" ? (profile as IBursar | undefined) : undefined;
  const donar = role === "donar" ? (profile as IDonar | undefined) : undefined;

  return {
    name: {
      firstName: profile?.name?.firstName || "",
      lastName: profile?.name?.lastName || "",
    },
    gender: profile?.gender || "",
    contactNo: profile?.contactNo || "",
    presentAddress: bursar?.presentAddress || "",
    permanentAddress: bursar?.permanentAddress || "",
    address: {
      presentAddress: donar?.address?.presentAddress || "",
      street: donar?.address?.street || "",
      city: donar?.address?.city || "",
      state: donar?.address?.state || "",
      zipCode: donar?.address?.zipCode || "",
      country: normalizeCountryValue(donar?.address?.country),
    },
  };
};

export const AccountSettingsHub: React.FC<AccountSettingsHubProps> = ({
  role,
}) => {
  const { data: userData, loading } = useAuthContext();
  const { updateProfile, isUpdatingProfile } = useProfile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMarkedForRemoval, setIsMarkedForRemoval] = useState(false);

  const profile: IBursar | IDonar | undefined = useMemo(() => {
    return role === "bursar" ? userData?.bursar : userData?.donar;
  }, [role, userData]);

  const savedCountry =
    role === "donar" ? (profile as IDonar | undefined)?.address?.country || "" : "";

  const countryOptions = useMemo(() => {
    return getCountryOptions(savedCountry);
  }, [savedCountry]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: getInitialFormValues(role, profile),
  });

  const syncFormWithProfile = useCallback(() => {
    reset(getInitialFormValues(role, profile));
    setSelectedFile(null);
    setIsMarkedForRemoval(false);
  }, [profile, reset, role]);

  useEffect(() => {
    if (profile) {
      syncFormWithProfile();
    }
  }, [profile, syncFormWithProfile]);

  const onSubmit = async (formValues: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("name.firstName", formValues.name.firstName.trim());
    formData.append("name.lastName", formValues.name.lastName.trim());
    formData.append("gender", formValues.gender || "");
    formData.append("contactNo", formValues.contactNo.trim());

    if (role === "bursar") {
      formData.append("presentAddress", (formValues.presentAddress || "").trim());
      formData.append(
        "permanentAddress",
        (formValues.permanentAddress || "").trim()
      );
    } else {
      formData.append(
        "address.presentAddress",
        (formValues.address.presentAddress || "").trim()
      );
      formData.append("address.street", (formValues.address.street || "").trim());
      formData.append("address.city", (formValues.address.city || "").trim());
      formData.append("address.state", (formValues.address.state || "").trim());
      formData.append("address.zipCode", (formValues.address.zipCode || "").trim());
      formData.append("address.country", (formValues.address.country || "").trim());
    }

    if (selectedFile) {
      formData.append("profileImage", selectedFile);
    } else if (isMarkedForRemoval) {
      formData.append("removeProfileImage", "true");
    }

    const ok = await updateProfile(role, formData);
    if (ok) {
      setSelectedFile(null);
      setIsMarkedForRemoval(false);
    }
  };

  if (loading && !userData) {
    return <CardFullLoading />;
  }

  const backHref =
    role === "bursar" ? "/bursar-dashboard" : "/donar-dashboard";

  const firstName = profile?.name?.firstName || "";
  const lastName = profile?.name?.lastName || "";
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
    (userData?.email?.[0] || "U").toUpperCase();

  const bursarSchool =
    role === "bursar" &&
    userData?.bursar?.school &&
    typeof userData.bursar.school === "object"
      ? userData.bursar.school
      : null;

  const hasChanges =
    isDirty || Boolean(selectedFile) || Boolean(isMarkedForRemoval);

  const inputClass =
    "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink outline-none transition-all placeholder:text-text-body/40 focus:border-surface-forest focus:ring-1 focus:ring-surface-forest";

  return (
    <div className="space-y-6 pb-10">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-forest hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Profile</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink">
              Account &amp; Profile Settings
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {role === "bursar" ? (
                <School className="h-3.5 w-3.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              {role === "bursar" ? "School Bursar" : "Verified Donor"}
            </span>
          </div>
          <p className="text-sm text-text-body">
            {role === "bursar"
              ? "Keep your bursar identity, campus contact details, and password up to date."
              : "Manage your personal details, shipping/billing address, and password security."}
          </p>
        </div>

        {hasChanges && (
          <div className="inline-flex items-center gap-2 self-start sm:self-center rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Main Profile Settings Card */}
      <section className="rounded-3xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento">
        <div className="flex items-start gap-3.5 border-b border-border-subtle/70 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-forest/10 text-surface-forest">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-ink">
              Personal Identity &amp; Contact
            </h2>
            <p className="mt-0.5 text-sm text-text-body">
              This information identifies your account on orders, receipts, and campus correspondence.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
          {/* Avatar + Account Read-Only Identity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center rounded-2xl border border-border-subtle/80 bg-surface-bento/40 p-5">
            <div className="lg:col-span-6">
              <SingleImageUpload
                label="Profile Avatar"
                imageUrl={profile?.profileImage}
                fallbackInitials={initials}
                selectedFile={selectedFile}
                isMarkedForRemoval={isMarkedForRemoval}
                onSelectFile={(file) => {
                  setSelectedFile(file);
                  setIsMarkedForRemoval(false);
                }}
                onRemoveImage={() => {
                  setSelectedFile(null);
                  setIsMarkedForRemoval(Boolean(profile?.profileImage));
                }}
              />
            </div>

            <div className="lg:col-span-6 space-y-3 border-t lg:border-t-0 lg:border-l border-border-subtle/80 pt-4 lg:pt-0 lg:pl-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-ink">
                  <Mail className="h-3.5 w-3.5 text-surface-forest" />
                  <span>Account Email</span>
                  <Lock className="h-3 w-3 text-text-body/60 ml-0.5" />
                </div>
                <p className="mt-1 text-sm font-semibold text-text-ink break-all">
                  {profile?.email || userData?.email || "--"}
                </p>
                <p className="mt-0.5 text-xs text-text-body">
                  Managed sign-in identifier. Contact platform support to transfer email ownership.
                </p>
              </div>

              {role === "bursar" && bursarSchool && (
                <div className="pt-2 border-t border-border-subtle/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-ink">
                    <Building className="h-3.5 w-3.5 text-surface-forest" />
                    <span>Affiliated Institution</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-surface-forest">
                    {bursarSchool.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Fields */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter first name"
                {...register("name.firstName", {
                  required: "First name is required",
                  validate: (v) =>
                    v.trim().length > 0 || "First name cannot be blank",
                  maxLength: {
                    value: 60,
                    message: "First name must be under 60 characters",
                  },
                })}
                className={inputClass}
              />
              <ErrorMessage
                errors={errors}
                name="name.firstName"
                render={({ message }) => (
                  <p className="text-xs font-medium text-red-600">{message}</p>
                )}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter last name"
                {...register("name.lastName", {
                  required: "Last name is required",
                  validate: (v) =>
                    v.trim().length > 0 || "Last name cannot be blank",
                  maxLength: {
                    value: 60,
                    message: "Last name must be under 60 characters",
                  },
                })}
                className={inputClass}
              />
              <ErrorMessage
                errors={errors}
                name="name.lastName"
                render={({ message }) => (
                  <p className="text-xs font-medium text-red-600">{message}</p>
                )}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
              >
                Gender
              </label>
              <select
                id="gender"
                {...register("gender")}
                className={`${inputClass} pr-10 cursor-pointer`}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <ErrorMessage
                errors={errors}
                name="gender"
                render={({ message }) => (
                  <p className="text-xs font-medium text-red-600">{message}</p>
                )}
              />
            </div>

            {/* Contact No */}
            <div className="space-y-2">
              <label
                htmlFor="contactNo"
                className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
              >
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactNo"
                placeholder="+1 (555) 123-4567"
                {...register("contactNo", {
                  required: "Contact number is required",
                  minLength: {
                    value: 6,
                    message: "Contact number must be at least 6 characters",
                  },
                  maxLength: {
                    value: 30,
                    message: "Contact number must be under 30 characters",
                  },
                  pattern: {
                    value: /^[+\d\s\-().]+$/,
                    message: "Please enter a valid phone number",
                  },
                })}
                className={inputClass}
              />
              <ErrorMessage
                errors={errors}
                name="contactNo"
                render={({ message }) => (
                  <p className="text-xs font-medium text-red-600">{message}</p>
                )}
              />
            </div>
          </div>

          {/* Address Fields (Role-Adapted) */}
          <div className="space-y-5 border-t border-border-subtle/70 pt-6">
            <div className="flex items-center gap-2 text-sm font-bold text-text-ink">
              <MapPin className="h-4 w-4 text-surface-forest" />
              <span>
                {role === "bursar"
                  ? "Campus & Contact Addresses"
                  : "Residence & Mailing Address"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {ADDRESS_FIELDS_BY_ROLE[role].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label
                    htmlFor={field.id}
                    className="block text-xs font-semibold uppercase tracking-wider text-text-ink"
                  >
                    {field.label}
                  </label>
                  {field.type === "country-select" ? (
                    <select
                      id={field.id}
                      {...register(field.name, {
                        maxLength: {
                          value: field.maxLength,
                          message: `Must be under ${field.maxLength} characters`,
                        },
                      })}
                      className={`${inputClass} pr-10 cursor-pointer`}
                    >
                      <option value="">{field.placeholder}</option>
                      <option value={countryOptions.featured.label}>
                        {countryOptions.featured.label}
                      </option>
                      {countryOptions.extraValue && (
                        <option value={countryOptions.extraValue}>
                          {countryOptions.extraValue}
                        </option>
                      )}
                      {countryOptions.rest.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={field.id}
                      placeholder={field.placeholder}
                      {...register(field.name, {
                        maxLength: {
                          value: field.maxLength,
                          message: `Must be under ${field.maxLength} characters`,
                        },
                      })}
                      className={inputClass}
                    />
                  )}
                  <ErrorMessage
                    errors={errors}
                    name={field.name}
                    render={({ message }) => (
                      <p className="text-xs font-medium text-red-600">
                        {message}
                      </p>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle/70 pt-5">
            <button
              type="button"
              onClick={syncFormWithProfile}
              disabled={!hasChanges || isUpdatingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-text-ink transition-all hover:bg-surface-bento disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Discard Changes</span>
            </button>

            <ActionPillButton
              type="submit"
              variant="lime"
              size="md"
              disabled={!hasChanges || isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                "Save Profile Changes"
              )}
            </ActionPillButton>
          </div>
        </form>
      </section>

      {/* Password Security Section */}
      <ChangePassword role={role} />
    </div>
  );
};

export default AccountSettingsHub;
