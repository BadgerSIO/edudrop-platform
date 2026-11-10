"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "../utility/handleCookie";
import { handleRevalidation } from "../utility/handleRevalidation";
import { emitInboxUpdated, markInboxDirty } from "../utility/inboxSync";

export default function useInbox(endpoint: "school-inbox" | "submissions" = "submissions") {
  const router = useRouter();
  const [loadingInbox, setLoadingInbox] = useState(false);

  const revalidateTags = async () => {
    markInboxDirty(endpoint);
    emitInboxUpdated(endpoint);
    await handleRevalidation("schoolSingleInbox");
    await handleRevalidation("singleSubmission");
    await handleRevalidation("SubmissionDataCollection");
    await handleRevalidation("bursarInboxCollection");
    await handleRevalidation("getInbox");
    router.refresh();
  };

  const toggleSeen = async (
    id: string,
    currentSeen?: boolean,
    event?: { stopPropagation: () => void }
  ) => {
    if (event) {
      event.stopPropagation();
    }
    const nextSeen = !currentSeen;
    const nextStatus = nextSeen ? "read" : "unread";

    setLoadingInbox(true);
    try {
      const jwt = await getCookie("jwt");
      const res = await axios.patch(
        `${SERVERURLAPI}/${endpoint}/${id}`,
        { seen: nextSeen, status: nextStatus },
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (res.status === 200) {
        toast.success(`Message marked as ${nextSeen ? "Read" : "Unread"}`);
        await revalidateTags();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update message status");
    } finally {
      setLoadingInbox(false);
    }
  };

  const markStatus = async (
    id: string,
    status: "unread" | "read" | "replied",
    event?: { stopPropagation: () => void }
  ) => {
    if (event) {
      event.stopPropagation();
    }
    const seen = status !== "unread";

    setLoadingInbox(true);
    try {
      const jwt = await getCookie("jwt");
      const res = await axios.patch(
        `${SERVERURLAPI}/${endpoint}/${id}`,
        { status, seen },
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (res.status === 200) {
        toast.success(`Marked as ${status}`);
        await revalidateTags();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingInbox(false);
    }
  };

  const deleteMessage = async (
    id: string,
    redirectUrl?: string,
    event?: { stopPropagation: () => void }
  ) => {
    if (event) {
      event.stopPropagation();
    }
    setLoadingInbox(true);
    try {
      const jwt = await getCookie("jwt");
      const res = await axios.delete(`${SERVERURLAPI}/${endpoint}/${id}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });

      if (res.status === 200) {
        toast.success("Message archived successfully");
        await revalidateTags();
        if (redirectUrl) {
          router.replace(redirectUrl);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to archive message");
    } finally {
      setLoadingInbox(false);
    }
  };

  return {
    toggleSeen,
    markStatus,
    deleteMessage,
    loadingInbox,
  };
}
