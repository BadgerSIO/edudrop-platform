import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import toast from "react-hot-toast";
import { handleRevalidation } from "../utility/handleRevalidation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCookie } from "../utility/handleCookie";

const useDonar = () => {
  const [loadingDonar, setLoadingDonar] = useState(false);
  const router = useRouter();

  const handleDonarStatus = async (id: string) => {
    setLoadingDonar(true);
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.patch(
        `${SERVERURLAPI}/donar/status-update/${id}`,
        {},
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );
      if (response.status === 200) {
        toast.success("Info updated");
        await handleRevalidation("getDonars");
        await handleRevalidation("manageUsersCollection");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update");
    } finally {
      setLoadingDonar(false);
    }
  };

  const handleDeleteDonar = async (id: string) => {
    try {
      const jwt = await getCookie("jwt");
      const response = await axios.delete(`${SERVERURLAPI}/donar/${id}`, {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (response.status === 200) {
        await handleRevalidation("donarCollection");
        await handleRevalidation("manageUsersCollection");
        router.push("/dashboard/manage-users");
        toast.success("deleted successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to delete ${error}`);
    }
  };

  return {
    handleDonarStatus,
    handleDeleteDonar,
    loadingDonar,
  };
};

export default useDonar;
