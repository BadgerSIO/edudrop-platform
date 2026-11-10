"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Layers,
  AlertTriangle,
  Check,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { ICategory } from "@/app/types/Product";
import { SERVERURLAPI } from "@/lib/constants";
import { slugify } from "@/app/utility/slugify";
import { getCookie } from "@/app/utility/handleCookie";
import { handleRevalidation } from "@/app/utility/handleRevalidation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";

interface CategoryFormData {
  title: string;
  slug: string;
  description: string;
}

export default function CategoryManager({
  initialCategories = [],
}: {
  initialCategories: ICategory[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState(false);

  // Form for Add/Edit
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  const watchTitle = watch("title");
  const [slugLocked, setSlugLocked] = useState(false);

  // Auto-slug sync
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (!slugLocked) {
      setValue("slug", slugify(val));
    }
  };

  const openAddModal = () => {
    reset({
      title: "",
      slug: "",
      description: "",
    });
    setSlugLocked(false);
    setIsAddOpen(true);
  };

  const openEditModal = (cat: ICategory) => {
    setEditingCategory(cat);
    reset({
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
    });
    setSlugLocked(true);
  };

  const closeModals = () => {
    setIsAddOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmitAdd = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      const jwt = await getCookie("jwt");
      const authHeader = jwt ? { Authorization: `Bearer ${jwt}` } : {};

      const payload = {
        title: data.title.trim(),
        slug: data.slug?.trim() || slugify(data.title),
        description: data.description.trim(),
      };

      const res = await axios.post(
        `${SERVERURLAPI}/categories/create`,
        payload,
        { headers: authHeader }
      );

      if (res.status === 200) {
        toast.success("Category created successfully");
        await handleRevalidation("categoryCollections");
        closeModals();
        router.refresh();
      } else {
        toast.error("Failed to create category");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create category";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEdit = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    try {
      setLoading(true);
      const jwt = await getCookie("jwt");
      const authHeader = jwt ? { Authorization: `Bearer ${jwt}` } : {};

      const payload = {
        title: data.title.trim(),
        slug: data.slug?.trim() || slugify(data.title),
        description: data.description.trim(),
      };

      const res = await axios.patch(
        `${SERVERURLAPI}/categories/${editingCategory.slug}`,
        payload,
        { headers: authHeader }
      );

      if (res.status === 200) {
        toast.success("Category updated successfully");
        await handleRevalidation("categoryCollections");
        closeModals();
        router.refresh();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update category";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: ICategory) => {
    const productCount = cat.productCount || 0;
    if (productCount > 0) {
      toast.error(
        `Cannot delete: ${productCount} active products are currently in this category. Reassign or delete those products first.`
      );
      return;
    }

    try {
      const jwt = await getCookie("jwt");
      const authHeader = jwt ? { Authorization: `Bearer ${jwt}` } : {};

      const res = await axios.delete(
        `${SERVERURLAPI}/categories/${cat._id}`,
        { headers: authHeader }
      );

      if (res.status === 200) {
        toast.success("Category deleted");
        await handleRevalidation("categoryCollections");
        router.refresh();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete category";
      toast.error(msg);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return initialCategories;
    const q = searchTerm.toLowerCase();
    return initialCategories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [initialCategories, searchTerm]);

  // Aggregate stats
  const totalCategories = initialCategories.length;
  const totalMappedProducts = initialCategories.reduce(
    (acc, curr) => acc + (curr.productCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
            Product Categories
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Organize hydration products, bulk water supplies, and classroom kits.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-bento hover:bg-surface-forest-light transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-bento flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Configured Categories
            </span>
            <span className="text-xl font-bold text-text-ink block mt-0.5">
              {totalCategories}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-bento flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/20 text-surface-forest">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Total Mapped Products
            </span>
            <span className="text-xl font-bold text-text-ink block mt-0.5">
              {totalMappedProducts} items
            </span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search categories by title, slug, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border-subtle bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-text-ink placeholder:text-text-muted focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10 shadow-sm"
          />
        </div>
      </div>

      {/* Categories Table / Card Grid */}
      <div className="rounded-2xl border border-border-subtle bg-white shadow-bento overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border-subtle bg-surface-bento/30 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5">Slug</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-center">Assigned Items</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/80 text-text-body">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, idx) => {
                  const productCount = cat.productCount || 0;
                  const hasProducts = productCount > 0;

                  return (
                    <tr
                      key={cat._id || idx}
                      className="hover:bg-surface-bento/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-forest/10 text-xs font-bold text-surface-forest">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-text-ink">
                            {cat.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-text-muted bg-surface-bento/50 px-2 py-0.5 rounded-md">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate text-text-muted">
                        {cat.description || "—"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            hasProducts
                              ? "bg-surface-forest/10 text-surface-forest"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Package className="h-3 w-3" />
                          <span>{productCount} {productCount === 1 ? "product" : "products"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-text-muted hover:text-surface-forest hover:bg-surface-bento/60 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {hasProducts ? (
                            <button
                              type="button"
                              onClick={() => {
                                toast.error(
                                  `Category "${cat.title}" has ${productCount} assigned products. Reassign them first before deleting.`
                                );
                              }}
                              className="p-1.5 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-not-allowed"
                              title="Protected: Category contains active products"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <CustomAlertDialouge
                              triggerText={<Trash2 className="h-4 w-4" />}
                              triggerClass="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              alertDescription={`Are you sure you want to delete the category "${cat.title}"?`}
                              onConfirm={() => handleDeleteCategory(cat)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    No categories found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-ink">
              Add New Category
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Create a grouping for related supplies, cases, and dispenser items.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Category Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Bottled Water Cases"
                {...register("title", {
                  required: "Category title is required",
                  onChange: handleTitleChange,
                })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Category Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSlugLocked(!slugLocked)}
                  className="text-[11px] font-medium text-surface-forest hover:underline inline-flex items-center gap-1"
                >
                  {slugLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {slugLocked ? "Locked" : "Auto"}
                </button>
              </div>
              <input
                type="text"
                readOnly={slugLocked}
                placeholder="e.g. bottled-water-cases"
                {...register("slug", { required: "Slug is required" })}
                className={`w-full rounded-xl border border-border-subtle px-4 py-2.5 text-xs font-mono text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10 ${
                  slugLocked ? "bg-surface-bento/50 cursor-not-allowed opacity-80" : "bg-white"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary explaining what products belong in this category..."
                {...register("description", { required: "Description is required" })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow-bento hover:bg-surface-forest-light disabled:opacity-60"
              >
                {loading ? "Saving..." : "Create Category"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && closeModals()}
      >
        <DialogContent className="max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-bento">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text-ink">
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Update category title, slug, and catalog details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Category Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("title", {
                  required: "Category title is required",
                  onChange: handleTitleChange,
                })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Category Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSlugLocked(!slugLocked)}
                  className="text-[11px] font-medium text-surface-forest hover:underline inline-flex items-center gap-1"
                >
                  {slugLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {slugLocked ? "Locked" : "Auto"}
                </button>
              </div>
              <input
                type="text"
                readOnly={slugLocked}
                {...register("slug", { required: "Slug is required" })}
                className={`w-full rounded-xl border border-border-subtle px-4 py-2.5 text-xs font-mono text-text-ink focus:border-surface-forest focus:outline-none focus:ring-2 focus:ring-surface-forest/10 ${
                  slugLocked ? "bg-surface-bento/50 cursor-not-allowed opacity-80" : "bg-white"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                {...register("description", { required: "Description is required" })}
                className="w-full rounded-xl border border-border-subtle bg-surface-bento/20 px-4 py-2.5 text-sm text-text-ink focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/10 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2 text-xs font-semibold text-white shadow-bento hover:bg-surface-forest-light disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
