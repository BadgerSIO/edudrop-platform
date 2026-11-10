"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useNotificationContext } from "@/app/context/NotificationContext";
import { INotification } from "@/app/types/Notification";
import { dateConverter } from "@/app/utility/dateConverter";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";
import { useRouter } from "next/navigation";
const Notifications = () => {
  const { notifications, fetchNotifications } = useNotificationContext();
  const router = useRouter();

  const handleNotification = async (targetnotification: INotification) => {
    try {
      // Make an Axios request to mark the notification as read
      const response = await axios.delete(
        `${SERVERURLAPI}/notification/${targetnotification?._id}`,
      );
      if (response?.status === 200) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }

    if (targetnotification?.link) {
      router.push(targetnotification?.link);
    }
    // Handle any additional actions when clicking on the notification
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="View notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white text-text-body transition-all hover:bg-surface-bento hover:text-text-ink hover:border-surface-forest/30 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-forest"
        >
          <Bell className="h-4.5 w-4.5" />
          {notifications?.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-lime text-[10px] font-bold text-surface-forest shadow-xs">
              {notifications?.length > 9 ? "9+" : notifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      {notifications?.length > 0 ? (
        <DropdownMenuContent align="end" className="z-[999] mt-2 w-80 rounded-2xl border border-border-subtle bg-white p-2 shadow-2xl">
          <ScrollArea
            className={`w-full rounded-md ${
              notifications?.length > 4 ? "h-72" : "h-auto"
            }`}
          >
            <div>
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-ink">
                Notifications ({notifications.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-subtle/80" />

              {notifications.map((notification: INotification) => (
                <DropdownMenuItem
                  key={notification?._id}
                  className="cursor-pointer rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-bento focus:bg-surface-bento"
                  onClick={() => handleNotification(notification)}
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <span
                      className={`mt-1.5 h-2 w-2 min-w-[8px] rounded-full shrink-0 ${
                        notification?.read === false
                          ? "bg-brand-lime ring-2 ring-brand-lime/30"
                          : "bg-border-subtle"
                      }`}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-xs font-bold text-text-ink leading-snug line-clamp-2">
                        {notification?.message}
                      </span>
                      <span className="text-[11px] text-text-body">
                        {dateConverter(notification?.createdAt)}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent align="end" className="z-[999] mt-2 w-64 rounded-2xl border border-border-subtle bg-white p-4 shadow-xl text-center">
          <DropdownMenuLabel className="text-xs font-medium text-text-body">
            No new notifications
          </DropdownMenuLabel>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default Notifications;
