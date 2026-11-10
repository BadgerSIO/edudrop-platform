"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures forward, non-hash App Router navigations snap cleanly to the top
 * of the viewport even when the user previously scrolled less than the sticky
 * header height (where Next.js's segment rect check treats the child as already
 * visible and skips resetting `scrollTop`). Preserves browser Back/Forward
 * scroll restoration via `popstate` tracking and honors hash targets.
 */
export default function RouteScrollReset() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const popStateAtRef = useRef(0);

  useEffect(() => {
    const handlePopState = () => {
      popStateAtRef.current = Date.now();
    };

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a[href]")) {
        popStateAtRef.current = 0;
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick, true);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const isPopState =
      popStateAtRef.current > 0 && Date.now() - popStateAtRef.current < 1000;
    popStateAtRef.current = 0;

    if (isPopState || window.location.hash) {
      return;
    }

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
