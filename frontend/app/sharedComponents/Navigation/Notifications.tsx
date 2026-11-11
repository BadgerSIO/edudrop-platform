"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, X, BellOff } from "lucide-react";
import { useNotificationContext } from "@/app/context/NotificationContext";
import { INotification } from "@/app/types/Notification";
import { dateConverter } from "@/app/utility/dateConverter";
import { useRouter } from "next/navigation";

function formatRelativeTime(dateInput?: string): string {
  if (!dateInput) return "";
  const time = new Date(dateInput).getTime();
  if (Number.isNaN(time)) return "";

  const diffSeconds = Math.floor((Date.now() - time) / 1000);
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateConverter(dateInput);
}

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    notificationLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotificationContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpenNotification = (notification: INotification) => {
    setOpen(false);
    if (!notification.read) {
      void markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `View notifications (${unreadCount} unread)`
              : "View notifications"
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white text-text-body transition-all hover:bg-surface-bento hover:text-text-ink hover:border-surface-forest/30 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-forest"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-brand-lime px-1 text-[10px] font-bold text-surface-forest shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="dropdown-menu-panel z-[999] w-80 sm:w-96 rounded-2xl border border-border-subtle bg-white p-0 shadow-bento overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border-subtle bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-ink">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-lime/40 px-2 py-0.5 text-[10px] font-bold text-surface-forest">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-surface-forest transition-colors hover:bg-surface-bento"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Body */}
        {notificationLoading && notifications.length === 0 ? (
          <div className="space-y-2 p-4">
            <div className="edudrop-shimmer h-12 w-full rounded-xl" />
            <div className="edudrop-shimmer h-12 w-full rounded-xl" />
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea
            className={notifications.length > 4 ? "h-80" : "h-auto"}
          >
            <ul className="divide-y divide-border-subtle/50 p-1.5">
              {notifications.map((notification: INotification) => {
                const isUnread = notification.read === false;
                return (
                  <li
                    key={notification._id}
                    className={`group/noti flex items-start gap-2 rounded-xl transition-colors ${
                      isUnread
                        ? "bg-surface-bento/40 hover:bg-surface-bento/80"
                        : "hover:bg-surface-bento/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notification)}
                      className="flex flex-1 items-start gap-2.5 px-3 py-2.5 text-left min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-surface-forest rounded-xl"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          isUnread
                            ? "bg-brand-lime ring-2 ring-surface-forest/20"
                            : "bg-border-subtle"
                        }`}
                      />
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span
                          className={`text-xs leading-snug line-clamp-2 ${
                            isUnread
                              ? "font-bold text-text-ink"
                              : "font-medium text-text-body"
                          }`}
                        >
                          {notification.message}
                        </span>
                        <span
                          title={dateConverter(notification.createdAt)}
                          className="text-[11px] text-text-muted"
                        >
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-0.5 pr-2 pt-2 shrink-0">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void markAsRead(notification._id);
                          }}
                          title="Mark as read"
                          aria-label="Mark notification as read"
                          className="rounded-lg p-1 text-text-muted transition-colors hover:bg-white hover:text-surface-forest"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void dismissNotification(notification._id);
                        }}
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                        className="rounded-lg p-1 text-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-bento text-text-muted">
              <BellOff className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-ink">
                You&apos;re all caught up
              </p>
              <p className="mt-0.5 text-[11px] text-text-muted">
                No notifications to review right now.
              </p>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
