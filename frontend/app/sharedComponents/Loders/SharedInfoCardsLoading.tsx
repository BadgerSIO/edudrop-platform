import React from "react";

const SharedInfoCardsLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[140px] animate-pulse rounded-2xl border border-border-subtle bg-white p-5 shadow-bento"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-surface-bento" />
            <div className="h-10 w-10 rounded-xl bg-surface-bento" />
          </div>
          <div className="mt-4 h-8 w-20 rounded bg-surface-bento" />
          <div className="mt-3 h-4 w-32 rounded bg-surface-bento" />
        </div>
      ))}
    </div>
  );
};

export default SharedInfoCardsLoading;
