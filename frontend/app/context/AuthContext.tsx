"use client";
import { SERVERURLAPI } from "@/lib/constants";
import axios from "axios";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCookie } from "../utility/handleCookie";
import useAuth from "../hooks/useAuth";
import { IUser } from "../types/User";

interface State {
  loading: boolean;
  error: string | null;
  data: IUser | null;
}

interface AuthState extends State {
  setAuthState: Dispatch<SetStateAction<State>>;
  fetchUser: () => Promise<void>;
}

export const AuthenticationContext = createContext<AuthState>({
  loading: false,
  error: null,
  data: null,
  fetchUser: async () => {},
  setAuthState: () => {},
});

const AuthContext = ({ children }: { children: ReactNode }) => {
  const { signout } = useAuth();
  const [authState, setAuthState] = useState<State>({
    loading: true,
    error: null,
    data: null,
  });

  const fetchUser = async () => {
    setAuthState((prev) => ({
      ...prev,
      loading: prev.data === null,
      error: null,
    }));

    try {
      const jwt = await getCookie("jwt");
      if (!jwt) {
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
      signout();
      setAuthState({
        loading: false,
        error: errorMessage,
        data: null,
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <AuthenticationContext.Provider
      value={{
        ...authState,
        setAuthState,
        fetchUser,
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
    throw new Error("useNavbarContext must be used within a NavbarProvider");
  }
  return context;
};
