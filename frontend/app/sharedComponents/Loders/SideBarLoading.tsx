import React from "react";

const SideBarLoading = () => {
  return (
    <aside className="relative z-30 col-start-1 row-span-3 w-[72px] min-w-[72px] max-w-[72px] lg:w-[260px] lg:min-w-[260px] lg:max-w-[260px] shrink-0 border-r border-border-subtle bg-white">
      <div className="sticky top-0 flex min-h-screen flex-col justify-between p-3 lg:p-4">
        <div className="space-y-6">
          <div className="flex flex-col items-center lg:items-start px-1 pt-2">
            <div className="h-8 w-20 rounded bg-surface-bento animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full rounded-xl bg-surface-bento animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBarLoading;
