"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim top-edge progress bar providing calm, immediate feedback during App Router navigations.
 */
export const RouteProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() || "";

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  const clearTimers = () => {
    if (trickleTimerRef.current) {
      clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  };

  const finishProgress = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    setProgress(1);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  const startProgress = () => {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setProgress(0.22);

    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.86) return prev;
        const step = Math.max(0.02, (0.88 - prev) * 0.18);
        return Math.min(0.86, prev + step);
      });
    }, 180);

    // Prevent bar from staying visible if a navigation is aborted
    failsafeTimerRef.current = setTimeout(() => {
      finishProgress();
    }, 8000);
  };

  // Complete progress whenever route path or query changes
  useEffect(() => {
    finishProgress();
  }, [pathname, searchKey]);

  // Listen for internal link clicks in capture phase
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (nextUrl.origin !== currentUrl.origin) return;
        if (
          nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search
        ) {
          return;
        }

        startProgress();
      } catch {
        // Ignore malformed hrefs
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-[2.5px] overflow-hidden"
    >
      <div
        className="h-full w-full origin-left bg-brand-lime shadow-[0_0_8px_rgba(158,240,26,0.7)] transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

export default RouteProgressBar;
