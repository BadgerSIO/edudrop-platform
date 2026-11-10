import React from "react";

const CardFullLoading = () => {
  return (
    <div
      role="status"
      aria-label="Loading details"
      className="w-full rounded-3xl border border-border-subtle bg-white p-6 sm:p-8 shadow-bento space-y-8"
    >
      {/* Header Profile / Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border-subtle/70 pb-6">
        <div className="edudrop-shimmer h-16 w-16 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2.5">
          <div className="edudrop-shimmer h-5 w-48 rounded-lg" />
          <div className="edudrop-shimmer h-3.5 w-72 max-w-full rounded-md" />
        </div>
        <div className="edudrop-shimmer h-9 w-28 rounded-full" />
      </div>

      {/* 2-Column Form / Information Fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((field) => (
          <div key={field} className="space-y-2">
            <div className="edudrop-shimmer h-3 w-24 rounded-md" />
            <div className="edudrop-shimmer h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Footer Action Row */}
      <div className="flex items-center justify-end gap-3 border-t border-border-subtle/70 pt-5">
        <div className="edudrop-shimmer h-10 w-32 rounded-full" />
      </div>
    </div>
  );
};

export default CardFullLoading;
