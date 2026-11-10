"use client";
import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ICategory } from "@/app/types/Product";

interface ProductSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: ICategory[];
  totalCount: number;
  filteredCount: number;
}

export const ProductSearchFilter: React.FC<ProductSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = searchQuery.trim() !== "" || selectedCategory !== "all";

  return (
    <div className="w-full rounded-2xl border border-border-subtle bg-white p-3.5 sm:p-4 shadow-bento space-y-3.5">
      {/* Top Row: Search Input + Result Count & Reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-body" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search water cases, dispensers, sanitizers..."
            aria-label="Search classroom supplies"
            className="w-full rounded-xl border border-border-subtle bg-surface-bento/60 py-2.5 pl-10 pr-9 text-sm text-text-ink placeholder:text-text-body/60 transition-all focus:border-surface-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-surface-forest/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-body hover:bg-surface-bento hover:text-text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs sm:text-sm font-semibold text-text-body">
            Showing <strong className="text-text-ink">{filteredCount}</strong>{" "}
            of {totalCount} classroom supplies
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onSelectCategory("all");
              }}
              className="rounded-lg bg-surface-forest/10 px-3 py-1.5 text-xs font-semibold text-surface-forest transition-colors hover:bg-surface-forest hover:text-white"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Single-Line Segmented Category Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border-subtle/70 pt-3">
        <span className="mr-1.5 hidden items-center gap-1.5 text-xs font-semibold text-text-body md:inline-flex">
          <SlidersHorizontal className="h-3.5 w-3.5 text-surface-forest" />
          Category:
        </span>
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
            selectedCategory === "all"
              ? "bg-surface-forest text-white shadow-sm"
              : "bg-surface-bento/70 text-text-body hover:bg-surface-bento hover:text-text-ink"
          }`}
        >
          All Supplies ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id || cat.slug}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
              selectedCategory === cat.slug
                ? "bg-surface-forest text-white shadow-sm"
                : "bg-surface-bento/70 text-text-body hover:bg-surface-bento hover:text-text-ink"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSearchFilter;
