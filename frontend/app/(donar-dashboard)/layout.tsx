import React, { Suspense } from "react";
import DashNav from "@/app/sharedComponents/Navigation/DashNav";
import Sidebar from "./donar-dashboard/components/Sidebar";
import { Toaster } from "react-hot-toast";
import AuthContext from "../context/AuthContext";
import Breadcrumb from "../sharedComponents/Breadcrumb";
import DashNavLoading from "../sharedComponents/Loders/DashNavLoading";
import SideBarLoading from "../sharedComponents/Loders/SideBarLoading";
import { NavbarProvider } from "../context/NavContext";
import NotificationContextProvider from "../context/NotificationContext";

const DonarDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext>
      <NavbarProvider>
        <NotificationContextProvider>
          <div className="grid min-h-screen grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] grid-rows-[80px_1fr] bg-surface-bento/50 text-text-ink">
            <Suspense fallback={<DashNavLoading />}>
              <DashNav />
            </Suspense>
            <Suspense fallback={<SideBarLoading />}>
              <Sidebar />
            </Suspense>
            <main className="col-start-2 row-start-2 min-w-0 overflow-x-hidden px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="mx-auto max-w-[1440px]">
                <Breadcrumb />
                {children}
              </div>
            </main>
            <Toaster />
          </div>
        </NotificationContextProvider>
      </NavbarProvider>
    </AuthContext>
  );
};

export default DonarDashboardLayout;
