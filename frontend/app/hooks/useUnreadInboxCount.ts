"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "../utility/handleCookie";
import {
  INBOX_UPDATED_EVENT,
  InboxEndpoint,
} from "../utility/inboxSync";

export default function useUnreadInboxCount(
  endpoint: InboxEndpoint,
  initialCount: number,
  enabled: boolean = true
): number {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(initialCount);
  const prevPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    setUnreadCount(initialCount);
  }, [initialCount]);

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled) return;
    try {
      const jwt = await getCookie("jwt");
      if (!jwt) return;

      const res = await fetch(`${SERVERURLAPI}/${endpoint}/unread-count`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        cache: "no-store",
      });

      if (!res.ok) return;
      const json = await res.json();
      const nextCount = json?.data?.unreadCount;
      if (typeof nextCount === "number") {
        setUnreadCount(nextCount);
      }
    } catch {
      // Non-critical sidebar badge sync failure should stay silent
    }
  }, [endpoint, enabled]);

  // Listen for explicit inbox updates & browser back/forward navigation
  useEffect(() => {
    if (!enabled) return;

    const handleInboxUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        endpoint?: InboxEndpoint;
        unreadCount?: number;
      }>;
      if (customEvent.detail?.endpoint && customEvent.detail.endpoint !== endpoint) {
        return;
      }
      if (typeof customEvent.detail?.unreadCount === "number") {
        setUnreadCount(customEvent.detail.unreadCount);
      } else {
        refreshUnreadCount();
      }
    };

    const handlePopState = () => {
      refreshUnreadCount();
    };

    window.addEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [endpoint, enabled, refreshUnreadCount]);

  // Re-sync unread count on client route transitions (e.g. entering/leaving inbox messages)
  useEffect(() => {
    if (!enabled) return;
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      refreshUnreadCount();
    }
  }, [pathname, enabled, refreshUnreadCount]);

  return unreadCount;
}
