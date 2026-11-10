import { Toaster } from "react-hot-toast";

import Footer from "../sharedComponents/Footer";
import Navbar from "../sharedComponents/Navbar";
import AuthContext from "../context/AuthContext";
import { NavbarProvider } from "../context/NavContext";
import NotificationContextProvider from "../context/NotificationContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContext>
      <NavbarProvider>
        <NotificationContextProvider>
          <main>
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </main>
        </NotificationContextProvider>
      </NavbarProvider>
    </AuthContext>
  );
}
