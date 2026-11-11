"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { SERVERURLAPI } from "@/lib/constants";
import { INotification } from "../types/Notification";
import { useAuthContext } from "./AuthContext";
import { getCookie } from "../utility/handleCookie";

export const NOTIFICATIONS_UPDATED_EVENT = "edudrop:notifications-updated";

export function emitNotificationsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

interface NotificationContextState {
  notifications: INotification[];
  unreadCount: number;
  notificationLoading: boolean;
  error: string | null;
}

interface NotificationContextProps {
  children: ReactNode;
}

interface NotificationContextValue extends NotificationContextState {
  setNotificationState: Dispatch<SetStateAction<NotificationContextState>>;
  fetchNotifications: (options?: { silent?: boolean }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
}

const POLL_INTERVAL_MS = 60_000;

export const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  notificationLoading: false,
  error: null,
  setNotificationState: () => {},
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  dismissNotification: async () => {},
});

const NotificationContextProvider = ({
  children,
}: NotificationContextProps) => {
  const { data } = useAuthContext();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string>(pathname);

  const [notificationState, setNotificationState] =
    useState<NotificationContextState>({
      notifications: [],
      unreadCount: 0,
      notificationLoading: false,
      error: null,
    });

  const fetchNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      const jwt = await getCookie("jwt");
      if (!jwt) {
        setNotificationState({
          notifications: [],
          unreadCount: 0,
          notificationLoading: false,
          error: null,
        });
        return;
      }

      if (!options?.silent) {
        setNotificationState((prev) => ({
          ...prev,
          notificationLoading: prev.notifications.length === 0,
          error: null,
        }));
      }

      try {
        const res = await fetch(`${SERVERURLAPI}/notification/by-user`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }

        const json = await res.json();
        const items: INotification[] = Array.isArray(json?.data) ? json.data : [];
        const serverUnread = json?.additionalData?.unreadCount;
        const unreadCount =
          typeof serverUnread === "number"
            ? serverUnread
            : items.filter((n) => n.read === false).length;

        setNotificationState({
          notifications: items,
          unreadCount,
          notificationLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotificationState((prev) => ({
          ...prev,
          notificationLoading: false,
          error: "Error fetching notifications",
        }));
      }
    },
    []
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!notificationId) return;

      let wasUnread = false;
      setNotificationState((prev) => {
        const target = prev.notifications.find((n) => n._id === notificationId);
        if (!target || target.read) return prev;
        wasUnread = true;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n._id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        };
      });

      if (!wasUnread) return;

      try {
        const jwt = await getCookie("jwt");
        if (!jwt) return;
        const res = await fetch(
          `${SERVERURLAPI}/notification/${notificationId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ read: true }),
            keepalive: true,
          }
        );
        if (!res.ok) {
          await fetchNotifications({ silent: true });
        }
      } catch {
        await fetchNotifications({ silent: true });
      }
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    setNotificationState((prev) => {
      if (prev.unreadCount === 0) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    });

    try {
      const jwt = await getCookie("jwt");
      if (!jwt) return;
      const res = await fetch(`${SERVERURLAPI}/notification/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!res.ok) {
        await fetchNotifications({ silent: true });
      }
    } catch {
      await fetchNotifications({ silent: true });
    }
  }, [fetchNotifications]);

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      if (!notificationId) return;

      setNotificationState((prev) => {
        const target = prev.notifications.find((n) => n._id === notificationId);
        const decrement = target && !target.read ? 1 : 0;
        return {
          ...prev,
          notifications: prev.notifications.filter(
            (n) => n._id !== notificationId
          ),
          unreadCount: Math.max(0, prev.unreadCount - decrement),
        };
      });

      try {
        const jwt = await getCookie("jwt");
        if (!jwt) return;
        const res = await fetch(
          `${SERVERURLAPI}/notification/${notificationId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        if (!res.ok) {
          await fetchNotifications({ silent: true });
        }
      } catch {
        await fetchNotifications({ silent: true });
      }
    },
    [fetchNotifications]
  );

  // Initial load when authenticated user resolves
  useEffect(() => {
    if (data?.email) {
      fetchNotifications();
    }
  }, [data?.email, fetchNotifications]);

  // Refresh quietly on route navigation
  useEffect(() => {
    if (!data?.email) return;
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      fetchNotifications({ silent: true });
    }
  }, [pathname, data?.email, fetchNotifications]);

  // Sync on tab focus, visibility restoration, custom events, and 60s active-tab polling
  useEffect(() => {
    if (!data?.email) return;

    const handleSync = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications({ silent: true });
      }
    };

    const handleCustomUpdate = () => {
      fetchNotifications({ silent: true });
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleCustomUpdate);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications({ silent: true });
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        handleCustomUpdate
      );
      window.clearInterval(intervalId);
    };
  }, [data?.email, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        ...notificationState,
        setNotificationState,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;

export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationContextProvider"
    );
  }
  return context;
};
