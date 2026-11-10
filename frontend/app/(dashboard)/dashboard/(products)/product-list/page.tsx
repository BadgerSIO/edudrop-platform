import React from "react";
import Link from "next/link";
import { Plus, Package, Layers, CheckCircle2 } from "lucide-react";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import { columns } from "./components/columns";
import { SERVERURLAPI } from "@/lib/constants";
import { IProduct } from "@/app/types/Product";

export const metadata = {
  title: "Product Inventory | Admin Dashboard",
  description: "Manage classroom supplies, bottled water inventory, and fulfillment kits.",
};

async function getProducts() {
  try {
    const res = await fetch(`${SERVERURLAPI}/product`, {
      next: { tags: ["productsCollection"] },
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [] };
    }
    return res.json();
  } catch (error) {
    return { data: [] };
  }
}

const ProductList = async () => {
  const data = await getProducts();
  const products: IProduct[] = data?.data || [];

  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => p.status === "active" || (p.active && p.status !== "draft" && p.status !== "archived")
  ).length;
  const casePackages = products.filter((p) => p.packagingType === "Case").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
            Product Inventory & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Monitor classroom supplies, update pricing, and toggle catalog visibility.
          </p>
        </div>

        <Link
          href="/dashboard/add-new-product"
          className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-bento hover:bg-surface-forest-light transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-bento flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Total Catalog Items
            </span>
            <span className="text-xl font-bold text-text-ink block mt-0.5">
              {totalProducts}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-bento flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/20 text-surface-forest">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Active in Store
            </span>
            <span className="text-xl font-bold text-text-ink block mt-0.5">
              {activeProducts}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-bento flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-bento text-text-body">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
              Bulk Case Formats
            </span>
            <span className="text-xl font-bold text-text-ink block mt-0.5">
              {casePackages}
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border-subtle bg-white shadow-bento overflow-hidden">
        <DataTable
          columns={columns}
          data={products}
          searchPlaceholder="Search products by title or slug..."
        />
      </div>
    </div>
  );
};

export default ProductList;
