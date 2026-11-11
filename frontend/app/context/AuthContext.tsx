"use client";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { deleteCookie, getCookie, setCookie } from "../utility/handleCookie";
import { handleRevalidation } from "../utility/handleRevalidation";
import { IUser } from "../types/User";

const OWNER_TOKEN_COOKIE = "edudropOwnerToken";
const OWNER_TOKEN_HEADER = "x-edudrop-owner-token";

export interface DemoStatus {
  demoMode: boolean;
  ownerBypassActive: boolean;
  ownerUnlockConfigured: boolean;
  resetIntervalMinutes: number;
}

interface State {
  loading: boolean;
  error: string | null;
  data: IUser | null;
}

interface AuthState extends State {
  setAuthState: Dispatch<SetStateAction<State>>;
  fetchUser: () => Promise<void>;
  demoStatus: DemoStatus | null;
  unlockOwnerMode: (passkey: string) => Promise<boolean>;
  lockOwnerMode: () => Promise<void>;
  resetDemoDatabase: () => Promise<boolean>;
}

export const AuthenticationContext = createContext<AuthState>({
  loading: false,
  error: null,
  data: null,
  fetchUser: async () => {},
  setAuthState: () => {},
  demoStatus: null,
  unlockOwnerMode: async () => false,
  lockOwnerMode: async () => {},
  resetDemoDatabase: async () => false,
});

const AuthContext = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<State>({
    loading: true,
    error: null,
    data: null,
  });
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);

  const syncDemoStatus = useCallback(async (explicitToken?: string) => {
    try {
      const token =
        explicitToken !== undefined
          ? explicitToken
          : await getCookie(OWNER_TOKEN_COOKIE);

      if (token) {
        axios.defaults.headers.common[OWNER_TOKEN_HEADER] = token;
      } else {
        delete axios.defaults.headers.common[OWNER_TOKEN_HEADER];
      }

      const res = await axios.get(`${SERVERURLAPI}/auth/demo-status`, {
        headers: token ? { [OWNER_TOKEN_HEADER]: token } : {},
      });

      const statusData: DemoStatus | undefined = res.data?.data;
      if (statusData) {
        if (token && !statusData.ownerBypassActive) {
          delete axios.defaults.headers.common[OWNER_TOKEN_HEADER];
          await deleteCookie(OWNER_TOKEN_COOKIE);
        }
        setDemoStatus(statusData);
      }
    } catch {
      // Non-fatal: keep existing demoStatus if status probe fails
    }
  }, []);

  const fetchUser = useCallback(async () => {
    setAuthState((prev) => {
      const nextLoading = prev.data === null;
      if (prev.loading === nextLoading && prev.error === null) {
        return prev;
      }
      return {
        ...prev,
        loading: nextLoading,
        error: null,
      };
    });

    await syncDemoStatus();

    try {
      const jwt = await getCookie("jwt");
      if (!jwt) {
        delete axios.defaults.headers.common["Authorization"];
        return setAuthState({
          loading: false,
          error: null,
          data: null,
        });
      }

      const response = await axios.get(`${SERVERURLAPI}/auth`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

      if (response.status === 200) {
        setAuthState({
          data: response.data?.data?.data,
          error: null,
          loading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        typeof error === "string" ? error : "An error occurred";
      await deleteCookie("jwt");
      await deleteCookie("edudropUserRole");
      await deleteCookie("isEdudropUserValid");
      delete axios.defaults.headers.common["Authorization"];
      setAuthState({
        loading: false,
        error: errorMessage,
        data: null,
      });
    }
  }, [syncDemoStatus]);

  const unlockOwnerMode = useCallback(
    async (passkey: string): Promise<boolean> => {
      try {
        const res = await axios.post(`${SERVERURLAPI}/auth/owner-unlock`, {
          passkey,
        });
        const token = res.data?.data?.ownerBypassToken as string | undefined;
        const expiresIn =
          Number(res.data?.data?.expiresInSeconds) || 4 * 60 * 60;

        if (!token) {
          toast.error("Failed to unlock Owner Mode");
          return false;
        }

        await setCookie(OWNER_TOKEN_COOKIE, token, expiresIn);
        axios.defaults.headers.common[OWNER_TOKEN_HEADER] = token;
        await syncDemoStatus(token);
        toast.success("Owner Mode unlocked for this browser session");
        return true;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Invalid owner passkey";
        toast.error(message);
        return false;
      }
    },
    [syncDemoStatus]
  );

  const lockOwnerMode = useCallback(async () => {
    await deleteCookie(OWNER_TOKEN_COOKIE);
    delete axios.defaults.headers.common[OWNER_TOKEN_HEADER];
    setDemoStatus((prev) =>
      prev ? { ...prev, ownerBypassActive: false } : prev
    );
    toast.success("Demo Mode protections restored");
  }, []);

  const resetDemoDatabase = useCallback(async (): Promise<boolean> => {
    try {
      const ownerToken = await getCookie(OWNER_TOKEN_COOKIE);
      const jwt = await getCookie("jwt");
      const res = await axios.post(
        `${SERVERURLAPI}/auth/demo-reset`,
        {},
        {
          headers: {
            ...(ownerToken ? { [OWNER_TOKEN_HEADER]: ownerToken } : {}),
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          },
        }
      );

      if (res.status === 200) {
        await Promise.all([
          handleRevalidation("schoolCollection"),
          handleRevalidation("schoolInfoCollection"),
          handleRevalidation("schoolSinglebyslugCollection"),
          handleRevalidation("productsCollection"),
          handleRevalidation("categoryCollections"),
          handleRevalidation("orderCollection"),
          handleRevalidation("orderInfo"),
          handleRevalidation("manageUsersCollection"),
          handleRevalidation("siteContentCollection"),
          handleRevalidation("SubmissionDataCollection"),
          handleRevalidation("bursarInboxCollection"),
        ]);
        await fetchUser();
        const removedCount = Number(res.data?.data?.removedUploadsCount || 0);
        toast.success(
          removedCount > 0
            ? `Demo database restored and ${removedCount} temporary upload${removedCount === 1 ? "" : "s"} cleaned`
            : "Demo database restored to clean seed snapshot"
        );
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to reset demo database";
      toast.error(message);
      return false;
    }
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthenticationContext.Provider
      value={{
        ...authState,
        setAuthState,
        fetchUser,
        demoStatus,
        unlockOwnerMode,
        lockOwnerMode,
        resetDemoDatabase,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export default AuthContext;
export const useAuthContext = (): AuthState => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContext");
  }
  return context;
};
