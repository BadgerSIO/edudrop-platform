"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { SERVERURLAPI } from "@/lib/constants";
import { useAuthContext } from "./AuthContext"; // Import your authentication context
import { getCookie } from "../utility/handleCookie";

interface NotificationContextState {
  notifications: any[]; // Use the correct type for notifications
  notificationLoading: boolean;
  error: string | null;
}

interface NotificationContextProps {
  children: ReactNode;
}

interface NotificationContext extends NotificationContextState {
  setNotificationState: Dispatch<SetStateAction<NotificationContextState>>;
  fetchNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContext>({
  notifications: [],
  notificationLoading: false,
  error: null,
  setNotificationState: () => {},
  fetchNotifications: async () => {},
});

const NotificationContextProvider = ({
  children,
}: NotificationContextProps) => {
  const { data } = useAuthContext();
  const [notificationState, setNotificationState] =
    useState<NotificationContextState>({
      notifications: [],
      notificationLoading: false,
      error: null,
    });

  const fetchNotifications = async () => {
    setNotificationState((prevState) => ({
      ...prevState,
      notificationLoading: true,
      error: null,
    }));
    const jwt = await getCookie("jwt");
    if (!jwt) {
      return;
    }
    try {
      const response = await axios.get(`${SERVERURLAPI}/notification/by-user`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.status === 200) {
        setNotificationState({
          notifications: response?.data?.data,
          notificationLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotificationState({
        notifications: [],
        notificationLoading: false,
        error: "Error fetching notifications",
      });
    }
  };

  useEffect(() => {
    if (data && data.email !== undefined) {
      fetchNotifications();
    }
  }, [data?.email]);

  return (
    <NotificationContext.Provider
      value={{
        ...notificationState,
        setNotificationState,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContextProvider;

export const useNotificationContext = (): NotificationContext => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationContextProvider",
    );
  }
  return context;
};
