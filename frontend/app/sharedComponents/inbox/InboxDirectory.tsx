"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Inbox,
  Mail,
  Phone,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ISubmissions } from "@/app/types/submission";
import Link from "next/link";
import useInbox from "@/app/hooks/useInbox";
import { dateConverter } from "@/app/utility/dateConverter";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import { DataTable } from "@/app/sharedComponents/Table/data-table";

interface InboxDirectoryProps {
  initialData: ISubmissions[];
  kpis?: {
    total: number;
    unreadCount: number;
    repliedCount: number;
  };
  endpoint: "school-inbox" | "submissions";
  basePath: string;
  title: string;
  description: string;
}

export default function InboxDirectory({
  initialData = [],
  kpis,
  endpoint,
  basePath,
  title,
  description,
}: InboxDirectoryProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { toggleSeen, markStatus, deleteMessage, loadingInbox } = useInbox(endpoint);

  const total = kpis?.total ?? initialData.length;
  const unreadCount =
    kpis?.unreadCount ??
    initialData.filter((m) => !m.seen || m.status === "unread").length;
  const repliedCount =
    kpis?.repliedCount ??
    initialData.filter((m) => m.status === "replied").length;

  const filteredData = initialData.filter((item) => {
    if (selectedFilter === "unread") {
      return !item.seen || item.status === "unread";
    }
    if (selectedFilter === "replied") {
      return item.status === "replied";
    }
    return true;
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider text-text-muted"
          >
            Sender & Contact
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const item = row.original;
        const firstName = item.firstName || "";
        const lastName = item.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim() || item.email?.split("@")[0] || "Inquiry";
        const initials =
          (firstName[0] || "") + (lastName[0] || "") ||
          (item.email ? item.email.substring(0, 2).toUpperCase() : "IN");

        const isUnread = !item.seen || item.status === "unread";

        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border font-bold text-xs ${
                isUnread
                  ? "border-surface-forest/30 bg-brand-lime/30 text-surface-forest font-extrabold"
                  : "border-border-subtle bg-surface-bento/40 text-text-muted"
              }`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <Link
                href={`${basePath}/${item._id}`}
                className={`text-sm hover:text-surface-forest transition-colors block truncate ${
                  isUnread ? "font-bold text-text-ink" : "font-medium text-text-body"
                }`}
              >
                {fullName}
              </Link>
              <span className="font-mono text-[11px] text-text-muted truncate block">
                {item.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: () => (
        <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
          Phone
        </span>
      ),
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (!phone) {
          return <span className="text-xs text-text-muted">—</span>;
        }
        return (
          <a
            href={`tel:${phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-text-body hover:text-surface-forest transition-colors"
          >
            <Phone className="h-3 w-3 text-text-muted" />
            <span>{phone}</span>
          </a>
        );
      },
    },
    {
      accessorKey: "message",
      header: () => (
        <span className="font-bold text-xs uppercase tracking-wider text-text-muted">
          Inquiry Message
        </span>
      ),
      cell: ({ row }) => {
        const message = row.original.message || "";
        return (
          <div className="max-w-[280px] lg:max-w-[360px] truncate text-xs text-text-muted font-normal">
            {message}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider text-text-muted"
          >
            Received
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="text-xs text-text-muted">
            {dateConverter(row.getValue("createdAt"))}
          </span>
        );
      },
    },
    {
      accessorKey: "seen",
      header: () => (
        <span className="font-bold text-xs uppercase tracking-wider text-text-muted text-center block">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isUnread = !item.seen || item.status === "unread";
        const isReplied = item.status === "replied";

        return (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => toggleSeen(item._id as string, item.seen)}
              disabled={loadingInbox}
              title="Click to toggle read status"
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
                isReplied
                  ? "border border-blue-200 bg-blue-50 text-blue-700"
                  : isUnread
                  ? "border border-amber-200 bg-amber-50 text-amber-700 font-bold"
                  : "border border-surface-forest/20 bg-surface-forest/10 text-surface-forest"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isReplied
                    ? "bg-blue-600"
                    : isUnread
                    ? "bg-amber-500 animate-pulse"
                    : "bg-surface-forest"
                }`}
              />
              <span>{isReplied ? "Replied" : isUnread ? "Unread" : "Read"}</span>
            </button>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        const isUnread = !item.seen || item.status === "unread";

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-text-muted hover:text-text-ink rounded-lg"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white border border-border-subtle shadow-bento rounded-xl p-1.5 space-y-1"
              >
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50">
                  <Link href={`${basePath}/${item._id}`}>
                    Read Full Inquiry
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50">
                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent(
                      `Re: EduDrop Inquiry from ${item.firstName || "Visitor"}`
                    )}`}
                    className="flex items-center justify-between"
                  >
                    <span>Reply via Email</span>
                    <Reply className="h-3 w-3 text-text-muted" />
                  </a>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-medium text-text-ink hover:bg-surface-bento/50"
                  onSelect={() => toggleSeen(item._id as string, item.seen)}
                >
                  Mark as {isUnread ? "Read" : "Unread"}
                </DropdownMenuItem>

                <div className="my-1 border-t border-border-subtle/80" />

                <div className="px-1 py-0.5">
                  <CustomAlertDialouge
                    triggerText="Archive Message"
                    onConfirm={() => deleteMessage(item._id as string)}
                    alertDescription="This will safely archive the message inquiry. It can be accessed in audit records."
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-ink flex items-center gap-2">
            <Inbox className="h-6 w-6 text-surface-forest" />
            {title}
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            {description}
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Inquiries */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Total Inquiries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-bento/60 text-surface-forest">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-text-ink">
              {total}
            </span>
            <span className="text-xs text-text-muted">received</span>
          </div>
        </div>

        {/* KPI 2: Unread Messages */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Pending / Unread
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime/20 text-surface-forest">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-surface-forest">
              {unreadCount}
            </span>
            <span className="text-xs text-text-muted">needs review</span>
          </div>
        </div>

        {/* KPI 3: Replied Messages */}
        <div className="rounded-2xl border border-border-subtle bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Replied & Resolved
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700">
              {repliedCount}
            </span>
            <span className="text-xs text-text-muted">responded</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
            selectedFilter === "all"
              ? "bg-surface-forest text-white"
              : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
          }`}
        >
          <span>All Inquiries</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedFilter === "all"
                ? "bg-white/20 text-white"
                : "bg-surface-bento text-text-muted"
            }`}
          >
            {total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("unread")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
            selectedFilter === "unread"
              ? "bg-surface-forest text-white"
              : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Unread Inquiries</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedFilter === "unread"
                ? "bg-white/20 text-white"
                : "bg-surface-bento text-text-muted"
            }`}
          >
            {unreadCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("replied")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
            selectedFilter === "replied"
              ? "bg-surface-forest text-white"
              : "bg-white border border-border-subtle text-text-muted hover:text-text-ink hover:bg-surface-bento/40"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Replied</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedFilter === "replied"
                ? "bg-white/20 text-white"
                : "bg-surface-bento text-text-muted"
            }`}
          >
            {repliedCount}
          </span>
        </button>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border-subtle bg-white shadow-bento overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData as any}
          searchPlaceholder="Search inquiries by sender, email, phone, message content..."
        />
      </div>
    </div>
  );
}
