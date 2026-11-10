"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Reply,
  CheckCircle2,
  Clock,
  Copy,
  Trash2,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { ISubmissions } from "@/app/types/submission";
import { dateConverter } from "@/app/utility/dateConverter";
import CustomAlertDialouge from "@/app/sharedComponents/CustomAlertDialouge";
import useInbox from "@/app/hooks/useInbox";
import toast from "react-hot-toast";

interface InboxDetailHubProps {
  data: ISubmissions;
  endpoint: "school-inbox" | "submissions";
  basePath: string;
  contextLabel: string;
}

export default function InboxDetailHub({
  data,
  endpoint,
  basePath,
  contextLabel,
}: InboxDetailHubProps) {
  const { toggleSeen, markStatus, deleteMessage, loadingInbox } = useInbox(endpoint);

  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || data.email?.split("@")[0] || "Inquiry";
  const initials =
    (firstName[0] || "") + (lastName[0] || "") ||
    (data.email ? data.email.substring(0, 2).toUpperCase() : "IN");

  const isUnread = !data.seen || data.status === "unread";
  const isReplied = data.status === "replied";

  const handleCopyMessage = () => {
    if (data.message) {
      navigator.clipboard.writeText(data.message);
      toast.success("Message content copied to clipboard!");
    }
  };

  const mailtoHref = `mailto:${data.email}?subject=${encodeURIComponent(
    `Re: ${contextLabel} from ${fullName}`
  )}&body=${encodeURIComponent(
    `\n\n--- Original Inquiry received on ${dateConverter(data.createdAt)} ---\n${data.message || ""}`
  )}`;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-border-subtle bg-white p-6 shadow-bento space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border-subtle/80">
          <div className="flex items-center gap-4">
            <Link
              href={basePath}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-white text-text-muted hover:text-text-ink hover:bg-surface-bento/50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border font-bold text-lg ${
                  isUnread
                    ? "border-surface-forest/30 bg-brand-lime/30 text-surface-forest font-extrabold"
                    : "border-border-subtle bg-surface-bento/40 text-surface-forest"
                }`}
              >
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-ink">
                    {fullName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                    {isReplied ? "Replied" : isUnread ? "Unread Inquiry" : "Read"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {data.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateConverter(data.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Primary Action: Reply via Email */}
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-forest px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-surface-forest-light transition-all"
            >
              <Reply className="h-4 w-4 text-brand-lime" />
              <span>Reply via Email</span>
            </a>

            <CustomAlertDialouge
              triggerText="Archive"
              triggerClass="rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 transition-colors"
              onConfirm={() => deleteMessage(data._id as string, basePath)}
              alertDescription="Are you sure you want to archive this inquiry? It will be safely stored in the archive."
            />
          </div>
        </div>

        {/* Sender Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
              Sender Email
            </span>
            <a
              href={`mailto:${data.email}`}
              className="font-semibold text-sm text-surface-forest hover:underline block mt-1 truncate"
            >
              {data.email}
            </a>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
              Contact Phone
            </span>
            {data.phone ? (
              <a
                href={`tel:${data.phone}`}
                className="font-semibold text-sm text-surface-forest hover:underline block mt-1"
              >
                {data.phone}
              </a>
            ) : (
              <span className="text-sm text-text-muted italic block mt-1">Not provided</span>
            )}
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
              Received Timestamp
            </span>
            <span className="font-semibold text-sm text-text-ink block mt-1">
              {dateConverter(data.createdAt)}
            </span>
          </div>
        </div>

        {/* Message Content Bento Box */}
        <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-surface-forest" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-ink">
                Inquiry Message Body
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-surface-forest transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Text</span>
            </button>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-bento/20 p-6">
            <p className="text-sm leading-relaxed text-text-body whitespace-pre-wrap font-sans">
              {data.message}
            </p>
          </div>
        </div>

        {/* Bottom Workflow Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSeen(data._id as string, data.seen)}
              disabled={loadingInbox}
              className="rounded-xl border border-border-subtle bg-white px-4 py-2 text-xs font-semibold text-text-body hover:bg-surface-bento/50 transition-colors shadow-sm"
            >
              Mark as {isUnread ? "Read" : "Unread"}
            </button>

            {!isReplied && (
              <button
                type="button"
                onClick={() => markStatus(data._id as string, "replied")}
                disabled={loadingInbox}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Mark as Replied
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-mono text-[11px] bg-surface-bento/60 px-2 py-1 rounded-md">
              ID: {data._id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
