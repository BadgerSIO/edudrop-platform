"use client";
import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SchoolSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  cities: string[];
  totalCount: number;
  filteredCount: number;
}

export const SchoolSearchFilter: React.FC<SchoolSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
  cities,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = searchQuery.trim() !== "" || selectedCity !== "all";

  return (
    <div className="w-full rounded-2xl border border-border-subtle bg-white p-3 sm:p-4 shadow-bento">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search Input */}
        <div className="relative w-full lg:w-[340px] xl:w-[380px] shrink-0">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-body" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by school name, city, or program..."
            aria-label="Search partner schools"
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

        {/* Middle: Segmented Location Filter Pills */}
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold text-text-body xl:inline-flex">
            <SlidersHorizontal className="h-3.5 w-3.5 text-surface-forest" />
            Location:
          </span>
          <button
            type="button"
            onClick={() => onSelectCity("all")}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              selectedCity === "all"
                ? "bg-surface-forest text-white shadow-sm"
                : "bg-surface-bento/70 text-text-body hover:bg-surface-bento hover:text-text-ink"
            }`}
          >
            All Campuses
          </button>
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onSelectCity(city)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
                selectedCity === city
                  ? "bg-surface-forest text-white shadow-sm"
                  : "bg-surface-bento/70 text-text-body hover:bg-surface-bento hover:text-text-ink"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Right: Live Result Count & Reset */}
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle/70 pt-2.5 lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0 shrink-0">
          <span className="text-xs font-semibold text-text-body whitespace-nowrap">
            <strong className="text-text-ink">{filteredCount}</strong> of{" "}
            {totalCount} {totalCount === 1 ? "Campus" : "Campuses"}
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                onSelectCity("all");
              }}
              className="rounded-lg bg-surface-forest/10 px-2.5 py-1 text-xs font-semibold text-surface-forest transition-colors hover:bg-surface-forest hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolSearchFilter;
