import React from "react";

const CommonLoader = () => {
  return (
    <section
      role="status"
      aria-label="Loading section content"
      className="bg-surface-canvas py-14 sm:py-20"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 space-y-10">
        {/* Section Header Skeleton */}
        <div className="flex flex-col gap-3 max-w-xl">
          <div className="edudrop-shimmer h-6 w-36 rounded-full" />
          <div className="edudrop-shimmer h-9 w-80 max-w-full rounded-xl" />
          <div className="edudrop-shimmer h-4 w-full max-w-md rounded-md" />
        </div>

        {/* Responsive 3-Column Bento Card Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento space-y-4"
            >
              <div className="edudrop-shimmer aspect-[4/3] w-full rounded-2xl" />
              <div className="space-y-2.5">
                <div className="edudrop-shimmer h-3.5 w-28 rounded-full" />
                <div className="edudrop-shimmer h-5 w-4/5 rounded-lg" />
                <div className="edudrop-shimmer h-3.5 w-full rounded-md" />
              </div>
              <div className="flex items-center justify-between border-t border-border-subtle/70 pt-4">
                <div className="edudrop-shimmer h-6 w-20 rounded-lg" />
                <div className="edudrop-shimmer h-9 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommonLoader;
