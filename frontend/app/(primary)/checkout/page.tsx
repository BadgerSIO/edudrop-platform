import React, { Suspense } from "react";
import { Metadata } from "next";
import Hero from "./components/Hero";
import CheckoutFormWrapper from "./components/CheckoutFormWrapper";
import EduDropLoader from "@/app/sharedComponents/Loders/EduDropLoader";

export const metadata: Metadata = {
  title: "Sponsorship Checkout | EduDrop Foundation",
  description:
    "Direct gate delivery with zero overhead diversion. Your contribution directly provisions physical classroom supplies for verified partner schools.",
};

const Checkout = () => {
  return (
    <main className="min-h-screen bg-surface-canvas">
      <Hero />
      <Suspense
        fallback={
          <EduDropLoader
            size="md"
            label="Loading checkout options..."
            sublabel="Preparing verified school recipients & cart summary"
          />
        }
      >
        <CheckoutFormWrapper />
      </Suspense>
    </main>
  );
};

export default Checkout;
