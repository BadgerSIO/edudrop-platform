"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import {
  School as SchoolIcon,
  MapPin,
  Mail,
  Phone,
  User,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Image as ImageIcon,
  HeartHandshake,
  DollarSign,
  ArrowLeft,
  Building,
  Calendar,
} from "lucide-react";
import { ISchool } from "@/app/types/School";
import { ISchoolInfo, ICampusNeed } from "@/app/types/SchoolInfo";
import { SERVERURL, SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "@/app/utility/handleCookie";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "@/app/utility/validateImageFile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import useSchool from "@/app/hooks/useSchool";
import { dateConverter } from "@/app/utility/dateConverter";

interface SchoolDetailHubProps {
  school?: ISchool | null;
  schoolInfo?: ISchoolInfo | null;
  rTag?: string;
  isBursarView?: boolean;
}

export default function SchoolDetailHub({
  school,
  schoolInfo,
  rTag = "schoolInfoCollection",
  isBursarView = false,
}: SchoolDetailHubProps) {
  const router = useRouter();
  const { handleSchoolStatus, handleDeleteSchool, loadingSchool } = useSchool();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Tab 1: Administrative form states (School level)
  const [schoolName, setSchoolName] = useState(school?.name || schoolInfo?.schoolName || "");
  const [schoolPhone, setSchoolPhone] = useState(school?.contactNo || "");
  const [street, setStreet] = useState(school?.address?.street || "");
  const [city, setCity] = useState(school?.address?.city || "");
  const [state, setState] = useState(school?.address?.state || "");
  const [zipCode, setZipCode] = useState(school?.address?.zipCode || "");

  // Tab 2: Profile & Branding states (SchoolInfo level)
  const [principal, setPrincipal] = useState(schoolInfo?.principal || "");
  const [vicePrincipal, setVicePrincipal] = useState(schoolInfo?.vicePrincipal || "");
  const [websiteLink, setWebsiteLink] = useState(schoolInfo?.schoolWebsiteLink || "");
  const [shortDescription, setShortDescription] = useState(schoolInfo?.shortDescription || "");
  const [heroTitle, setHeroTitle] = useState(schoolInfo?.heroTitle || "");
  const [sectionOneTitle, setSectionOneTitle] = useState(schoolInfo?.sectionOneTitle || "");
  const [sectionOneDescription, setSectionOneDescription] = useState(schoolInfo?.sectionOneDescription || "");

  // Images
  const [schoolLogo, setSchoolLogo] = useState(schoolInfo?.schoolLogo || "");
  const [featuredImage, setFeaturedImage] = useState(schoolInfo?.featuredImage || "");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(schoolInfo?.heroBackgroundImage || "");
  const [sectionOneImage, setSectionOneImage] = useState(schoolInfo?.sectionOneImage || "");

  // Tab 3: Campus Needs Tracker
  const [campusNeeds, setCampusNeeds] = useState<ICampusNeed[]>(
    schoolInfo?.campusNeeds || [
      { itemTitle: "5-Gallon Water Dispenser", targetQuantity: 10, fulfilledQuantity: 0, priority: "high" },
      { itemTitle: "Spring Water Bottle Cases", targetQuantity: 50, fulfilledQuantity: 0, priority: "medium" },
    ]
  );

  // Tab 4: Gallery & Highlights
  const [gallery, setGallery] = useState<{ imageUrl: string; title?: string }[]>(
    schoolInfo?.gallery || []
  );
  const [achievements, setAchievements] = useState<{ title: string }[]>(
    schoolInfo?.achievements || [{ title: "" }]
  );
  const [schoolStats, setSchoolStats] = useState<{ title: string }[]>(
    schoolInfo?.schoolStats || [{ title: "" }]
  );

  // Single Image Uploader Helper
  const handleUploadFile = async (
    file: File,
    onSuccess: (url: string) => void,
    options?: { type?: "logo" | "media"; previousTemporaryUrl?: string }
  ) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      const jwt = await getCookie("jwt");
      const formData = new FormData();
      if (options?.type) {
        formData.append("type", options.type);
      }
      if (options?.previousTemporaryUrl) {
        formData.append("previousTemporaryUrl", options.previousTemporaryUrl);
      }
      formData.append("image", file);

      const res = await axios.post(`${SERVERURLAPI}/school/upload-image`, formData, {
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 && res.data?.data?.imageUrl) {
        onSuccess(res.data.data.imageUrl);
        toast.success("Image uploaded");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  // Save Tab 1: Administrative Information
  const saveAdminInfo = async () => {
    if (!school?._id) return;
    try {
      setSaving(true);
      const jwt = await getCookie("jwt");
      const res = await axios.patch(
        `${SERVERURLAPI}/school/${school._id}`,
        {
          name: schoolName.trim(),
          contactNo: schoolPhone.trim(),
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
          },
        },
        { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} }
      );

      if (res.status === 200) {
        toast.success("Campus administrative details updated");
        await handleRevalidation("schoolCollection");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update school details");
    } finally {
      setSaving(false);
    }
  };

  // Save Tab 2, 3, 4: SchoolInfo Profile Information
  const saveProfileInfo = async () => {
    const targetId =
      schoolInfo?._id || schoolInfo?.school || school?._id || (schoolInfo?.bursar as any)?._id;

    if (!targetId) {
      toast.error("Profile identifier not found");
      return;
    }

    try {
      setSaving(true);
      const jwt = await getCookie("jwt");

      // Filter empty strings from lists
      const cleanAchievements = achievements.filter((a) => a.title.trim().length > 0);
      const cleanStats = schoolStats.filter((s) => s.title.trim().length > 0);
      const cleanGallery = gallery.filter((g) => g.imageUrl.trim().length > 0);

      const payload = {
        schoolName: schoolName.trim(),
        principal: principal.trim(),
        vicePrincipal: vicePrincipal.trim(),
        schoolWebsiteLink: websiteLink.trim(),
        shortDescription: shortDescription.trim(),
        heroTitle: heroTitle.trim(),
        sectionOneTitle: sectionOneTitle.trim(),
        sectionOneDescription: sectionOneDescription.trim(),
        schoolLogo,
        featuredImage,
        heroBackgroundImage,
        sectionOneImage,
        campusNeeds,
        gallery: cleanGallery,
        achievements: cleanAchievements,
        schoolStats: cleanStats,
      };

      const res = await axios.patch(
        `${SERVERURLAPI}/school-info/${targetId}`,
        payload,
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (res.status === 200) {
        toast.success("Campus profile and branding updated successfully");
        await handleRevalidation(rTag);
        await handleRevalidation("schoolInfoCollection");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  // Image Card Helper
  const ImageBox = ({
    title,
    imageUrl,
    onChange,
    uploadType = "media",
  }: {
    title: string;
    imageUrl: string;
    onChange: (url: string) => void;
    uploadType?: "logo" | "media";
  }) => {
    const fileRef = React.useRef<HTMLInputElement>(null);
    let fullUrl = "";
    if (imageUrl) {
      fullUrl = imageUrl.startsWith("http") ? imageUrl : `${SERVERURL}${imageUrl}`;
    }

    return (
      <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-3.5 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
          {title}
        </span>
        <input
          type="file"
          ref={fileRef}
          accept={IMAGE_ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              handleUploadFile(f, onChange, {
                type: uploadType,
                previousTemporaryUrl: imageUrl,
              });
            }
            e.target.value = "";
          }}
        />

        {imageUrl ? (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border-subtle bg-white flex items-center justify-center group">
            <Image
              src={fullUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-text-ink shadow"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg bg-red-600 p-1 text-white shadow hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-border-subtle hover:border-surface-forest bg-white cursor-pointer transition-colors p-4 text-center group"
          >
            <Upload className="h-5 w-5 text-text-muted group-hover:text-surface-forest transition-colors mb-1" />
            <span className="text-xs font-medium text-text-muted">Upload {title}</span>
          </div>
        )}
      </div>
    );
  };

  const isActive = school?.active || schoolInfo?.active;
  const currentSlug = school?.slug || schoolInfo?.slug || "";

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border-subtle/80">
          <div className="flex items-center gap-4">
            {!isBursarView && (
              <Link
                href="/dashboard/schools-list"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted hover:text-text-ink hover:bg-surface-bento/50 transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}

            <div className="flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface-bento/30 overflow-hidden flex-shrink-0">
                {schoolLogo ? (
                  <Image
                    src={schoolLogo.startsWith("http") ? schoolLogo : `${SERVERURL}${schoolLogo}`}
                    alt="Logo"
                    fill
                    className="object-contain p-1.5"
                  />
                ) : (
                  <SchoolIcon className="h-6 w-6 text-surface-forest" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                    {schoolName || "Partner Campus Profile"}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isActive
                        ? "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-surface-forest" : "bg-amber-500"
                      }`}
                    />
                    {isActive ? "Verified Active" : "Pending Verification"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {city ? `${city}, ${state || "USA"}` : "Location pending"}
                  </span>
                  <span className="font-mono bg-surface-bento/60 px-2 py-0.5 rounded-md">
                    /schools/{currentSlug}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {currentSlug && (
              <a
                href={`/schools/${currentSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/50 transition-colors shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Public Page</span>
              </a>
            )}

            {!isBursarView && school && (
              <>
                <CustomAlertDialouge
                  triggerText={isActive ? "Deactivate Campus" : "Activate Campus"}
                  triggerClass={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-surface-forest text-white hover:bg-surface-forest-light shadow-bento"
                  } ${loadingSchool ? "opacity-60 cursor-not-allowed" : ""}`}
                  alertDescription={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                  } this school? ${
                    isActive ? "It will be temporarily hidden from donor sponsorship." : "It will be listed in public school directory."
                  }`}
                  onConfirm={() => handleSchoolStatus(school.slug)}
                />

                <CustomAlertDialouge
                  triggerText="Archive School"
                  triggerClass="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  alertDescription="Are you sure you want to archive this school? This will disable the bursar account while preserving historic sponsorship logs."
                  onConfirm={() => school._id && handleDeleteSchool(school._id)}
                />
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview & Administration</TabsTrigger>
              <TabsTrigger value="branding">Profile & Branding</TabsTrigger>
              <TabsTrigger value="needs">Campus Needs Tracker</TabsTrigger>
              <TabsTrigger value="gallery">Photo Gallery & Highlights</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW & ADMINISTRATION */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Stats KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                      Total Donations Received
                    </span>
                    <span className="text-xl font-bold text-text-ink block mt-0.5">
                      ${school?.amountReceived || 0}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/20 text-surface-forest">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                      Requested Campus Needs
                    </span>
                    <span className="text-xl font-bold text-text-ink block mt-0.5">
                      {campusNeeds.length} items
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-bento text-text-body">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                      Partner Since
                    </span>
                    <span className="text-sm font-bold text-text-ink block mt-1">
                      {dateConverter(school?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campus Location & Bursar Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location & Administrative Address */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-surface-forest" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                        Campus Identity & Address
                      </h3>
                    </div>
                    {!isBursarView && (
                      <button
                        type="button"
                        onClick={saveAdminInfo}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-forest px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-surface-forest-light"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Address</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        disabled={isBursarView}
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                          Campus Contact Phone
                        </label>
                        <input
                          type="text"
                          disabled={isBursarView}
                          value={schoolPhone}
                          onChange={(e) => setSchoolPhone(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          disabled={isBursarView}
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          disabled={isBursarView}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          disabled={isBursarView}
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          disabled={isBursarView}
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Bursar Profile */}
                <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
                    <User className="h-4 w-4 text-surface-forest" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                      Registered Campus Bursar
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-bento/30 border border-border-subtle/70">
                      <div>
                        <span className="text-xs font-bold text-text-ink block">
                          {school?.bursar?.name?.firstName
                            ? `${school.bursar.name.firstName} ${school.bursar.name.lastName || ""}`
                            : (schoolInfo?.bursar as any)?.name?.firstName
                            ? `${(schoolInfo?.bursar as any).name.firstName} ${(schoolInfo?.bursar as any).name.lastName || ""}`
                            : "No bursar assigned"}
                        </span>
                        <span className="text-[11px] text-text-muted block">
                          Official Campus Delivery Contact
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Authorized
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-text-body">
                        <Mail className="h-3.5 w-3.5 text-text-muted" />
                        <span>
                          {school?.bursar?.email || (schoolInfo?.bursar as any)?.email || "Email pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text-body">
                        <Phone className="h-3.5 w-3.5 text-text-muted" />
                        <span>
                          {school?.bursar?.contactNo || (schoolInfo?.bursar as any)?.contactNo || "Phone pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: PROFILE & BRANDING */}
            <TabsContent value="branding" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-ink">Campus Branding & Narrative</h3>
                  <p className="text-xs text-text-muted">
                    This media and story are showcased to prospective donors sponsoring student hydration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveProfileInfo}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow hover:bg-surface-forest-light"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save Profile & Branding"}</span>
                </button>
              </div>

              {/* Media Upload Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ImageBox title="Campus Logo" imageUrl={schoolLogo} onChange={setSchoolLogo} uploadType="logo" />
                <ImageBox title="Featured Card Image" imageUrl={featuredImage} onChange={setFeaturedImage} />
                <ImageBox title="Hero Background" imageUrl={heroBackgroundImage} onChange={setHeroBackgroundImage} />
                <ImageBox title="Mission Section Image" imageUrl={sectionOneImage} onChange={setSectionOneImage} />
              </div>

              {/* Narrative Content */}
              <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Campus Hero Banner Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Empowering 850 Students with Pure, Daily Spring Water"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Short Mission Summary (Overview for Donors)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Explain the campus background, water access needs, and student impact..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Principal Name
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. Eleanor Vance"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Vice Principal Name
                    </label>
                    <input
                      type="text"
                      placeholder="Marcus Brody"
                      value={vicePrincipal}
                      onChange={(e) => setVicePrincipal(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Official Website Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://oakridgehigh.edu"
                      value={websiteLink}
                      onChange={(e) => setWebsiteLink(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Spotlight Section Title
                    </label>
                    <input
                      type="text"
                      placeholder="Hydration in our Classrooms"
                      value={sectionOneTitle}
                      onChange={(e) => setSectionOneTitle(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                      Spotlight Section Story
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Details on campus hydration station deployment..."
                      value={sectionOneDescription}
                      onChange={(e) => setSectionOneDescription(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: CAMPUS NEEDS TRACKER */}
            <TabsContent value="needs" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-ink">Hydration & Supply Requirements</h3>
                  <p className="text-xs text-text-muted">
                    Set requested quantities of water dispensers, bottle cases, and hygiene packs for donors to fulfill.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCampusNeeds([
                        ...campusNeeds,
                        { itemTitle: "", targetQuantity: 10, fulfilledQuantity: 0, priority: "medium" },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-2 text-xs font-semibold text-text-ink hover:bg-surface-bento/50 shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item Needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={saveProfileInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow hover:bg-surface-forest-light"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Needs"}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border-subtle bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-border-subtle bg-surface-bento/30 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="px-5 py-3">Item / Equipment Title</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3">Goal Quantity</th>
                      <th className="px-5 py-3">Pledged / Fulfilled</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/80">
                    {campusNeeds.map((need, idx) => {
                      const percent =
                        need.targetQuantity > 0
                          ? Math.min(100, Math.round((need.fulfilledQuantity / need.targetQuantity) * 100))
                          : 0;

                      return (
                        <tr key={idx} className="hover:bg-surface-bento/20 transition-colors">
                          <td className="px-5 py-3">
                            <input
                              type="text"
                              value={need.itemTitle}
                              onChange={(e) => {
                                const updated = [...campusNeeds];
                                updated[idx].itemTitle = e.target.value;
                                setCampusNeeds(updated);
                              }}
                              placeholder="e.g. 5-Gallon Water Cooler Dispenser"
                              className="w-full rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs text-text-ink focus:border-surface-forest focus:outline-none"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={need.priority || "medium"}
                              onChange={(e) => {
                                const updated = [...campusNeeds];
                                updated[idx].priority = e.target.value as any;
                                setCampusNeeds(updated);
                              }}
                              className="rounded-lg border border-border-subtle bg-white px-2 py-1 text-xs text-text-ink focus:border-surface-forest focus:outline-none"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            <input
                              type="number"
                              min="1"
                              value={need.targetQuantity}
                              onChange={(e) => {
                                const updated = [...campusNeeds];
                                updated[idx].targetQuantity = Number(e.target.value) || 0;
                                setCampusNeeds(updated);
                              }}
                              className="w-24 rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-xs text-text-ink focus:border-surface-forest focus:outline-none"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-text-ink">
                                {need.fulfilledQuantity} / {need.targetQuantity} ({percent}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setCampusNeeds(campusNeeds.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-text-muted hover:text-red-600 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* TAB 4: PHOTO GALLERY & HIGHLIGHTS */}
            <TabsContent value="gallery" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-ink">Campus Photo Gallery & Fast Facts</h3>
                  <p className="text-xs text-text-muted">
                    Showcase active students, hydration station setups, and academic achievements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveProfileInfo}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow hover:bg-surface-forest-light"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save Gallery"}</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Campus Photos
                  </span>
                  <label className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3.5 py-1.5 text-xs font-semibold text-text-ink hover:bg-surface-bento/50 cursor-pointer shadow-sm">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept={IMAGE_ACCEPT_ATTR}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleUploadFile(f, (url) => {
                            setGallery((prev) => [...prev, { imageUrl: url, title: "" }]);
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((photo, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border-subtle bg-white p-3 space-y-2 shadow-sm"
                    >
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border-subtle bg-surface-bento/20">
                        <Image
                          src={photo.imageUrl.startsWith("http") ? photo.imageUrl : `${SERVERURL}${photo.imageUrl}`}
                          alt="Campus photo"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Caption (e.g. New water station in science wing)"
                        value={photo.title || ""}
                        onChange={(e) => {
                          const updated = [...gallery];
                          updated[idx].title = e.target.value;
                          setGallery(updated);
                        }}
                        className="w-full rounded-lg border border-border-subtle bg-surface-bento/20 px-3 py-1.5 text-xs text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements & Fast Facts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-subtle/80">
                {/* Achievements */}
                <div className="rounded-xl border border-border-subtle bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
                      Campus Achievements & Awards
                    </span>
                    <button
                      type="button"
                      onClick={() => setAchievements([...achievements, { title: "" }])}
                      className="text-xs text-surface-forest font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. State Academic Excellence 2025"
                          value={ach.title}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].title = e.target.value;
                            setAchievements(updated);
                          }}
                          className="flex-1 rounded-lg border border-border-subtle bg-surface-bento/20 px-3 py-1.5 text-xs text-text-ink focus:border-surface-forest focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                          className="p-1 text-text-muted hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fast Facts / Stats */}
                <div className="rounded-xl border border-border-subtle bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
                      Campus Statistics & Fast Facts
                    </span>
                    <button
                      type="button"
                      onClick={() => setSchoolStats([...schoolStats, { title: "" }])}
                      className="text-xs text-surface-forest font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {schoolStats.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 850+ Enrolled Students"
                          value={st.title}
                          onChange={(e) => {
                            const updated = [...schoolStats];
                            updated[idx].title = e.target.value;
                            setSchoolStats(updated);
                          }}
                          className="flex-1 rounded-lg border border-border-subtle bg-surface-bento/20 px-3 py-1.5 text-xs text-text-ink focus:border-surface-forest focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSchoolStats(schoolStats.filter((_, i) => i !== idx))}
                          className="p-1 text-text-muted hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
