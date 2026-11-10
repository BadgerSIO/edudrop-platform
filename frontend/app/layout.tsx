import "./globals.css";
import "./custom.css";
import { hk_g } from "./font";
import Provider from "./utility/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduDrop — Every Drop Counts for Education",
  description:
    "Sponsor clean spring water, hydration dispensers, and essential classroom supplies directly for partner schools through the EduDrop Foundation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={hk_g.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
