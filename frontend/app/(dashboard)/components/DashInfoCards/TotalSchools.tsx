import React from "react";
import { School } from "lucide-react";

const TotalSchools = ({ schoolCount = 0 }: { schoolCount?: number }) => {
  return (
    <div
      style={{ "--dash-delay": "150ms" } as React.CSSProperties}
      className="dash-card-enter group h-full flex flex-col justify-between rounded-2xl border border-border-subtle bg-white p-5 sm:p-6 shadow-bento transition-all duration-300 hover:shadow-bento-hover hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Partner Schools
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-forest/10 text-surface-forest transition-transform duration-200 group-hover:scale-105">
          <School className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-ink">
          {schoolCount}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-bento px-2 py-0.5 text-[11px] font-semibold text-text-body">
            Institutions
          </span>
          <span>registered learning centers</span>
        </div>
      </div>
    </div>
  );
};

export default TotalSchools;
