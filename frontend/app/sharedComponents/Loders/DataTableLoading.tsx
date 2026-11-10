import React from "react";

const DataTableLoading = () => {
  return (
    <div
      role="status"
      aria-label="Loading table data"
      className="w-full rounded-3xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento space-y-5"
    >
      {/* Table Toolbar Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="edudrop-shimmer h-10 w-full sm:max-w-xs rounded-xl" />
        <div className="flex items-center gap-2.5">
          <div className="edudrop-shimmer h-9 w-24 rounded-xl" />
          <div className="edudrop-shimmer h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Table Header Bar */}
      <div className="grid grid-cols-12 gap-4 rounded-xl bg-surface-bento/60 px-4 py-3 border border-border-subtle/50">
        <div className="col-span-4 edudrop-shimmer h-3.5 rounded-md" />
        <div className="col-span-3 hidden sm:block edudrop-shimmer h-3.5 rounded-md" />
        <div className="col-span-3 hidden md:block edudrop-shimmer h-3.5 rounded-md" />
        <div className="col-span-8 sm:col-span-2 edudrop-shimmer h-3.5 rounded-md" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border-subtle/60">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="grid grid-cols-12 items-center gap-4 px-2 py-3.5 sm:px-4"
          >
            <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
              <div className="edudrop-shimmer h-10 w-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="edudrop-shimmer h-3.5 w-4/5 rounded-md" />
                <div className="edudrop-shimmer h-2.5 w-3/5 rounded-md" />
              </div>
            </div>
            <div className="col-span-3 hidden sm:block">
              <div className="edudrop-shimmer h-3.5 w-3/4 rounded-md" />
            </div>
            <div className="col-span-3 hidden md:block">
              <div className="edudrop-shimmer h-6 w-20 rounded-full" />
            </div>
            <div className="col-span-6 sm:col-span-2 flex justify-end gap-2">
              <div className="edudrop-shimmer h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTableLoading;
