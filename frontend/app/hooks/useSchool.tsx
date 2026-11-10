import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
import { handleRevalidation } from "../utility/handleRevalidation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCookie } from "../utility/handleCookie";

const useSchool = () => {
  const [loadingSchool, setLoadingSchool] = useState(false);
  const router = useRouter();
  const handleSchoolStatus = async (
    slug: string,
    event?: {
      stopPropagation: () => void;
    },
  ): Promise<boolean> => {
    if (event) {
      event.stopPropagation(); // Prevent event propagation
    }
    setLoadingSchool(true);
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/school/status-update/${slug}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (response.status === 200) {
        await handleRevalidation("schoolSinglebyslugCollection");
        await handleRevalidation("schoolCollection");
        await handleRevalidation("schoolInfoCollection");
        router.refresh();
        setLoadingSchool(false);
        toast.success("School status updated");
        return true;
      }
      setLoadingSchool(false);
      return false;
    } catch (error: any) {
      setLoadingSchool(false);
      const message =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status";
      toast.error(message);
      return false;
    }
  };

  const handleDeleteSchool = async (
    id: string,
    event?: {
      stopPropagation: () => void;
    },
  ) => {
    if (event) {
      event.stopPropagation(); // Prevent event propagation
    }
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.delete(`${SERVERURLAPI}/school/${id}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (response.status === 200) {
        await handleRevalidation("schoolCollection");
        router.replace("/dashboard/schools-list");
        router.refresh();
        toast.success("School deleted successfully");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete school";
      toast.error(message);
    }
  };
  return {
    handleSchoolStatus,
    handleDeleteSchool,
    loadingSchool,
  };
};
export default useSchool;
