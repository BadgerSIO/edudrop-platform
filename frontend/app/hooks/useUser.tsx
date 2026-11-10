"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "../utility/handleCookie";
import { handleRevalidation } from "../utility/handleRevalidation";

export default function useUser() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(false);

  const handleUserStatus = async (
    userId: string,
    targetStatus: "active" | "suspended"
  ): Promise<boolean> => {
    setLoadingUser(true);
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/user/${userId}/status`,
        { status: targetStatus },
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (response.status === 200) {
        toast.success(
          targetStatus === "active"
            ? "Account restored to Active"
            : "Account suspended"
        );
        await handleRevalidation("manageUsersCollection");
        await handleRevalidation("userSingleCollection");
        router.refresh();
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update user status";
      toast.error(message);
      return false;
    } finally {
      setLoadingUser(false);
    }
  };

  const handleResetPassword = async (
    userId: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    setLoadingUser(true);
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/user/${userId}/reset-password`,
        { newPassword },
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (response.status === 200) {
        toast.success("User password reset successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset user password";
      toast.error(message);
      return false;
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDeleteUser = async (
    userId: string,
    event?: { stopPropagation: () => void }
  ) => {
    if (event) {
      event.stopPropagation();
    }
    setLoadingUser(true);
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.delete(`${SERVERURLAPI}/user/${userId}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });

      if (response.status === 200) {
        toast.success("User account archived successfully");
        await handleRevalidation("manageUsersCollection");
        router.replace("/dashboard/manage-users");
        router.refresh();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to archive user";
      toast.error(message);
    } finally {
      setLoadingUser(false);
    }
  };

  return {
    handleUserStatus,
    handleResetPassword,
    handleDeleteUser,
    loadingUser,
  };
}
