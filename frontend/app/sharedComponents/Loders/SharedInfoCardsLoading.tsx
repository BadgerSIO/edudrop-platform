import React from "react";

const SharedInfoCardsLoading = () => {
  return (
    <div
      role="status"
      aria-label="Loading summary metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[140px] rounded-2xl border border-border-subtle bg-white p-5 shadow-bento"
        >
          <div className="flex items-center justify-between">
            <div className="edudrop-shimmer h-4 w-24 rounded-md" />
            <div className="edudrop-shimmer h-10 w-10 rounded-xl" />
          </div>
          <div className="edudrop-shimmer mt-4 h-8 w-20 rounded-lg" />
          <div className="edudrop-shimmer mt-3 h-3.5 w-32 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export default SharedInfoCardsLoading;
