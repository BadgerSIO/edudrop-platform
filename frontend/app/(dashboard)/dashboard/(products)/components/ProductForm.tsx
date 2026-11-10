"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  Package,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Tag,
} from "lucide-react";
import { ICategory, IProduct } from "@/app/types/Product";
import { SERVERURL, SERVERURLAPI } from "@/lib/constants";
import { slugify } from "@/app/utility/slugify";
import { getCookie } from "@/app/utility/handleCookie";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import {
  IMAGE_ACCEPT_ATTR,
  validateImageFile,
} from "@/app/utility/validateImageFile";

interface ProductFormProps {
  categories: ICategory[];
  initialData?: Partial<IProduct>;
  isEdit?: boolean;
  rTag?: string;
}

interface FormValues {
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number | string;
  sale: boolean;
  salePrice?: number | string;
  packagingType: "Single" | "Case";
  quantityPerCase?: number | string;
  refillPrice?: number | string;
  status: "active" | "draft" | "archived";
  sku?: string;
  stockQuantity?: number | string;
  benefits: { value: string }[];
  productDetails: { value: string }[];
  productImage?: string;
}

export default function ProductForm({
  categories,
  initialData,
  isEdit = false,
  rTag = "productsCollection",
}: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [slugLocked, setSlugLocked] = useState(isEdit ? true : false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (initialData?.productImage) {
      return initialData.productImage.startsWith("http")
        ? initialData.productImage
        : `${SERVERURL}${initialData.productImage}`;
    }
    return null;
  });

  // Extract initial category ID
  const initialCategoryId =
    typeof initialData?.category === "object" && initialData.category !== null
      ? (initialData.category as ICategory)._id
      : typeof initialData?.category === "string"
      ? initialData.category
      : categories?.[0]?._id || "";

  const defaultValues: FormValues = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialCategoryId,
    price: initialData?.price ?? "",
    sale: Boolean(initialData?.sale),
    salePrice: initialData?.salePrice ?? "",
    packagingType: initialData?.packagingType || "Single",
    quantityPerCase: initialData?.quantityPerCase ?? "",
    refillPrice: initialData?.refillPrice ?? "",
    status:
      initialData?.status ||
      (initialData?.active === false ? "draft" : "active"),
    sku: initialData?.sku || "",
    stockQuantity: initialData?.stockQuantity ?? 100,
    benefits:
      initialData?.benefits && initialData.benefits.length > 0
        ? initialData.benefits.map((b) => ({ value: b }))
        : [{ value: "" }],
    productDetails:
      initialData?.productDetails && initialData.productDetails.length > 0
        ? initialData.productDetails.map((d) => ({ value: d }))
        : [{ value: "" }],
    productImage: initialData?.productImage || "",
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const watchTitle = watch("title");
  const watchSale = watch("sale");
  const watchPrice = watch("price");
  const watchSalePrice = watch("salePrice");
  const watchPackagingType = watch("packagingType");

  // Dynamic fields for Benefits & Product Details
  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control,
    name: "productDetails",
  });

  // Auto-generate slug when title changes (if unlocked)
  useEffect(() => {
    if (!slugLocked && watchTitle && !isEdit) {
      setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, slugLocked, setValue, isEdit]);

  const handleManualSlugGeneration = () => {
    if (watchTitle) {
      setValue("slug", slugify(watchTitle));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setValue("productImage", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const jwt = await getCookie("jwt");
      const authHeader = jwt ? { Authorization: `Bearer ${jwt}` } : {};

      let finalImageUrl = values.productImage || initialData?.productImage || "";

      // 1. If a new image file was selected, upload it first to the dedicated endpoint
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("productImage", selectedFile);

        const uploadRes = await axios.post(
          `${SERVERURLAPI}/product/upload-image`,
          uploadFormData,
          {
            headers: {
              ...authHeader,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadRes.status === 200 && uploadRes.data?.data?.imageUrl) {
          finalImageUrl = uploadRes.data.data.imageUrl;
        } else {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // 2. Prepare clean, typed payload
      const cleanBenefits = values.benefits
        .map((b) => b.value.trim())
        .filter((b) => b.length > 0);

      const cleanDetails = values.productDetails
        .map((d) => d.value.trim())
        .filter((d) => d.length > 0);

      const payload = {
        title: values.title.trim(),
        slug: values.slug?.trim() || slugify(values.title),
        description: values.description.trim(),
        category: values.category,
        price: Number(values.price),
        sale: Boolean(values.sale),
        salePrice:
          values.sale && values.salePrice !== ""
            ? Number(values.salePrice)
            : undefined,
        packagingType: values.packagingType,
        quantityPerCase:
          values.packagingType === "Case" && values.quantityPerCase !== ""
            ? Number(values.quantityPerCase)
            : undefined,
        refillPrice:
          values.refillPrice !== "" ? Number(values.refillPrice) : undefined,
        status: values.status,
        sku: values.sku?.trim() || undefined,
        stockQuantity:
          values.stockQuantity !== "" ? Number(values.stockQuantity) : 0,
        benefits: cleanBenefits,
        productDetails: cleanDetails,
        productImage: finalImageUrl,
      };

      // 3. Submit to backend API
      let response;
      if (isEdit && initialData?._id) {
        response = await axios.patch(
          `${SERVERURLAPI}/product/${initialData._id}`,
          payload,
          { headers: authHeader }
        );
      } else {
        response = await axios.post(
          `${SERVERURLAPI}/product/create`,
          payload,
          { headers: authHeader }
        );
      }

      if (response.status === 200) {
        toast.success(
          isEdit ? "Product updated successfully" : "Product created successfully"
        );
        await handleRevalidation("productsCollection");
        if (rTag) await handleRevalidation(rTag);
        router.push("/dashboard/product-list");
        router.refresh();
      } else {
        toast.error("Failed to save product. Please check input values.");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while saving the product";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount percentage helper
  const regularPriceNum = Number(watchPrice) || 0;
  const salePriceNum = Number(watchSalePrice) || 0;
  const discountPercent =
    watchSale && regularPriceNum > 0 && salePriceNum < regularPriceNum
      ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100)
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/product-list"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted hover:text-text-ink hover:bg-surface-bento/50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
              {isEdit ? `Edit: ${initialData?.title || "Product"}` : "Add New Product"}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              {isEdit
                ? "Update inventory parameters, pricing, and fulfillment details."
                : "Create a new classroom hydration or supply kit item for donor sponsorship."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/product-list"
            className="rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/50 transition-colors shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-bento hover:bg-surface-forest-light transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{isEdit ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Information (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Basic Information */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle/70">
              <Package className="h-4 w-4 text-surface-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                General Product Information
              </h2>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. 5-Gallon Spring Water Dispenser Bottle"
                {...register("title", { required: "Product title is required" })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Slug & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Slug Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (slugLocked) {
                        setSlugLocked(false);
                      } else {
                        handleManualSlugGeneration();
                        setSlugLocked(true);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-surface-forest hover:underline"
                  >
                    {slugLocked ? (
                      <>
                        <Lock className="h-3 w-3" /> Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3" /> Auto-sync
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono select-none">
                    /products/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    readOnly={slugLocked}
                    {...register("slug", { required: "Slug is required" })}
                    className={`w-full rounded-xl border border-border-subtle pl-24 pr-4 py-3 text-xs font-mono text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all ${
                      slugLocked ? "bg-surface-bento/40 cursor-not-allowed opacity-80" : "bg-white"
                    }`}
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  {...register("category", { required: "Please select a category" })}
                  className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Comprehensive description outlining school benefits, hydration standards, and donor impact..."
                {...register("description", { required: "Description is required" })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all resize-y"
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Pricing & Packaging */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle/70">
              <DollarSign className="h-4 w-4 text-surface-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                Pricing & Supply Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Regular Price */}
              <div>
                <label htmlFor="price" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Regular Price ($ USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                    $
                  </span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price", {
                      required: "Price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                    })}
                    className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 pl-8 pr-4 py-3 text-sm font-semibold text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Refill Price */}
              <div>
                <label htmlFor="refillPrice" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Refill Unit Price ($ USD) <span className="text-text-muted/60 lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                    $
                  </span>
                  <input
                    id="refillPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("refillPrice")}
                    className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 pl-8 pr-4 py-3 text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sale Toggle & Sale Price */}
            <div className="rounded-xl border border-border-subtle bg-surface-bento/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-surface-forest" />
                  <div>
                    <h3 className="text-xs font-bold text-text-ink">Promotional Discount</h3>
                    <p className="text-[11px] text-text-muted">Enable a special sponsorship campaign rate</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("sale")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-surface-forest"></div>
                </label>
              </div>

              {watchSale && (
                <div className="pt-3 border-t border-border-subtle/80 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="salePrice" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                      Discounted Sale Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                        $
                      </span>
                      <input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register("salePrice", {
                          validate: (val) => {
                            if (!watchSale) return true;
                            if (!val || Number(val) <= 0) return "Sale price is required when on sale";
                            if (Number(val) >= regularPriceNum) return "Sale price must be lower than regular price";
                            return true;
                          },
                        })}
                        className="w-full rounded-xl border border-border-subtle bg-white pl-8 pr-4 py-2.5 text-sm font-semibold text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                      />
                    </div>
                    {errors.salePrice && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.salePrice.message}
                      </p>
                    )}
                  </div>

                  {discountPercent !== null && discountPercent > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 px-4 py-3 self-end">
                      <Sparkles className="h-4 w-4 text-surface-forest" />
                      <span className="text-xs font-bold text-surface-forest">
                        {discountPercent}% OFF List Price
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Packaging Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                Packaging Configuration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    watchPackagingType === "Single"
                      ? "border-surface-forest bg-surface-forest/5 ring-1 ring-surface-forest"
                      : "border-border-subtle bg-white hover:bg-surface-bento/30"
                  }`}
                >
                  <input
                    type="radio"
                    value="Single"
                    {...register("packagingType")}
                    className="text-surface-forest focus:ring-surface-forest"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-ink block">Single Unit</span>
                    <span className="text-[11px] text-text-muted">Individual dispenser or standalone unit</span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    watchPackagingType === "Case"
                      ? "border-surface-forest bg-surface-forest/5 ring-1 ring-surface-forest"
                      : "border-border-subtle bg-white hover:bg-surface-bento/30"
                  }`}
                >
                  <input
                    type="radio"
                    value="Case"
                    {...register("packagingType")}
                    className="text-surface-forest focus:ring-surface-forest"
                  />
                  <div>
                    <span className="text-xs font-bold text-text-ink block">Case / Bulk Pack</span>
                    <span className="text-[11px] text-text-muted">Multi-pack bottles or bulk supplies</span>
                  </div>
                </label>
              </div>

              {watchPackagingType === "Case" && (
                <div className="mt-4 pt-4 border-t border-border-subtle/70">
                  <label htmlFor="quantityPerCase" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                    Units Included Per Case <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quantityPerCase"
                    type="number"
                    min="1"
                    placeholder="e.g. 24 bottles per case"
                    {...register("quantityPerCase", {
                      required: "Quantity per case is required for bulk packs",
                      min: { value: 1, message: "Must be at least 1 unit per case" },
                    })}
                    className="w-full sm:w-64 rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                  />
                  {errors.quantityPerCase && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.quantityPerCase.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Dynamic Specifications & Benefits */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle/70">
              <Layers className="h-4 w-4 text-surface-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                Features & Technical Specifications
              </h2>
            </div>

            {/* Benefits Array */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-ink">
                    Classroom & Health Benefits
                  </h3>
                  <p className="text-[11px] text-text-muted">Bullet points highlighted on the public product page</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendBenefit({ value: "" })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-bento/40 px-3 py-1.5 text-xs font-semibold text-surface-forest hover:bg-surface-forest hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Benefit</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-muted w-6 text-center select-none">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. 100% BPA-Free Food Grade Bottle"
                      {...register(`benefits.${index}.value` as const)}
                      className="flex-1 rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-xs sm:text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                    />
                    {benefitFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="p-2 text-text-muted hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Remove benefit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details Array */}
            <div className="pt-5 border-t border-border-subtle/70">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-ink">
                    Technical Specifications
                  </h3>
                  <p className="text-[11px] text-text-muted">Dimensions, capacity, certifications, and materials</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendDetail({ value: "" })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-bento/40 px-3 py-1.5 text-xs font-semibold text-surface-forest hover:bg-surface-forest hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Spec</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {detailFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-muted w-6 text-center select-none">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Volume: 18.9 Litres / 5 Gallons"
                      {...register(`productDetails.${index}.value` as const)}
                      className="flex-1 rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2 text-xs sm:text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                    />
                    {detailFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="p-2 text-text-muted hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Remove specification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media, Publishing, & Inventory (1 Col) */}
        <div className="space-y-8">
          {/* Card: Media Upload */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle/70">
              <Upload className="h-4 w-4 text-surface-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                Product Image
              </h2>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={IMAGE_ACCEPT_ATTR}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl border border-border-subtle bg-surface-bento/20 p-2 overflow-hidden group">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-contain p-2"
                    unoptimized={Boolean(selectedFile)}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] text-text-muted truncate">
                    {selectedFile ? selectedFile.name : "Current image"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-xs font-medium text-text-body hover:bg-surface-bento"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-lg border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-subtle hover:border-surface-forest bg-surface-bento/20 p-8 text-center cursor-pointer transition-colors group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-surface-forest group-hover:scale-105 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="mt-3 text-xs font-bold text-text-ink block">
                  Click to upload product image
                </span>
                <span className="mt-1 text-[11px] text-text-muted block">
                  WebP, PNG, JPEG or SVG (max. 5MB)
                </span>
              </div>
            )}
          </div>

          {/* Card: Publishing Status */}
          <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle/70">
              <Info className="h-4 w-4 text-surface-forest" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-ink">
                Publishing Status
              </h2>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Catalog Visibility
              </label>
              <select
                id="status"
                {...register("status")}
                className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm font-semibold text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="draft">Draft (Hidden from Catalog)</option>
                <option value="archived">Archived (Retired)</option>
              </select>
              <p className="mt-1.5 text-[11px] text-text-muted">
                Active products can be immediately pledged and sponsored by registered donors.
              </p>
            </div>

            {/* SKU & Stock Parameters */}
            <div className="pt-4 border-t border-border-subtle/70 space-y-4">
              <div>
                <label htmlFor="sku" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Inventory SKU <span className="text-text-muted/60 lowercase">(optional)</span>
                </label>
                <input
                  id="sku"
                  type="text"
                  placeholder="e.g. ED-WAT-5GAL-01"
                  {...register("sku")}
                  className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2.5 text-xs font-mono text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                />
              </div>

              <div>
                <label htmlFor="stockQuantity" className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Available Stock Capacity
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  placeholder="100"
                  {...register("stockQuantity")}
                  className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-3.5 py-2.5 text-xs text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
