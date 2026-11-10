import React from "react";

const DashNavLoading = () => {
  return (
    <header className="z-[90] col-start-2 row-start-1 h-20 border-b border-border-subtle bg-white/85 backdrop-blur-md px-6 sm:px-10 lg:px-12">
      <div className="mx-auto flex h-full w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-8 w-20 rounded-full bg-surface-bento animate-pulse" />
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-8 w-16 rounded-full bg-surface-bento animate-pulse" />
            <div className="h-8 w-18 rounded-full bg-surface-bento animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-surface-bento animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="h-10 w-10 rounded-full bg-surface-bento animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-surface-bento animate-pulse" />
        </div>
      </div>
    </header>
  );
};

export default DashNavLoading;
