import React from "react";
import { Check } from "lucide-react";

const ORDER_STEPS = ["pending", "processing", "on the way", "received"] as const;

export interface OrderTimelineProps {
  currentStatus?: string;
}

/**
 * Shared 4-stage fulfillment timeline across Admin, Bursar, and Donor order views.
 * Uses compositor-only scaleX() transforms for connecting progress segments.
 */
export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus = "pending",
}) => {
  const stepIndex = ORDER_STEPS.indexOf(
    (currentStatus?.toLowerCase() || "pending") as (typeof ORDER_STEPS)[number]
  );

  return (
    <>
      {/* Desktop / Tablet Timeline */}
      <div className="hidden sm:block px-2">
        <div className="flex items-start w-full">
          {ORDER_STEPS.map((step, idx) => {
            const isPassed = idx <= stepIndex;
            const isCurrent = idx === stepIndex;
            const isLast = idx === ORDER_STEPS.length - 1;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-shrink-0 min-w-[72px]">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 motion-reduce:transition-none ${
                      isCurrent
                        ? "border-surface-forest bg-surface-forest text-white ring-4 ring-surface-forest/15 shadow-sm"
                        : isPassed
                          ? "border-surface-forest bg-surface-forest text-white shadow-sm"
                          : "border-border-subtle bg-white text-text-muted"
                    }`}
                  >
                    {isPassed ? (
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <span className="text-xs font-semibold">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2.5 text-xs font-semibold capitalize whitespace-nowrap transition-colors duration-200 ${
                      isCurrent
                        ? "text-surface-forest font-bold"
                        : isPassed
                          ? "text-text-ink"
                          : "text-text-muted"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {!isLast && (
                  <div className="flex-1 h-1 bg-surface-bento mt-4 mx-2 sm:mx-3 rounded-full overflow-hidden self-start">
                    <div
                      className={`h-full w-full origin-left bg-surface-forest rounded-full transition-transform duration-500 ease-out motion-reduce:transition-none ${
                        idx < stepIndex ? "scale-x-100 progress-fill" : "scale-x-0"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Status Badge */}
      <div className="sm:hidden flex items-center justify-between py-1">
        <span className="text-sm font-medium text-text-body">Current State:</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-forest/20 bg-surface-forest/10 px-3 py-1 text-xs font-semibold text-surface-forest capitalize">
          <span className="h-1.5 w-1.5 rounded-full bg-surface-forest" />
          {currentStatus}
        </span>
      </div>
    </>
  );
};

export default OrderTimeline;
