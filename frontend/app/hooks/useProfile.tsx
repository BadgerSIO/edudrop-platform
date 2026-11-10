"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVERURLAPI } from "@/lib/constants";
import { getCookie } from "../utility/handleCookie";
import { useAuthContext } from "../context/AuthContext";

const extractApiError = (error: any, fallback: string): string => {
  return (
    error?.response?.data?.errorMessage?.[0]?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export default function useProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { fetchUser } = useAuthContext();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const updateProfile = async (
    role: "bursar" | "donar",
    formData: FormData
  ): Promise<boolean> => {
    setIsUpdatingProfile(true);
    try {
      const jwt = await getCookie("jwt");
      if (!jwt) {
        toast.error("Your session has expired. Please sign in again.");
        return false;
      }

      const endpoint =
        role === "bursar"
          ? `${SERVERURLAPI}/bursar/me`
          : `${SERVERURLAPI}/donar/me`;

      const response = await axios.patch(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.status === 200) {
        await fetchUser();
        await queryClient.invalidateQueries({ queryKey: ["school-info"] });
        router.refresh();
        toast.success("Profile updated successfully");
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to update profile"));
      return false;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const changePassword = async (payload: {
    password: string;
    newPassword: string;
  }): Promise<boolean> => {
    setIsChangingPassword(true);
    try {
      const jwt = await getCookie("jwt");
      if (!jwt) {
        toast.error("Your session has expired. Please sign in again.");
        return false;
      }

      const response = await axios.patch(
        `${SERVERURLAPI}/auth/change-password`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Password updated successfully", { duration: 4000 });
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error(extractApiError(error, "Failed to update password"), {
        duration: 4000,
      });
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    updateProfile,
    changePassword,
    isUpdatingProfile,
    isChangingPassword,
  };
}
