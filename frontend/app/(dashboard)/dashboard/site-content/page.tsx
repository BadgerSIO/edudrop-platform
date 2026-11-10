"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { getCookie } from "@/app/utility/handleCookie";
import { SERVERURLAPI } from "@/lib/constants";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";
import { handleBuildImage } from "@/app/utility/handleBuildImage";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "@/app/utility/validateImageFile";
import {
  Globe,
  Sparkles,
  Award,
  Layers,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  Upload,
  Check,
  Save,
  Loader2,
} from "lucide-react";

export default function SiteContentCMSPage() {
  const [activeTab, setActiveTab] = useState<
    "hero" | "why" | "steps" | "works" | "testimonials" | "contact"
  >("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<any>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVERURLAPI}/cms`);
      if (res.data?.data) {
        setContent(res.data.data);
      }
    } catch (err: any) {
      toast.error("Failed to load CMS content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (updatedData: any) => {
    try {
      setSaving(true);
      const jwt = await getCookie("jwt");
      const res = await axios.patch(`${SERVERURLAPI}/cms`, updatedData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (res.status === 200) {
        toast.success("Site content saved successfully!");
        setContent(res.data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    previousTemporaryUrl?: string
  ): Promise<string | null> => {
    if (!file) return null;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return null;
    }

    const formData = new FormData();
    if (previousTemporaryUrl) {
      formData.append("previousTemporaryUrl", previousTemporaryUrl);
    }
    formData.append("image", file);

    try {
      setUploading(true);
      const jwt = await getCookie("jwt");
      const res = await axios.post(`${SERVERURLAPI}/cms/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.data?.url) {
        toast.success("Image uploaded!");
        return res.data.data.url;
      }
      return null;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <EduDropLoader
        size="md"
        label="Loading site content..."
        sublabel="Preparing CMS sections and media assets"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-ink flex items-center gap-2">
            <Globe className="h-6 w-6 text-surface-forest" />
            Site Content CMS
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Customize homepage copy, live impact metrics, process steps, campus delivery gallery, testimonials, and SEO metadata.
          </p>
        </div>
        <button
          onClick={() => handleSave(content)}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-forest px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-surface-forest/90 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border-subtle pb-2">
        {[
          { key: "hero", label: "Hero & Impact", icon: Sparkles },
          { key: "why", label: "Why EduDrop", icon: Award },
          { key: "steps", label: "3-Step Process", icon: Layers },
          { key: "works", label: "Recent Deliveries", icon: Globe },
          { key: "testimonials", label: "Testimonials", icon: MessageSquare },
          { key: "contact", label: "Contact & SEO", icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] motion-reduce:active:scale-100 ${
                isActive
                  ? "bg-surface-forest text-white shadow-sm"
                  : "bg-surface-bento/60 text-text-body hover:bg-surface-bento hover:text-text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        key={activeTab}
        className="tab-panel-enter rounded-2xl border border-border-subtle bg-white p-6 shadow-sm"
      >
        {/* 1. HERO TAB */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-text-ink">Hero Header & Live Impact Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-text-ink">Eyebrow</label>
                <input
                  type="text"
                  value={content?.hero?.eyebrow ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, eyebrow: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Headline</label>
                <input
                  type="text"
                  value={content?.hero?.headline ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-ink">Subheadline</label>
                <textarea
                  rows={2}
                  value={content?.hero?.subheadline ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, subheadline: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Total Sponsored (Display)</label>
                <input
                  type="text"
                  value={content?.hero?.totalSponsored ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, totalSponsored: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Progress Percent (0 - 100)</label>
                <input
                  type="number"
                  value={content?.hero?.progressPercent ?? 0}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        progressPercent: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Donor Count Badge</label>
                <input
                  type="text"
                  value={content?.hero?.donorCount ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, donorCount: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Goal Highlight Subtitle</label>
                <input
                  type="text"
                  value={content?.hero?.highlightText ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, highlightText: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink focus:border-surface-forest outline-none"
                />
              </div>
            </div>

            {/* Trust Strip */}
            <div className="pt-6 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-ink">Trust Strip Proof Points</h3>
                <button
                  type="button"
                  onClick={() => {
                    const strip = content?.hero?.trustStrip || [];
                    setContent({
                      ...content,
                      hero: {
                        ...content.hero,
                        trustStrip: [...strip, { metric: "100%", label: "Verified" }],
                      },
                    });
                  }}
                  className="rounded-full bg-surface-forest px-3 py-1 text-xs font-semibold text-white hover:bg-surface-forest/90"
                >
                  + Add Point
                </button>
              </div>

              <div className="space-y-3">
                {(content?.hero?.trustStrip || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Metric (e.g. 100%)"
                      value={item.metric}
                      onChange={(e) => {
                        const newStrip = [...content.hero.trustStrip];
                        newStrip[idx].metric = e.target.value;
                        setContent({
                          ...content,
                          hero: { ...content.hero, trustStrip: newStrip },
                        });
                      }}
                      className="w-1/3 rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g. Direct-to-Bursar)"
                      value={item.label}
                      onChange={(e) => {
                        const newStrip = [...content.hero.trustStrip];
                        newStrip[idx].label = e.target.value;
                        setContent({
                          ...content,
                          hero: { ...content.hero, trustStrip: newStrip },
                        });
                      }}
                      className="flex-1 rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newStrip = content.hero.trustStrip.filter(
                          (_: any, i: number) => i !== idx
                        );
                        setContent({
                          ...content,
                          hero: { ...content.hero, trustStrip: newStrip },
                        });
                      }}
                      className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. WHY EDUDROP TAB */}
        {activeTab === "why" && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-text-ink">Why EduDrop (Story & Proof)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-ink">Eyebrow</label>
                <input
                  type="text"
                  value={content?.whyEduDrop?.eyebrow ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      whyEduDrop: { ...content.whyEduDrop, eyebrow: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Heading</label>
                <input
                  type="text"
                  value={content?.whyEduDrop?.heading ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      whyEduDrop: { ...content.whyEduDrop, heading: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-ink">Lead Conviction Statement</label>
                <textarea
                  rows={2}
                  value={content?.whyEduDrop?.leadStatement ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      whyEduDrop: {
                        ...content.whyEduDrop,
                        leadStatement: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-ink">Body Description</label>
                <textarea
                  rows={3}
                  value={content?.whyEduDrop?.body ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      whyEduDrop: { ...content.whyEduDrop, body: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-white p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-ink">Featured Photo</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT_ATTR}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) {
                        const url = await handleImageUpload(
                          file,
                          content?.whyEduDrop?.image
                        );
                        if (url) {
                          setContent({
                            ...content,
                            whyEduDrop: { ...content.whyEduDrop, image: url },
                          });
                        }
                      }
                    }}
                    className="text-xs text-text-body file:rounded-full file:border-0 file:bg-surface-forest file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-surface-forest/90"
                  />
                  {content?.whyEduDrop?.image && (
                    <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-border-subtle">
                      <Image
                        src={handleBuildImage(content.whyEduDrop.image, "/home/w7.webp")}
                        alt="Preview"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. STEPS TAB */}
        {activeTab === "steps" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-ink">3-Step Direct Sponsorship Process</h2>
                <p className="text-xs text-text-muted">Explain how community donors select schools and fund physical supplies.</p>
              </div>
            </div>

            <div className="space-y-4">
              {(content?.howItWorks || []).map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border-subtle bg-surface-bento/30 p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-surface-forest">
                      Step #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Title"
                      value={step.title}
                      onChange={(e) => {
                        const newSteps = [...content.howItWorks];
                        newSteps[idx].title = e.target.value;
                        setContent({ ...content, howItWorks: newSteps });
                      }}
                      className="flex-1 rounded-lg border border-border-subtle bg-white p-2 text-xs font-semibold text-text-ink outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Description</label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => {
                        const newSteps = [...content.howItWorks];
                        newSteps[idx].description = e.target.value;
                        setContent({ ...content, howItWorks: newSteps });
                      }}
                      className="mt-1 w-full rounded-lg border border-border-subtle bg-white p-2 text-xs text-text-ink outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RECENT DELIVERIES TAB */}
        {activeTab === "works" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-ink">Recent Campus Deliveries (Our Works)</h2>
                <p className="text-xs text-text-muted">Showcase verified drop-offs with photos, school captions, and delivery details.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const works = content?.ourWorks || [];
                  setContent({
                    ...content,
                    ourWorks: [
                      ...works,
                      {
                        title: "New School Delivery",
                        caption: "Partner School",
                        description: "Supplies delivered to students and teachers.",
                        imageUrl: "/home/w1.webp",
                        active: true,
                        order: works.length + 1,
                      },
                    ],
                  });
                }}
                className="rounded-full bg-surface-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-surface-forest/90"
              >
                + Add Delivery Item
              </button>
            </div>

            <div className="space-y-4">
              {(content?.ourWorks || []).map((work: any, idx: number) => (
                <div
                  key={work._id || idx}
                  className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image Preview / Upload */}
                    <div className="sm:w-36 flex flex-col items-center">
                      <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-border-subtle bg-black/10">
                        <Image
                          src={handleBuildImage(work.imageUrl, "/home/w1.webp")}
                          alt={work.title || "Preview"}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                      </div>
                      <input
                        type="file"
                        accept={IMAGE_ACCEPT_ATTR}
                        id={`work-file-${idx}`}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) {
                            const url = await handleImageUpload(file, work.imageUrl);
                            if (url) {
                              const newWorks = [...content.ourWorks];
                              newWorks[idx].imageUrl = url;
                              setContent({ ...content, ourWorks: newWorks });
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor={`work-file-${idx}`}
                        className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-semibold text-text-ink hover:bg-surface-bento"
                      >
                        <Upload className="h-3 w-3" /> Change Photo
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-text-ink">School / Title</label>
                          <input
                            type="text"
                            value={work.title}
                            onChange={(e) => {
                              const newWorks = [...content.ourWorks];
                              newWorks[idx].title = e.target.value;
                              setContent({ ...content, ourWorks: newWorks });
                            }}
                            className="w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-ink">Caption</label>
                          <input
                            type="text"
                            value={work.caption}
                            onChange={(e) => {
                              const newWorks = [...content.ourWorks];
                              newWorks[idx].caption = e.target.value;
                              setContent({ ...content, ourWorks: newWorks });
                            }}
                            className="w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-text-ink">Delivery Description</label>
                        <textarea
                          rows={2}
                          value={work.description}
                          onChange={(e) => {
                            const newWorks = [...content.ourWorks];
                            newWorks[idx].description = e.target.value;
                            setContent({ ...content, ourWorks: newWorks });
                          }}
                          className="w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-text-body">
                          <input
                            type="checkbox"
                            checked={work.active !== false}
                            onChange={(e) => {
                              const newWorks = [...content.ourWorks];
                              newWorks[idx].active = e.target.checked;
                              setContent({ ...content, ourWorks: newWorks });
                            }}
                            className="rounded text-surface-forest"
                          />
                          Active on Homepage
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const newWorks = content.ourWorks.filter(
                              (_: any, i: number) => i !== idx
                            );
                            setContent({ ...content, ourWorks: newWorks });
                          }}
                          className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TESTIMONIALS TAB */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-ink">Donor & Educator Testimonials</h2>
                <p className="text-xs text-text-muted">Highlight reviews from alumni, parents, and school bursars.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const tests = content?.testimonials || [];
                  setContent({
                    ...content,
                    testimonials: [
                      ...tests,
                      {
                        authorName: "New Sponsor",
                        companyName: "Alumni Council",
                        reviewText: "Great platform for transparent school hydration.",
                        imageUrl: "/home/user1.webp",
                        active: true,
                        order: tests.length + 1,
                      },
                    ],
                  });
                }}
                className="rounded-full bg-surface-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-surface-forest/90"
              >
                + Add Testimonial
              </button>
            </div>

            <div className="space-y-4">
              {(content?.testimonials || []).map((item: any, idx: number) => (
                <div
                  key={item._id || idx}
                  className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-ink">Author Name</label>
                      <input
                        type="text"
                        value={item.authorName}
                        onChange={(e) => {
                          const newTests = [...content.testimonials];
                          newTests[idx].authorName = e.target.value;
                          setContent({ ...content, testimonials: newTests });
                        }}
                        className="mt-1 w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-ink">Organization / Role</label>
                      <input
                        type="text"
                        value={item.companyName}
                        onChange={(e) => {
                          const newTests = [...content.testimonials];
                          newTests[idx].companyName = e.target.value;
                          setContent({ ...content, testimonials: newTests });
                        }}
                        className="mt-1 w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-ink">Review Text</label>
                    <textarea
                      rows={2}
                      value={item.reviewText}
                      onChange={(e) => {
                        const newTests = [...content.testimonials];
                        newTests[idx].reviewText = e.target.value;
                        setContent({ ...content, testimonials: newTests });
                      }}
                      className="mt-1 w-full rounded-lg border border-border-subtle p-2 text-xs text-text-ink outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-text-body">
                      <input
                        type="checkbox"
                        checked={item.active !== false}
                        onChange={(e) => {
                          const newTests = [...content.testimonials];
                          newTests[idx].active = e.target.checked;
                          setContent({ ...content, testimonials: newTests });
                        }}
                        className="rounded text-surface-forest"
                      />
                      Active on Homepage
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const newTests = content.testimonials.filter(
                          (_: any, i: number) => i !== idx
                        );
                        setContent({ ...content, testimonials: newTests });
                      }}
                      className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CONTACT & SEO TAB */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-text-ink">Global Contact & SEO Metadata</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-ink">Official Phone</label>
                <input
                  type="text"
                  value={content?.contactInfo?.phone ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactInfo: {
                        ...content.contactInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Support Email</label>
                <input
                  type="email"
                  value={content?.contactInfo?.email ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactInfo: {
                        ...content.contactInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-text-ink">Physical Office Address</label>
                <input
                  type="text"
                  value={content?.contactInfo?.location ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactInfo: {
                        ...content.contactInfo,
                        location: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Facebook URL</label>
                <input
                  type="text"
                  value={content?.contactInfo?.facebook ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactInfo: {
                        ...content.contactInfo,
                        facebook: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Instagram URL</label>
                <input
                  type="text"
                  value={content?.contactInfo?.instagram ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactInfo: {
                        ...content.contactInfo,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="pt-6 border-t border-border-subtle space-y-4">
              <h3 className="text-sm font-bold text-text-ink">Global Search Engine Optimization (SEO)</h3>
              <div>
                <label className="text-xs font-semibold text-text-ink">Homepage Meta Title</label>
                <input
                  type="text"
                  value={content?.seo?.metaTitle ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, metaTitle: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Meta Description</label>
                <textarea
                  rows={2}
                  value={content?.seo?.metaDescription ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, metaDescription: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-ink">Meta Keywords</label>
                <input
                  type="text"
                  value={content?.seo?.keywords ?? ""}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      seo: { ...content.seo, keywords: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border-subtle p-2.5 text-xs text-text-ink outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
