import React from "react";
import SharedInfoCardsLoading from "./SharedInfoCardsLoading";
import DataTableLoading from "./DataTableLoading";

/**
 * Shared in-place content skeleton for Admin, Bursar, and Donor dashboards.
 * Keeps the persistent sidebar and top navigation anchored during route changes.
 */
const DashboardPageLoading = () => {
  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="edudrop-shimmer h-7 w-56 rounded-xl" />
          <div className="edudrop-shimmer h-4 w-80 max-w-full rounded-md" />
        </div>
        <div className="edudrop-shimmer h-10 w-36 rounded-full" />
      </div>

      <SharedInfoCardsLoading />
      <DataTableLoading />
    </div>
  );
};

export default DashboardPageLoading;
