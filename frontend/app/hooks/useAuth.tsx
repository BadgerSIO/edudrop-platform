import axios from "axios";
import { useAuthContext } from "../context/AuthContext";
import { SERVERURLAPI } from "@/lib/constants";
import { deleteCookie, setCookie } from "../utility/handleCookie";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useRef, type SyntheticEvent } from "react";
const useAuth = () => {
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const { setAuthState } = useAuthContext();
  const signin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(`${SERVERURLAPI}/auth/login`, {
        email,
        password,
      });
      if (response.status === 200) {
        const token = response?.data?.data.accessToken;
        const userData = response?.data?.data.data;
        const maxAge = 60 * 6 * 24;
        await setCookie("jwt", token, maxAge);
        await setCookie("isEdudropUserValid", "true", maxAge);
        await setCookie("edudropUserRole", userData.role, maxAge);
        await deleteCookie("guestEmail");
        setAuthState({
          data: userData,
          error: null,
          loading: true,
        });
        if (pathname !== "/checkout") router.push("/donar-dashboard");
        setAuthState({
          data: userData,
          error: null,
          loading: false,
        });
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
      setAuthState({
        loading: false,
        error: msg,
        data: null,
      });
    }
  };
  const forgetPassword = async ({ email }: { email: string }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(
        `${SERVERURLAPI}/auth/forget-password-user`,
        {
          email,
        },
      );
      if (response.status === 200) {
        setAuthState({
          loading: false,
          error: null,
          data: null,
        });
        toast.success("Check your email", { duration: 5000 });
        if (dialogCloseRef.current) {
          dialogCloseRef.current.click();
        }
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Unable to send password reset";
      toast.error(msg);
      setAuthState({
        loading: false,
        error: msg,
        data: null,
      });
    }
  };
  const resetPassword = async ({
    email,
    token,
    newPassword,
  }: {
    email: string;
    token: string;
    newPassword: string;
  }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(
        `${SERVERURLAPI}/auth/reset-password-user`,
        {
          email,
          token,
          newPassword,
        },
      );
      if (response.status === 200) {
        setAuthState({
          loading: false,
          error: null,
          data: null,
        });
        toast.success("Password successfully reset", { duration: 5000 });
        router.push("/login");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Unable to reset password";
      toast.error(msg);
      setAuthState({
        loading: false,
        error: msg,
        data: null,
      });
    }
  };
  const signinBursar = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(`${SERVERURLAPI}/auth/login-bursar`, {
        email,
        password,
      });
      if (response.status === 200) {
        const token = response?.data?.data.accessToken;
        const userData = response?.data?.data.data;
        const maxAge = 60 * 6 * 24;
        await setCookie("jwt", token, maxAge);
        await setCookie("isEdudropUserValid", "true", maxAge);
        await setCookie("edudropUserRole", userData.role, maxAge);
        await deleteCookie("guestEmail");
        router.push("/bursar-dashboard");
        setAuthState({
          loading: false,
          error: null,
          data: userData,
        });
      }
    } catch (error: any) {
      toast.error(`Invalid credentials`);
      setAuthState({
        loading: false,
        error: error.message,
        data: null,
      });
    }
  };
  const signup = async (data: {
    name: {
      firstName: string;
      lastName: string;
    };
    email: string;
    contactNo: string;
    password: string;
  }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(`${SERVERURLAPI}/auth/signup`, data);
      if (response.status === 200) {
        const token = response?.data?.data.accessToken;
        const userData = response?.data?.data.data;
        const maxAge = 60 * 6 * 24;
        await setCookie("jwt", token, maxAge);
        await setCookie("isEdudropUserValid", "true", maxAge);
        await setCookie("edudropUserRole", userData.role, maxAge);
        await deleteCookie("guestEmail");
        router.push("/donar-dashboard");
        setAuthState({
          loading: false,
          error: null,
          data: userData,
        });
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        let errorMessage = error.response.data.message;
        if (
          errorMessage.includes("duplicate key error collection") &&
          errorMessage.includes("email")
        ) {
          // If it's a duplicate email error, show a user-friendly message
          errorMessage =
            "Email address already in use. Please use a different email address. Or login";
        } else {
          // If it's a different type of error, show the server's error message
          errorMessage = "An error occurred while signing up";
        }
        toast.error(errorMessage);
        setAuthState({
          loading: false,
          error: errorMessage,
          data: null,
        });
      } else {
        // If no specific error message from server, show a generic one
        toast.error(`An error occurred while signing up`);
        setAuthState({
          loading: false,
          error: "An error occurred while signing up",
          data: null,
        });
      }
    }
  };

  const signinAdmin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      const response = await axios.post(`${SERVERURLAPI}/auth/admin-login`, {
        email,
        password,
      });
      if (response.status === 200) {
        const token = response?.data?.data.accessToken;
        const userData = response?.data?.data.data;
        const maxAge = 2 * 24 * 60 * 60;
        await setCookie("jwt", token, maxAge);
        await setCookie("isEdudropUserValid", "true", maxAge);
        await setCookie("edudropUserRole", userData.role, maxAge);
        await deleteCookie("guestEmail");
        setAuthState({
          loading: true,
          error: null,
          data: userData,
        });
        router.push("/dashboard");
        setAuthState({
          data: userData,
          error: null,
          loading: false,
        });
      }
    } catch (error: any) {
      toast.error(`Invalid credentials`);
      setAuthState({
        loading: false,
        error: error?.data?.message,
        data: null,
      });
    }
  };

  // signout -------------------
  const signout = async (
    optionsOrEvent?: { redirectTo?: string } | SyntheticEvent
  ) => {
    setAuthState({
      loading: true,
      error: null,
      data: null,
    });
    try {
      await deleteCookie("jwt");
      await deleteCookie("edudropUserRole");
      await deleteCookie("isEdudropUserValid");
      delete axios.defaults.headers.common["Authorization"];
      const target =
        optionsOrEvent &&
        typeof optionsOrEvent === "object" &&
        "redirectTo" in optionsOrEvent &&
        typeof optionsOrEvent.redirectTo === "string"
          ? optionsOrEvent.redirectTo
          : "/";
      if (target === pathname) {
        router.refresh();
      } else {
        router.push(target);
      }

      setAuthState({
        error: null,
        data: null,
        loading: false,
      });
    } catch (error) {
      setAuthState({
        error: null,
        data: null,
        loading: false,
      });
      toast.error(`Error during signout: ${error}`);
    }
  };

  return {
    signin,
    signup,
    signout,
    signinAdmin,
    signinBursar,
    forgetPassword,
    dialogCloseRef,
    resetPassword,
  };
};

export default useAuth;
